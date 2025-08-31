import { PrivateKey, Transaction } from '@bsv/sdk'
import { createWallet } from './utils'
import {
  createToken,
  getToken,
  mintToken,
  TokenCustomInstructions,
  unlockToken
} from './tokens'
import { internalizeSwap } from './internalizeSwap'
import { Wallet } from '@bsv/wallet-toolbox'
import { transferFunds } from './transfer'
import { WIF1, WIF2, WIF3 } from './wifs'

const swap = async () => {
  const pk1 = PrivateKey.fromWif(WIF1)
  const pk2 = PrivateKey.fromWif(WIF2)
  const pk3 = PrivateKey.fromWif(WIF3)

  const w1 = await createWallet(pk1, 'wallet1')
  const w2 = await createWallet(pk2, 'wallet2')
  const w3 = await createWallet(pk3, 'wallet3')

  await transferFunds(w1, w2, 20)
  await transferFunds(w1, w3, 20)

  await mintToken(w3, 'w3-whiterock-token')
  await mintToken(w2, 'w2-redrock-token')

  console.log('Wallet 1 balance', await w1.balance())
  console.log('Wallet 2 balance', await w2.balance())
  console.log('Wallet 3 balance', await w3.balance())
  console.log()

  await swapTokens(w1, w2, w3)

  console.log(
    '\nWallet 2 tokens: ',
    await w2.listOutputs({
      basket: 'tokens',
      includeCustomInstructions: true,
      include: 'locking scripts'
    })
  )
  console.log(
    '\nWallet 3 tokens: ',
    await w3.listOutputs({
      basket: 'tokens',
      includeCustomInstructions: true,
      include: 'locking scripts'
    })
  )

  await w1.destroy()
  await w2.destroy()
  await w3.destroy()
}

const swapTokens = async (w1: Wallet, w2: Wallet, w3: Wallet) => {
  const w2Token = await getToken(w2)
  const w2Instructions: TokenCustomInstructions = JSON.parse(
    w2Token.customInstructions!
  )
  const w3Token = await getToken(w3)
  const w3Instructions: TokenCustomInstructions = JSON.parse(
    w3Token.customInstructions!
  )

  const beefW2 = await w2.storage.runAsStorageProvider(async sp => {
    const b = await sp.getBeefForTransaction(w2Token.outpoint.split('.')[0], {})
    return b
  })

  const finalInputBeef = await w3.storage.runAsStorageProvider(async sp => {
    const b = await sp.getBeefForTransaction(w3Token.outpoint.split('.')[0], {
      mergeToBeef: beefW2
    })
    return b
  })

  const token1 = await createToken(w2, w2Instructions.data, w3.identityKey) // from w2 to w3
  const token2 = await createToken(w3, w3Instructions.data, w2.identityKey) // from w3 to w2

  const create = await w1.createAction({
    inputBEEF: finalInputBeef.toBinary(),
    inputs: [
      {
        outpoint: w2Token.outpoint,
        inputDescription: 'token from wallet 2',
        unlockingScriptLength: 73 // this is the PushDrop unlocking script length (from wallet-toolbox-examples)
        // unlockingScript: 'we could do it that way',
      },
      {
        outpoint: w3Token.outpoint,
        inputDescription: 'token from wallet 3',
        unlockingScriptLength: 73 // this is the PushDrop unlocking script length (from wallet-toolbox-examples)
        // unlockingScript: 'we could do it that way',
      }
    ],
    outputs: [
      {
        lockingScript: token1.lockingScript.toHex(),
        satoshis: 1,
        customInstructions: JSON.stringify(token1.customInstructions),
        outputDescription: 'token 1 swap'
      },
      {
        lockingScript: token2.lockingScript.toHex(),
        satoshis: 1,
        customInstructions: JSON.stringify(token2.customInstructions),
        outputDescription: 'token 2 swap'
      }
    ],
    description: 'token swap',
    options: {
      randomizeOutputs: false
    }
  })

  const st = create.signableTransaction
  if (!st) throw 'UNDEFINED SignableTransaction'

  const unlockerW2 = await unlockToken(w2, w2Instructions)
  const unlockerW3 = await unlockToken(w3, w3Instructions)

  const tx = Transaction.fromAtomicBEEF(st.tx)
  tx.inputs[0].unlockingScriptTemplate = unlockerW2
  tx.inputs[1].unlockingScriptTemplate = unlockerW3

  await tx.sign()

  const unlockingScript1 = tx.inputs[0].unlockingScript
  const unlockingScript2 = tx.inputs[1].unlockingScript

  if (!unlockingScript1 || !unlockingScript2) throw 'UNLOCKING FAILED'

  const sar = await w1.signAction({
    reference: st.reference,
    spends: {
      0: { unlockingScript: unlockingScript1.toHex() },
      1: { unlockingScript: unlockingScript2.toHex() }
    },
    options: {
      acceptDelayedBroadcast: false // wait for broadcasting (otherwise it will happen async)
    }
  })

  if (!sar.tx || !sar.txid) {
    throw new Error('Could not obtain SIGN BEEF TX')
  }

  console.log('TOKEN SWAP DONE: ', sar.txid)
  console.log()

  // relinquish old outputs
  w2.relinquishOutput({
    basket: 'tokens',
    output: w2Token.outpoint
  })
  w3.relinquishOutput({
    basket: 'tokens',
    output: w3Token.outpoint
  })

  await internalizeSwap(w3, sar.tx, 0, 'tokens', token1.customInstructions)
  await internalizeSwap(w2, sar.tx, 1, 'tokens', token2.customInstructions)
}

swap().catch(console.error)
