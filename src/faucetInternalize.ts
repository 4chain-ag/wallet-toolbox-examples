import { Services, Setup } from '@bsv/wallet-toolbox'
import { InternalizeActionArgs, PrivateKey } from '@bsv/sdk'
import dotenv from 'dotenv'
import { derivationParts } from './utils/derivation-prefix-suffix'
dotenv.config({ path: `${__dirname}/.env` })
type Chain = 'main' | 'test'

export async function faucetInternalize(network: Chain, txid: string) {
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

faucetInternalize(
  'test',
  '237163f5a05e3cce29c84a3360bc8c66e68bfb083d532c03f9bdfda9cf481052'
).then(() => process.exit(0)).catch(console.error)
