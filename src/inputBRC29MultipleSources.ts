import {
  faucetAddress,
  faucetInternalize,
  OutputBRC29,
  outputBRC29,
  userCouldProvideTransactionID
} from './act'
import { runArgv2Function } from './runArgv2Function'
import { ScriptTemplateBRC29, sdk } from '@bsv/wallet-toolbox'
import { getWallets } from './utils/get-wallets'
import { Beef, KeyDeriver, P2PKH, SignActionArgs } from '@bsv/sdk'
import { SatoshiValue } from '@bsv/sdk/dist/esm/src/wallet'

export async function inputBRC29MultipleSources() {
  const network = 'test' // or 'main'
  await faucetAddress(network)
  const txId = await userCouldProvideTransactionID()
  if (!!txId) {
    await faucetInternalize(network, txId)
    console.log('Internalized transaction ID:', txId)
  }

  console.log('======================================================')
  console.log('Making output transaction ...')
  const out = await outputBRC29(network, 100)

  console.log('======================================================')
  console.log('Making input transaction ...')
  await createActionWithSeveralInputsAndOutputs(network, out)
}

async function createActionWithSeveralInputsAndOutputs(
  network: sdk.Chain,
  outputBRC29: OutputBRC29
) {
  const { satoshis, beef: inputBeef, outpoint } = outputBRC29

  const setupWallet = await getWallets(network).setup2

  const { keyDeriver } = setupWallet

  const inputFromOutput = inputFromOutputBRC29(keyDeriver, outputBRC29)

  const label = 'complex'

  const outputLockingScript = new P2PKH().lock(
    keyDeriver.rootKey.toAddress(`${network}net`)
  )
  const outputSatoshis: SatoshiValue = 200

  /**
   * Creating an action with an input that requires it's own signing template is a two step process.
   * The call to createAction must include only the expected maximum script length of the unlockingScript.
   * This causes a "signableTransaction" to be returned instead of a completed "txid" and "tx".
   */
  const car = await setupWallet.wallet.createAction({
    /**
     * An inputBEEF is always required when there are explicit inputs to the new action.
     * This beef must include each transaction with a corresponding outpoint txid.
     * Unlike an AtomicBEEF, inputBEEF validates the transactions containing the outpoints,
     * and may contain multiple unrelated transaction subtrees.
     */
    inputBEEF: inputBeef.toBinary(),
    inputs: [inputFromOutput],
    outputs: [
      {
        lockingScript: outputLockingScript.toHex(),
        satoshis: outputSatoshis,
        outputDescription: label,
        basket: 'myBasket',
        tags: ['out'],
        customInstructions: JSON.stringify({
          key: 'root',
          type: 'P2PKH2'
        })
      }
    ],
    labels: [label],
    description: label
  })

  /**
   * Here is the essense of using `signAction` and custom script template:
   *
   * The `tx` property of the `signableTransaction` result can be parsed using
   * the standard `Beef` class, but it is not an ordinary valid AtomicBEEF for the
   * simple reason that the transaction has not been fully signed.
   *
   * You can either use the method shown here to obtain a signable `Transaction` object
   * from this beef or you can use the `Transaction.fromAtomicBEEF` method.
   *
   * To sign an input, set the corresponding input's `unlockingScriptTemplate` to an appropriately
   * initialized unlock object and call the `Transaction` `sign` method.
   *
   * Once signed, capture the now valid `unlockingScript` valoue for the input and convert it to a hex string.
   */
  const st = car.signableTransaction!
  const beef = Beef.fromBinary(st.tx)
  const tx = beef.findAtomicTransaction(beef.txs.slice(-1)[0].txid)!
  tx.inputs[0].unlockingScriptTemplate = inputFromOutput.unlock
  await tx.sign()
  const unlockingScript = tx.inputs[0].unlockingScript!.toHex()

  /**
   * Note that the `signArgs` use the `reference` property of the `signableTransaction` result to
   * identify the `createAction` result to finish processing and optionally broadcasting.
   */
  const signArgs: SignActionArgs = {
    reference: st.reference,
    spends: { 0: { unlockingScript } },
    options: {
      // Force an immediate broadcast of the signed transaction.
      acceptDelayedBroadcast: false
    }
  }

  /**
   * Calling `signAction` completes the action creation process when inputs must be signed
   * using specific script templates.
   */
  const sar = await setupWallet.wallet.signAction(signArgs)

  // This completes the example by logging evidence of what was created.
  {
    const beef = Beef.fromBinary(sar.tx!)
    const txid = sar.txid!

    console.log(`
inputP2PKH to ${setupWallet.identityKey}
input's outpoint ${outpoint}
satoshis ${satoshis}
txid ${txid}
BEEF
${beef.toHex()}
${beef.toLogString()}
`)
  }
}

function inputFromOutputBRC29(
  keyDeriver: KeyDeriver,
  outputBRC29: OutputBRC29
) {
  const {
    derivationPrefix,
    derivationSuffix,
    outpoint,
    fromIdentityKey,
    satoshis
  } = outputBRC29

  const t = new ScriptTemplateBRC29({
    derivationPrefix,
    derivationSuffix,
    keyDeriver
  })

  // Construct an "unlock" object which is then associated with the input to be signed
  // such that when the "sign" method is called, a signed "unlockingScript" is computed for that input.
  const unlock = t.unlock(
    keyDeriver.rootKey.toString(),
    fromIdentityKey,
    satoshis
  )

  return {
    outpoint,
    // The value of 108 is a constant for the BRC29 template.
    // You could use the `unlock.estimateLength` method to obtain it.
    // Or a quick look at the P2PKH source code to confirm it.
    unlockingScriptLength: t.unlockLength,
    inputDescription: 'From outputBRC29',
    unlock
  }
}

runArgv2Function(module.exports)
