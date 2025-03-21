import {
  ScriptTemplate,
  OP,
  Utils,
  LockingScript,
  WalletProtocol
} from '@bsv/sdk'
import { Setup } from '@bsv/wallet-toolbox'
import dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/.env` })
class OpReturnTemplate implements ScriptTemplate {
  lock(data: string | string[]): LockingScript {
    const script: any[] = [{ op: OP.OP_FALSE }, { op: OP.OP_RETURN }]

    if (typeof data === 'string') {
      data = [data]
    }

    for (const entry of data.filter(Boolean)) {
      const arr = Utils.toArray(entry, 'utf8')
      script.push({ op: arr.length, data: arr })
    }

    return new LockingScript(script)
  }

  // @ts-ignore
  unlock() {
    throw new Error('Unlock is not supported for OpReturn scripts')
  }
}

async function opreturn() {
  const env = Setup.getEnv('test')

  const setup = await Setup.createWalletClient({ env })

  const lockingScript = new OpReturnTemplate().lock('Hello, world 123!')

  const label = 'op_return'

  const action = await setup.wallet.createAction({
    outputs: [
      {
        lockingScript: lockingScript.toHex(),
        satoshis: 1,
        outputDescription: label,
        tags: ['relinquish'],
        basket: 'op_return'
      }
    ],
    options: {
      randomizeOutputs: false,
      acceptDelayedBroadcast: false
    },
    labels: [label],
    description: label
  })

  console.log(action)
}

opreturn().catch(console.error)
