import { derivationParts } from './derivation'
import { Setup, Services } from '@bsv/wallet-toolbox'
import { InternalizeActionArgs } from '@bsv/sdk'
import { getUser1Setup, getUser2Setup } from './setup'

import dotenv from "dotenv";
dotenv.config({ path: `${__dirname}/.env` });

export async function faucetInternalize(
  txid: string,
  vout: number = 0,
  identityKey: string,
) {
  // Setup
  const env = Setup.getEnv("test");
  const user1Setup = await getUser1Setup()
  const user2Setup = await getUser2Setup()

  //TODO: we only need this setup to get the beef for the transaction
  // there is probably a better way to do this
  const storage = await Setup.createStorageKnex({
    knex: Setup.createSQLiteKnex('getbeef.sqlite'),
    databaseName: 'getbeef',
    env
  })
  storage.setServices(new Services(env.chain))

  const beef = await storage.getBeefForTransaction(txid, {})

  const paymentRemittance = derivationParts().paymentRemittance

  const args: InternalizeActionArgs = {
    tx: beef.toBinaryAtomic(txid),
    outputs: [
      {
        outputIndex: vout,
        protocol: 'wallet payment',
        paymentRemittance
      }
    ],
    description: 'from faucet top up'
  }

  if(user1Setup.identityKey !== identityKey && user2Setup.identityKey !== identityKey) {
    throw new Error("Identity key does not match users in the database")
  }

  const transactionIdentityKey = user1Setup.identityKey === identityKey ? user1Setup : user2Setup

  const iwpr = await transactionIdentityKey.wallet.internalizeAction(args)
  console.log(JSON.stringify(iwpr))
  await storage.destroy()
}
