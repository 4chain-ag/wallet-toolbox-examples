import dotenv from 'dotenv'
import { sdk } from '@bsv/wallet-toolbox'
import { runArgv2Function } from './runArgv2Function'
import { faucetAddress, faucetInternalize } from './act'
import { requestTransactionFromFaucet } from './act/requestTransactionFromFaucet'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

dotenv.config({ path: `${__dirname}/.env` })

export async function faucet(network: sdk.Chain = 'test') {
  const address = await faucetAddress(network)
  const txId = await requestTransactionFromFaucet(address)

  await sleep(2000)

  await faucetInternalize(network, txId)
  console.log('Internalized transaction ID:', txId)
}

runArgv2Function(module.exports)
