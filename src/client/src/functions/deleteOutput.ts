import { matchUser } from './utils/matchUser'
import dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/.env` })

// TODO: this is not working, need to check the params/method/library
//Update 
/**
 * 
I will rephrase maybe:
when you createAction change outputs will be created.
If for some reason you would like to prevent storage to take one of this changes as an input for another transaction, you can call the relinquish output
Why would you like to do that:
maybe some changes are malformed
or their source transaction is wrong (double spend?)
or you accidentally spend it "offline"
or you just want to have some reserve
*/

/**
 * @param txID When it comes to relinquish output - what we found recently - the method just makes the output not managed by storage.
 * @param vout 
 * @param identityKey 
 * @returns 
 */
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
