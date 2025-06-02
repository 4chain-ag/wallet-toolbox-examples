import dotenv from 'dotenv'
import { faucetInternalize } from './act'
dotenv.config({ path: `${__dirname}/.env` })

faucetInternalize(
  'test',
  '55a1d80cd38cb663bcec2f6492367e1af1c7ea13cc02ca4456c2ef1f11225f2a'
)
  .then(() => process.exit(0))
  .catch(console.error)
