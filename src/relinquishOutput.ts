import { Setup } from '@bsv/wallet-toolbox'
import { Chain } from '@bsv/wallet-toolbox/out/src/sdk'
import dotenv from 'dotenv'
dotenv.config({ path: `${__dirname}/.env` })

async function relinquishOutput(network: Chain, txID: string, vout: number) {
  const env = Setup.getEnv(network)
  const setup1 = await Setup.createWalletClient({ env })

  const res = await setup1.wallet.relinquishOutput({
    output: `${txID}.${vout}`,
    basket: 'default'
  })

  console.log('result', res)
}

relinquishOutput(
  'test',
  '05a6c7420b78f5394c82fe4d6ebf1079d05b99294579a5f0bc419d27a015bda9',
  0
)
  .then(() => process.exit(0))
  .catch(console.error)
