import { KeyDeriver, PrivateKey } from '@bsv/sdk'
import {
  Monitor,
  Services,
  Setup,
  StorageKnex,
  Wallet,
  WalletStorageManager
} from '@bsv/wallet-toolbox'

export const createWallet = async (
  privateKey: PrivateKey,
  storageName: string
) => {
  const storageIdentityKey = privateKey.toPublicKey().toString()

  const activeStorage = new StorageKnex({
    chain: 'test',
    knex: Setup.createSQLiteKnex(`src/tokens/db/${storageName}.sqlite`),
    commissionSatoshis: 0,
    feeModel: JSON.parse('{"model":"sat/kb","value":1}')
  })

  await activeStorage.migrate(storageName, storageIdentityKey)
  await activeStorage.makeAvailable()

  const storage = new WalletStorageManager(storageIdentityKey, activeStorage)
  await storage.makeAvailable()

  const servOpts = Services.createDefaultOptions('test')
  servOpts.taalApiKey = 'testnet_0e6cf72133b43ea2d7861da2a38684e3'
  const services = new Services(servOpts)

  const monopts = Monitor.createDefaultWalletMonitorOptions('test', storage)
  const monitor = new Monitor(monopts)
  monitor.addDefaultTasks()

  const wallet = new Wallet({
    chain: 'test',
    keyDeriver: new KeyDeriver(privateKey),
    storage: storage,
    services: services,
    monitor: monitor
  })

  return wallet
}
