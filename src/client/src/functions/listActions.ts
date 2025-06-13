import dotenv from 'dotenv'
import { matchUser } from './utils/matchUser'
dotenv.config({ path: `${__dirname}/.env` })

export async function listActions(identityKey : string) {
    const userSetup = await matchUser(identityKey)
  
    const { actions } = await userSetup.wallet.listActions({labels: []})

    return actions
}
