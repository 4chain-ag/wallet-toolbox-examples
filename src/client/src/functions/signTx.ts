import { Transaction } from "@bsv/sdk";
import dotenv from "dotenv";
import { matchUser } from "./utils/matchUser";
import {Setup} from "@bsv/wallet-toolbox";
dotenv.config({ path: `${__dirname}/.env` });


export async function signTxHandler(tx : Transaction, identityKey: string) {
  const userWallet = await matchUser(identityKey);
  return await signTx(userWallet, tx);
}

async function signTx(userWalletSetup : Setup, tx : Transaction){
    // TODO: here we need to validate the tx and then proceed with signature methods

    // we can check how this is done in the wallet-toolbox added examples

    // need to verfiy that the tx is broadcasted and the change output is added

    // we can further validated by internatlizing the tx and validating the output is spendable

}

