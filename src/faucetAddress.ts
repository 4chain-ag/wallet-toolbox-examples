import dotenv from 'dotenv'
import { faucetAddress } from './act'
dotenv.config({ path: `${__dirname}/.env` })


faucetAddress('test').catch(console.error)
