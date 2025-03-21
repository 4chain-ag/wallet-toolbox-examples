import {sdk, Setup, SetupEnv, SetupWallet, StorageClient} from '@bsv/wallet-toolbox'
import { runArgv2Function } from './runArgv2Function'
import dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/.env` })
/**
 * @publicbody
 */
export async function backup(): Promise<void> {
  const env = Setup.getEnv('test')
  await backupWalletClient(env, env.identityKey)
}

/**
 * @publicbody
 */
export async function backupWalletClient(
  env: SetupEnv,
  identityKey: string
): Promise<void> {
  const setup = await Setup.createWalletClient({
    env,
    rootKeyHex: env.devKeys[identityKey]
  })
  await backupToSQLite(setup)
  await setup.wallet.destroy()
}

/**
 * @publicbody
 */
export async function backupToSQLite(
  setup: SetupWallet,
  filePath?: string,
  databaseName?: string
): Promise<void> {

  const backup = new StorageClient(setup.wallet, 'http://localhost:8100')

  await setup.storage.addWalletStorageProvider(backup)
  await setup.storage.setActive("02a36812c25aa167c4f23eaeecc8b91c89d5e06b278db11e53c11f57f6f1fd4ca5")
  await setup.storage.updateBackups()
}

runArgv2Function(module.exports)
