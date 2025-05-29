import dotenv from 'dotenv'
import {
  randomBytesBase64,
  ScriptTemplateBRC29,
  sdk,
  Services,
  Setup
} from '@bsv/wallet-toolbox'
import { inspect } from 'node:util'
import { InternalizeActionArgs, Transaction } from '@bsv/sdk'
import { derivationParts } from './utils/derivation-prefix-suffix'

dotenv.config({ path: `${__dirname}/.env` })

export async function goDemo(network: sdk.Chain, txid: string) {
  try {
    await faucetInternalize(network, txid)
  } catch (err) {
    console.error('Error in faucetInternalize:', err)
    return
  }

  try {
    await outputBRC29(network)
  } catch (err) {
    console.error('Error in createAction:', err)
    return
  }
}

goDemo(
  'test',
  '7563763442cc4118c45682f9db40a1756825b370801db4dfc46a1ee8f94c900e'
)
  .then(() => process.exit(0))
  .catch(console.error)

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

  const { paymentRemittance } = derivationParts()

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

export async function outputBRC29(network: sdk.Chain, satoshis: number = 1000) {
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
      signAndProcess: true
    },
    labels: [label],
    description: label
  })

  console.log('createAction result', inspect(result, false, null, true))
}

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
  console.log('signable transaction', signableTransaction)
}
