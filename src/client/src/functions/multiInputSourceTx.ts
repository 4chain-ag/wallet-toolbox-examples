import { Transaction } from "@bsv/sdk";
import { SetupWallet } from "@bsv/wallet-toolbox";
import { getUser1Setup } from "./setup";
import { getLockingScriptHexFromAddress } from "./keys";

import dotenv from "dotenv";
dotenv.config({ path: `${__dirname}/.env` });

export async function multiInputTxHandler(outputs: { address: string; satoshis: number }[], inputs: {beef: string, txid: string, vout: number}[]) {
  const user1Setup = await getUser1Setup();
  
  return await multiInputTx(user1Setup, outputs, inputs);
}
//Create a p2pkh transaction
export async function multiInputTx(
  setup: SetupWallet,
  outputs: { address: string; satoshis: number }[],
  inputs: {beef: string, txid: string, vout: number}[]
) {


    //TODO: We will add in the inputs here directly to the trasnaction from the beef
    // need to check validation, signing, paymentRemittance, etc.
  const label = "multiInputSourceTx";
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
