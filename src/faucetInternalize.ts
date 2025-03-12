import { Services, Setup } from '@bsv/wallet-toolbox'
import { InternalizeActionArgs, PrivateKey } from '@bsv/sdk'

export async function faucetInternalize(txid: string) {
  // Setup
  const derivationPrefix = 'SfKxPIJNgdI='
  const derivationSuffix = 'NaGLC6fMH50='

  const env = Setup.getEnv('test')
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
  '72edeb04163375dcab28c3e81010a13b1f632e995e951c18ac3f2c51a438c12a'
).catch(console.log)
