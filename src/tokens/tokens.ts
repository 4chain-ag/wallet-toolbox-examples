import { PushDrop, Random, Utils, WalletProtocol } from '@bsv/sdk'
import { Wallet } from '@bsv/wallet-toolbox'

export type TokenCustomInstructions = {
  protocolID: WalletProtocol
  keyID: string
  counterparty: string
  type: string
  data: string
}

export const getToken = async (w: Wallet) => {
  const outputs = await w.listOutputs({
    basket: 'tokens',
    includeCustomInstructions: true,
    include: 'locking scripts'
  })

  if (outputs.totalOutputs < 1) throw 'no tokens'

  return outputs.outputs[0]
}

export const createToken = async (
  wallet: Wallet,
  tokenData: string,
  toPubKey: string
) => {
  const t = new PushDrop(wallet)

  const data = new TextEncoder().encode(tokenData)
  const field = Array.from(data)
  const protocolID: WalletProtocol = [2, 'pushdropexample']
  const keyID: string = Utils.toBase64(Random(8))
  // const keyID = 'hH39UIznLbQ='
  const forSelf = wallet.identityKey === toPubKey
  const includeSignature = false
  const lockingScriptPosition = 'after'

  const lockingScript = await t.lock(
    [field],
    protocolID,
    keyID,
    toPubKey,
    forSelf,
    includeSignature,
    lockingScriptPosition
  )

  const customInstructions: TokenCustomInstructions = {
    protocolID: protocolID,
    keyID: keyID,
    counterparty: wallet.identityKey,
    type: 'PushDrop',
    data: tokenData
  }

  return { lockingScript, customInstructions }
}

export const unlockToken = async (
  w: Wallet,
  instructions: TokenCustomInstructions
) => {
  const t = new PushDrop(w)

  // ignore this warning about await - it needs to be there
  return await t.unlock(
    instructions.protocolID,
    instructions.keyID,
    instructions.counterparty,
    'all',
    false,
    1
  )
}

export const mintToken = async (w: Wallet, data: string) => {
  const pubKeySelf = w.identityKey
  const { lockingScript, customInstructions } = await createToken(
    w,
    data,
    pubKeySelf
  )

  const tx = await w.createAction({
    outputs: [
      {
        lockingScript: lockingScript.toHex(),
        satoshis: 1,
        basket: 'tokens',
        customInstructions: JSON.stringify(customInstructions),
        outputDescription: 'token mint'
      }
    ],
    description: 'token mint',
    options: {
      randomizeOutputs: false, // so that we know that output index is 0 (required for input)
      acceptDelayedBroadcast: false // wait for broadcasting (otherwise it will happen async)
    }
  })

  console.log('TXID: ', tx.txid)
  console.log(
    'Outputs from tokens basket:',
    await w.listOutputs({
      basket: 'tokens',
      includeCustomInstructions: true
    })
  )
}
