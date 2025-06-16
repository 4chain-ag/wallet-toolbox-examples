import dotenv from 'dotenv'
import { matchUser } from './utils/matchUser'
import { WalletProtocol } from '@bsv/sdk'
dotenv.config({ path: `${__dirname}/.env` })

export async function verifySignature(
  identityKey: string,
  message: string,
  signature: string,
  keyID: string,
  protocolID: WalletProtocol
) {
  const userSetup = await matchUser(identityKey)

  // we will handle the signature as a base 64 value 
  const signatureBytes = Buffer.from(signature, 'base64')
  const signatureArray = Array.from(signatureBytes)

  const messageBytes = Array.from(Buffer.from(message))


  //TODO: failing here due to signature being invalid, we need to assess the signature formatting
  const signatureResult = await userSetup.wallet.verifySignature({
    data: messageBytes,
    signature: signatureArray,
    protocolID: protocolID,
    keyID: keyID,
  })

  return signatureResult
}
