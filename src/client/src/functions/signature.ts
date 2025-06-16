import dotenv from 'dotenv'
import { matchUser } from './utils/matchUser'
import { WalletProtocol } from '@bsv/sdk'
dotenv.config({ path: `${__dirname}/.env` })

export async function createSignature(identityKey: string, message: string) {
  const userSetup = await matchUser(identityKey)
  const keyID = '1'
  const protocolID: WalletProtocol = [2, 'signature']

  const signatureResult = await userSetup.wallet.createSignature({
    data: Array.from(Buffer.from(message, 'utf8')), // check methods for formatting
    protocolID: protocolID,
    keyID: keyID
  })

  const signatureBytes = signatureResult.signature
  console.log(signatureBytes)

  // testing valdiation directly since its not working on the endpoint for verify 
  // TODO: still failing though. Need to find some examples of how to format the params universally

  const verifySignature = await userSetup.wallet.verifySignature({
    data: Array.from(Buffer.from(message, 'utf8')),
    signature: signatureBytes, //The DER-encoded ECDSA signature to validate ? check formatting?
    protocolID: protocolID,
    keyID: keyID,
    forSelf: true
  })

  console.log('Signature verification result:', verifySignature)

  const signatureBase64 = Buffer.from(signatureBytes).toString('base64')

  return {
    signature: signatureBase64,
    keyID: keyID,
    protocolID: protocolID,
    isValid: verifySignature
  }
}
