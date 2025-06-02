import { Beef } from '@bsv/sdk'
import {
  randomBytesBase64,
  ScriptTemplateBRC29,
  sdk,
  Setup,
  SetupWallet
} from '@bsv/wallet-toolbox'
import { getWallets } from '../utils/get-wallets'

export interface OutputBRC29 {
  beef: Beef
  outpoint: string
  fromIdentityKey: string
  satoshis: number
  derivationPrefix: string
  derivationSuffix: string
}

/**
 * Create a new BRC29 output.
 *
 * Convert the destination identity key into its associated address and use that to generate a locking script.
 *
 * Explicitly specify the new output to be created as part of a new action (transaction).
 *
 * When outputs are explictly added to an action they must be funded:
 * Typically, at least one "change" input will be automatically added to fund the transaction,
 * and at least one output will be added to recapture excess funding.
 */
export async function outputBRC29(
  network: sdk.Chain,
  satoshis: number,
  opts: {
    wallet?: SetupWallet
    toIdentityKey?: string
    acceptDelayedBroadcast: boolean
  } = { acceptDelayedBroadcast: false }
): Promise<OutputBRC29> {
  const setupWallet = opts.wallet || (await getWallets(network).setup1)
  const toIdentityKey =
    opts.toIdentityKey || (await getWallets(network).setup2).identityKey

  const derivationPrefix = randomBytesBase64(8)
  const derivationSuffix = randomBytesBase64(8)
  const { keyDeriver } = setupWallet

  const t = new ScriptTemplateBRC29({
    derivationPrefix,
    derivationSuffix,
    keyDeriver
  })

  // Use this label the new transaction can be found by `listActions` and as a "description" value.
  const label = 'outputBRC29'

  // This call to `createAction` will create a new funded transaction containing the new output,
  // as well as sign and broadcast the transaction to the network.
  const car = await setupWallet.wallet.createAction({
    outputs: [
      // Explicitly specify the new output to be created.
      // When outputs are explictly added to an action they must be funded:
      // Typically, at least one "change" input will automatically be added to fund the transaction,
      // and at least one output will be added to recapture excess funding.
      {
        lockingScript: t
          .lock(setupWallet.rootKey.toString(), toIdentityKey)
          .toHex(),
        satoshis,
        outputDescription: label,
        tags: ['relinquish'],
        customInstructions: JSON.stringify({
          derivationPrefix,
          derivationSuffix,
          type: 'BRC29'
        })
      }
    ],
    options: {
      // Turn off automatic output order randomization to avoid having to figure out which output is the explicit one.
      // It will always be output zero.
      randomizeOutputs: false,
      // This example prefers to immediately wait for the new transaction to be broadcast to the network.
      // Typically, most production applications benefit from performance gains when broadcasts are handled in the background.
      acceptDelayedBroadcast: opts.acceptDelayedBroadcast
    },
    labels: [label],
    description: label
  })

  // Both the "tx" and "txid" results are expected to be valid when an action is created that does not need explicit input signing,
  // and when the "signAndProcess" option is allowed to default to true.

  // The `Beef` class is used here to decode the AtomicBEEF binary format of the new transaction.
  const beef = Beef.fromBinary(car.tx!)
  // The outpoint string is constructed from the new transaction's txid and the output index: zero.
  const outpoint = `${car.txid!}.0`

  console.log(`
outputBRC29
fromIdentityKey ${setupWallet.identityKey}
toIdentityKey ${toIdentityKey}
derivationPrefix ${derivationPrefix}
derivationSuffix ${derivationSuffix}
outpoint ${outpoint}
satoshis ${satoshis}
BEEF
${beef.toHex()}
${beef.toLogString()}
`)

  // Return the bits and pieces of the new output created.
  return {
    beef,
    outpoint,
    fromIdentityKey: setupWallet.identityKey,
    satoshis,
    derivationPrefix,
    derivationSuffix
  }
}
