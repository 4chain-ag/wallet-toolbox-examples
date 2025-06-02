import { ScriptTemplateBRC29, Services, Setup } from '@bsv/wallet-toolbox'
import { Beef, SignActionArgs } from '@bsv/sdk'
import dotenv from 'dotenv'

dotenv.config({ path: `${__dirname}/.env` })
type Chain = 'main' | 'test'

export async function createWithUnknownInput(network: Chain) {
  // Setup
  const txid =
    'b0cd957b74c3a6e61c452b82bc21ee1617bb428045069e3b54899b062f282d8a'
  const derivationPrefix = 'Q6EdztJ8Zeyx4wc6YBJqjg=='
  const derivationSuffix = 'EdCbVs+hVv3mY0PEoeeTUQ=='
  const vout = 3
  const label = 'inputBRC29'

  const env = Setup.getEnv(network)
  const setup1 = await Setup.createWalletClient({ env })

  const storage = await Setup.createStorageKnex({
    knex: Setup.createSQLiteKnex('getbeef.sqlite'),
    databaseName: 'getbeef',
    env
  })
  storage.setServices(new Services(env.chain))

  const beef = await storage.getBeefForTransaction(txid, {})

  const createActionResult = await setup1.wallet.createAction({
    inputBEEF: beef.toBinaryAtomic(txid),
    inputs: [
      {
        outpoint: `${txid}.${vout}`,
        unlockingScriptLength: 108,
        inputDescription: label
      }
    ],
    labels: [label],
    description: label
  })

  const t = new ScriptTemplateBRC29({
    derivationPrefix,
    derivationSuffix,
    keyDeriver: setup1.keyDeriver
  })

  const unlock = t.unlock(
    setup1.rootKey.toString(),
    setup1.identityKey,
    beef.findTransactionForSigning(txid)!.outputs[vout].satoshis
  )

  const st = createActionResult.signableTransaction!
  const returnedBEEF = Beef.fromBinary(st.tx)
  const tx = returnedBEEF.findAtomicTransaction(
    returnedBEEF.txs.slice(-1)[0].txid
  )!
  tx.inputs[0].unlockingScriptTemplate = unlock
  await tx.sign()
  const unlockingScript = tx.inputs[0].unlockingScript!.toHex()

  console.log(`
CREATE ACTION RESULT (SIGNABLE TRANSACTION)
txid ${createActionResult.txid}
BEEF
${returnedBEEF.toHex()}
${returnedBEEF.toLogString()}
`)

  /**
   * Note that the `signArgs` use the `reference` property of the `signableTransaction` result to
   * identify the `createAction` result to finish processing and optionally broadcasting.
   */
  const signArgs: SignActionArgs = {
    reference: st.reference,
    spends: { 0: { unlockingScript } },
    options: {
      acceptDelayedBroadcast: false
    }
  }

  const signActionResult = await setup1.wallet.signAction(signArgs)

  const signedBEEF = Beef.fromBinary(signActionResult.tx!)

  console.log(`
SIGN ACTION RESULT
txid ${signActionResult.txid}
BEEF
${signedBEEF.toHex()}
${signedBEEF.toLogString()}
`)

  await storage.destroy()
}

createWithUnknownInput('test')
  .then(() => process.exit(0))
  .catch(console.error)
