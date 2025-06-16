import { Transaction } from "@bsv/sdk";
import { SetupWallet } from "@bsv/wallet-toolbox";
import { getUser1Setup } from "./setup";
import { getLockingScriptHexFromAddress } from "./keys";

import dotenv from "dotenv";
dotenv.config({ path: `${__dirname}/.env` });


export async function createUnsignedTx(outputs: { address: string; satoshis: number }[]) {
  const user1Setup = await getUser1Setup();
  return await createUnsignedP2pkhTx(user1Setup, outputs);
}
export async function createUnsignedP2pkhTx(
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
      signAndProcess: false

    },
    labels: [label],
    description: label,
  });

  // If this is unsigned we will require the params to sign it, which should be provided in the result?
  //TODO: we need to return the required params to sign the transaction inputs (payment remmitance instructions etc)
  console.log(car)
  const beef = Transaction.fromAtomicBEEF(car.tx!).toHexBEEF();
  return { beef };
}
