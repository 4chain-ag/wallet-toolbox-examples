import { Services, Setup } from '@bsv/wallet-toolbox'
import dotenv from 'dotenv'
import { BEEF_V1 } from '@bsv/sdk'

dotenv.config({ path: `${__dirname}/.env` })
type Chain = 'main' | 'test'

async function getBEEF(txid: string, network: Chain = 'test') {
  const env = Setup.getEnv(network)

  const storage = await Setup.createStorageKnex({
    knex: Setup.createSQLiteKnex('getbeef.sqlite'),
    databaseName: 'getbeef',
    env
  })
  storage.setServices(new Services(env.chain))

  const beef = await storage.getBeefForTransaction(txid, {})

  await storage.destroy()


  beef.version = BEEF_V1
  const beefHex = beef.toHex()
  console.log('========== BEEF HEX ============')
  console.log(beefHex)
  console.log('=================================')
}

getBEEF(
  '94b2d4e6e7d71999a83d911e876aea1eeef61590d4a1e1f9221eaba936042e24',
  'test'
).catch(console.error)
