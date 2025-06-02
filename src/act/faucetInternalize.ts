import { derivationParts } from '../utils/derivation-prefix-suffix'
import { sdk, Setup, Services } from '@bsv/wallet-toolbox'
import { InternalizeActionArgs, PrivateKey } from '@bsv/sdk'

export async function faucetInternalize(network: sdk.Chain, txid: string) {
  // Setup
  const env = Setup.getEnv(network)
  const setup1 = await Setup.createWalletClient({ env })

  const storage = await Setup.createStorageKnex({
    knex: Setup.createSQLiteKnex('getbeef.sqlite'),
    databaseName: 'getbeef',
    env
  })
  storage.setServices(new Services(env.chain))

  const beef = await storage.getBeefForTransaction(txid, {})

  const {paymentRemittance} = derivationParts()

  const args: InternalizeActionArgs = {
    tx: beef.toBinaryAtomic(txid),
    outputs: [
      {
        outputIndex: 0,
        protocol: 'wallet payment',
        paymentRemittance
      }
    ],
    description: 'from faucet top up'
  }

  const iwpr = await setup1.wallet.internalizeAction(args)
  console.log(JSON.stringify(iwpr))
  await storage.destroy()
}
