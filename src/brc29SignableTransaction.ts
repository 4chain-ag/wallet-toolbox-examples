import { inspect } from 'node:util'
import dotenv from 'dotenv'

import {
  randomBytesBase64,
  ScriptTemplateBRC29,
  Setup
} from '@bsv/wallet-toolbox'
import { Transaction } from '@bsv/sdk'
import { sdk } from '@bsv/wallet-toolbox'

dotenv.config({ path: `${__dirname}/.env` })

export async function outputBRC29_SignableTransaction(
  network: sdk.Chain,
  satoshis: number = 1000
) {
  const env = Setup.getEnv(network)
  const setup = await Setup.createWalletClient({ env })
  const setup2 = await Setup.createWalletClient({
    env,
    rootKeyHex: env.devKeys[env.identityKey2]
  })

  const derivationPrefix = randomBytesBase64(8)
  const derivationSuffix = randomBytesBase64(8)
  const { keyDeriver } = setup

  const t = new ScriptTemplateBRC29({
    derivationPrefix,
    derivationSuffix,
    keyDeriver
  })

  // Use this label the new transaction can be found by `listActions` and as a "description" value.
  const label = 'outputBRC29'

  const result = await setup.wallet.createAction({
    outputs: [
      {
        lockingScript: t
          .lock(setup.rootKey.toString(), setup2.identityKey)
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
      randomizeOutputs: false,
      // This example prefers to immediately wait for the new transaction to be broadcast to the network.
      // Typically, most production applications benefit from performance gains when broadcasts are handled in the background.
      acceptDelayedBroadcast: false,

      // false - processAction (broadcasting) is skipped - it means "signableTransaction"
      signAndProcess: false
    },
    labels: [label],
    description: label
  })

  console.log('createAction result', inspect(result, false, null, true))

  const signableTransaction = Transaction.fromBEEF(
    result.signableTransaction?.tx!
  )
  console.log(
    'signable transaction',
    inspect(signableTransaction, false, null, true)
  )
}

outputBRC29_SignableTransaction('test', 1)
  .then(() => process.exit(0))
  .catch(console.error)
