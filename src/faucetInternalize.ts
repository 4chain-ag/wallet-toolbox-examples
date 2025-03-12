import 'dotenv/config'
import dotenv from 'dotenv'
import {Services, Setup} from "@bsv/wallet-toolbox";
import {InternalizeActionArgs, PrivateKey} from "@bsv/sdk";

export async function faucetInternalize(txid: string) {
  // Setup
  dotenv.config({path: `${__dirname}/.env`});
  const derivationPrefix = 'SfKxPIJNgdI=';
  const derivationSuffix = 'NaGLC6fMH50=';

  const env = Setup.getEnv('test')
  const setup1 = await Setup.createWalletClient({ env })

  const storage = await Setup.createStorageKnex({
    knex: Setup.createSQLiteKnex('getbeef.sqlite'),
    databaseName: 'getbeef',
    env
  })
  storage.setServices(new Services(env.chain))

  const beef = await storage.getBeefForTransaction(txid, {})

  const args: InternalizeActionArgs = {
    tx: beef.toBinaryAtomic(txid),
    outputs: [
      {
        outputIndex: 0,
        protocol: 'wallet payment',
        paymentRemittance: {
          derivationPrefix: derivationPrefix,
          derivationSuffix: derivationSuffix,
          senderIdentityKey: new PrivateKey(1).toPublicKey().toString()
        }
      }
    ],
    description: 'from faucet top up'
  }

  const iwpr = await setup1.wallet.internalizeAction(args)
  console.log(JSON.stringify(iwpr))
  await setup1.storage.destroy()
}

faucetInternalize('e05596f6e225e47de402ad7a4d4040dadace40d89dae6f21178b3cd8a9255895').catch(console.log)
