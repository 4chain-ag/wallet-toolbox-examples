import { PublicKey, Transaction } from "@bsv/sdk";
import { Setup, SetupWallet } from "@bsv/wallet-toolbox";
import { getUser1Setup } from "./setup";

import dotenv from "dotenv";
dotenv.config({ path: `${__dirname}/.env` });

// Get the locking script hex for a p2pkh address
export function getLockingScriptHexFromPublicKey(publicKey: string) {
  return Setup.getLockP2PKH(
    PublicKey.fromString(publicKey).toAddress()
  ).toHex();
}

// Get the locking script hex for a p2pkh address
export function getLockingScriptHexFromAddress(address: string) {
  return Setup.getLockP2PKH(address).toHex();
}

export async function faucet(outputs: { address: string; satoshis: number }[]) {
  const user1Setup = await getUser1Setup();
  return await createP2pkhTx(user1Setup, outputs);
}
//Create a p2pkh transaction
export async function createP2pkhTx(
  setup: SetupWallet,
  outputs: { address: string; satoshis: number }[]
) {
  const label = "outputP2PKH";
  const car = await setup.wallet.createAction({
    outputs: outputs.map((output) => ({
      lockingScript: getLockingScriptHexFromAddress(output.address),
      satoshis: output.satoshis,
      outputDescription: label,
      tags: ["relinquish"],
    })),

    options: {
      randomizeOutputs: false,
      acceptDelayedBroadcast: false,
    },
    labels: [label],
    description: label,
  });

  const beef = Transaction.fromAtomicBEEF(car.tx!).toHexBEEF();
  return { beef, txid : car.txid, vout : 0 };
}
