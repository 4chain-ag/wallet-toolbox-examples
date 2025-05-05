import { Beef } from '@bsv/sdk'
import { Setup } from '@bsv/wallet-toolbox'
import { parseWalletOutpoint } from '@bsv/wallet-toolbox/out/src/sdk'
import { runArgv2Function } from './runArgv2Function'
import {inspect} from "node:util";

/**
 * Run this function using the following command:
 *
 * ```bash
 * npx tsx listChange
 * ```
 *
 * @publicbody
 */
export async function listActions(): Promise<void> {
  const env = Setup.getEnv('test')
  for (const identityKey of [env.identityKey, env.identityKey2]) {
    const setup = await Setup.createWalletClient({
      env,
      rootKeyHex: env.devKeys[identityKey]
    })

    const actions = await setup.wallet.listActions({labels: []})


    console.log(inspect(actions, false, null, true))
  }
}

/**
 * "Align Left" function for simple table formatting.
 * Adds spaces to the end of a string or number value to
 * return a string of minimum length `w`
 */
export function al(v: string | number, w: number): string {
  return v.toString().padEnd(w)
}

/**
 * "Align Right" function for simple table formatting.
 * Adds spaces to the start of a string or number value to
 * return a string of minimum length `w`
 */
export function ar(v: string | number, w: number): string {
  return v.toString().padStart(w)
}

runArgv2Function(module.exports)
