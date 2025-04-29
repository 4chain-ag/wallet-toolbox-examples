import { Services, Setup } from '@bsv/wallet-toolbox'
import { InternalizeActionArgs, PrivateKey } from '@bsv/sdk'
import dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/.env` })
type Chain = 'main' | 'test'

export async function faucetInternalize(network: Chain, txid: string) {
  // Setup
  const derivationPrefix = 'SfKxPIJNgdI='
  const derivationSuffix = 'NaGLC6fMH50='

  const env = Setup.getEnv(network)
  const setup1 = await Setup.createWalletClient({ env })

  const storage = await Setup.createStorageKnex({
    knex: Setup.createSQLiteKnex('getbeef.sqlite'),
    databaseName: 'getbeef',
    env
  })
  storage.setServices(new Services(env.chain))

  const beef = await storage.getBeefForTransaction(txid, {})

  const args: InternalizeActionArgs = {
    tx: beef.toBinaryAtomic(txid),
    outputs: [
      {
        outputIndex: 0,
        protocol: 'wallet payment',
        paymentRemittance: {
          derivationPrefix: derivationPrefix,
          derivationSuffix: derivationSuffix,
          senderIdentityKey: new PrivateKey(1).toPublicKey().toString()
        }
      }
    ],
    description: 'from faucet top up'
  }

  const iwpr = await setup1.wallet.internalizeAction(args)
  console.log(JSON.stringify(iwpr))
  await setup1.storage.destroy()
}

faucetInternalize(
  'test',
  '06a4fd092ada6f916f0d8fdb001d5e647c832d108ac0068466ad9f6e82b3c30c'
).then(() => process.exit(0)).catch(console.log)
