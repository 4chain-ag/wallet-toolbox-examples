import { AtomicBEEF } from '@bsv/sdk'
import { Wallet } from '@bsv/wallet-toolbox'
import { TokenCustomInstructions } from './tokens'

export const internalizeSwap = async (
  w: Wallet,
  atomicBEEF: AtomicBEEF,
  vout: number,
  basket: string,
  customInstructions: TokenCustomInstructions
) => {
  const internalize = await w.internalizeAction({
    tx: atomicBEEF,
    outputs: [
      {
        outputIndex: vout,
        protocol: 'basket insertion',
        insertionRemittance: {
          basket: basket,
          customInstructions: JSON.stringify(customInstructions)
        }
      }
    ],
    description: 'token swap internalization'
  })

  console.log('INTERN: ', internalize)
}
