import dotenv from 'dotenv'
import { matchUser } from './utils/matchUser'
dotenv.config({ path: `${__dirname}/.env` })

export async function listChange(identityKey: string) {
  const outputs: Array<{
    satoshis: number
    vout: number
    txid: string
    status: string
  }> = []
  const userSetup = await matchUser(identityKey)

  const { actions } = await userSetup.wallet.listActions({
    labels: [],
    includeOutputs: true,
    limit: 1000
  })

  for (const stati of [['nosend'], ['completed', 'unproven']])
    for (const a of actions.reverse()) {
      if (stati.indexOf(a.status) >= 0) {
        for (const o of a.outputs!) {
          if (o.spendable && o.basket === 'default') {
            outputs.push({
              satoshis: o.satoshis,
              vout: o.outputIndex,
              txid: a.txid,
              status: a.status
            })
          }
        }
      }
    }

  return outputs
}
