import dotenv from 'dotenv'
import { randomBytesBase64, ScriptTemplateBRC29, sdk, Services, Setup } from '@bsv/wallet-toolbox'
import { inspect } from 'node:util'
import { InternalizeActionArgs, PrivateKey, Transaction } from '@bsv/sdk'

dotenv.config({ path: `${__dirname}/.env` })

export async function goDemo(network: sdk.Chain, txid: string) {
  try {
    await faucetInternalize(network, txid)
  } catch (err) {
    console.error('Error in faucetInternalize:', err)
    return
  }

  try {
    await outputBRC29_SignableTransaction(network)
  } catch (err) {
    console.error('Error in createAction:', err)
    return
  }
}

goDemo(
  'test',
  'e1f6f549d173531f5273e5e3e1ff4d5ac1985050068ea31dc8ee2d3b3a13b7e1'
)
  .then(() => process.exit(0))
  .catch(console.error)


export async function faucetInternalize(network: sdk.Chain, txid: string) {
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
  await storage.destroy()
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
  console.log(
    'signable transaction',
    signableTransaction
  )
}
