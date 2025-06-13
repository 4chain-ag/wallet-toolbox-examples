import { derivationParts } from './derivation'
import { InternalizeActionArgs, Beef } from '@bsv/sdk'
import { getUser1Setup, getUser2Setup } from './setup'

import dotenv from "dotenv";
dotenv.config({ path: `${__dirname}/.env` });

export async function faucetInternalizeBeef(
  txid: string,
  vout: number = 0,
  identityKey: string,
  beef: string
) {
  const user1Setup = await getUser1Setup()
  const user2Setup = await getUser2Setup()

  const paymentRemittance = derivationParts().paymentRemittance

  const args: InternalizeActionArgs = {
    tx: Beef.fromString(beef).toBinaryAtomic(txid),
    outputs: [
      {
        outputIndex: vout,
        protocol: 'wallet payment',
        paymentRemittance
      }
    ],
    description: 'internalize unknown beef transaction'
  }

  if(user1Setup.identityKey !== identityKey && user2Setup.identityKey !== identityKey) {
    throw new Error("Identity key does not match users in the database")
  }

  const transactionIdentityKey = user1Setup.identityKey === identityKey ? user1Setup : user2Setup

  const iwpr = await transactionIdentityKey.wallet.internalizeAction(args)
  console.log(JSON.stringify(iwpr))
}
