import { matchUser } from './utils/matchUser'
import dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/.env` })

export async function relinquishOutput(
  txID: string,
  vout: number,
  identityKey: string
) {
  const userSetup = await matchUser(identityKey)
  const res = await userSetup.wallet.relinquishOutput({
    output: `${txID}.${vout}`,
    basket: 'default'
  })

  return res
}
