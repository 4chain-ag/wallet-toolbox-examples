import { derivationParts } from '../utils/derivation-prefix-suffix'
import { sdk, Setup, Services } from '@bsv/wallet-toolbox'
import { InternalizeActionArgs, WalletPayment } from '@bsv/sdk'
import { Beef } from '@bsv/sdk'
import { wocAPIGetBeefForTX } from './woc-api-get-beef-for-tx'

export async function faucetInternalize(
  network: sdk.Chain,
  txid: string,
  vout: number = 0,
  paymentRemittance?: WalletPayment
) {
  // Setup
  const env = Setup.getEnv(network)
  const setup1 = await Setup.createWalletClient({ env })

  let beef: Beef
  try {
    beef = await wocAPIGetBeefForTX(network, txid)
  } catch (e) {
    console.warn("failed to get beef directly from woc API, falling back to storage")
    const storage = await Setup.createStorageKnex({
      knex: Setup.createSQLiteKnex('getbeef.sqlite'),
      databaseName: 'getbeef',
      env
    })
    storage.setServices(new Services(env.chain))

    beef = await storage.getBeefForTransaction(txid, {})

    await storage.destroy()
  }

  if (paymentRemittance == undefined) {
    paymentRemittance = derivationParts().paymentRemittance
  }

  const args: InternalizeActionArgs = {
    tx: beef.toBinaryAtomic(txid),
    outputs: [
      {
        outputIndex: vout,
        protocol: 'wallet payment',
        paymentRemittance
      }
    ],
    description: 'from faucet top up'
  }

  console.log("===================== Internalizing Action =====================")
  const tempArgs = {
    ...args,
    tx: beef.toHex()
  }
  console.log(JSON.stringify(tempArgs, null, 2))
  console.log("=================================================================")

  const iwpr = await setup1.wallet.internalizeAction(args)
  console.log(JSON.stringify(iwpr))
}
