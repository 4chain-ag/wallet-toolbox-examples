import { SetupWallet, Wallet } from '@bsv/wallet-toolbox'
import { matchUser } from './utils/matchUser'

import dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/.env` })

//TODO: this is not tested yet :D
export async function sweep(
  sendingIdentityKey: string,
  receivingIdentityKey: string
) {
  const sendingWallet = await matchUser(sendingIdentityKey)
  const receivingWallet = await matchUser(receivingIdentityKey)

  return await sweepHandler(sendingWallet, receivingWallet.wallet)
}

export async function sweepHandler(
  sendingWallet: SetupWallet,
  receivingWallet: Wallet
) {
  const shr = await sendingWallet.wallet.sweepTo(receivingWallet)

  return shr
}
