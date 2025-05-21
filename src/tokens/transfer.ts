import { P2PKH, PublicKey, Transaction } from '@bsv/sdk'
import { Wallet } from '@bsv/wallet-toolbox'

export const transferFunds = async (
  w1: Wallet,
  w2: Wallet,
  satoshis: number
) => {
  const address = PublicKey.fromString(w2.identityKey).toAddress()
  const lock = new P2PKH().lock(address)

  const car = await w1.createAction({
    outputs: [
      {
        lockingScript: lock.toHex(),
        satoshis,
        outputDescription: 'funding'
      }
    ],
    description: 'funding',
    options: {
      randomizeOutputs: false,
      acceptDelayedBroadcast: false
    }
  })

  const outpoint = `${car.txid}.0`

  const unlock = new P2PKH().unlock(w2.keyDeriver.rootKey)

  const input = await w2.createAction({
    inputBEEF: car.tx,
    inputs: [
      {
        outpoint: outpoint,
        unlockingScriptLength: await unlock.estimateLength(),
        inputDescription: 'funding input'
      }
    ],
    description: 'funding intern'
  })

  const st = input.signableTransaction!
  const tx = Transaction.fromAtomicBEEF(st.tx)

  tx.inputs[0].unlockingScriptTemplate = unlock
  await tx.sign()

  if (!tx.inputs[0].unlockingScript) throw 'FUNDING UNLOCKING FAILED'

  const unlockingScript = tx.inputs[0].unlockingScript!.toHex()

  const sar = await w2.signAction({
    reference: st.reference,
    spends: { 0: { unlockingScript } },
    options: {
      acceptDelayedBroadcast: false
    }
  })

  console.log('Funding successful: ', sar.txid)
  console.log()
}
