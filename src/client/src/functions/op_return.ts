import {
  ScriptTemplate,
  OP,
  Utils,
  LockingScript,
} from "@bsv/sdk";
import dotenv from "dotenv";
import { getUser1Setup } from "./setup";
dotenv.config({ path: `${__dirname}/.env` });
class OpReturnTemplate implements ScriptTemplate {
  lock(data: string | string[]): LockingScript {
    const script: any[] = [{ op: OP.OP_FALSE }, { op: OP.OP_RETURN }];

    if (typeof data === "string") {
      data = [data];
    }

    for (const entry of data.filter(Boolean)) {
      const arr = Utils.toArray(entry, "utf8");
      script.push({ op: arr.length, data: arr });
    }

    return new LockingScript(script);
  }

  // @ts-ignore
  unlock() {
    throw new Error("Unlock is not supported for OpReturn scripts");
  }
}

export async function opreturn(text: string) {

  const setup = await getUser1Setup()

  const lockingScript = new OpReturnTemplate().lock(text);

  const label = "op_return";

  const action = await setup.wallet.createAction({
    outputs: [
      {
        lockingScript: lockingScript.toHex(),
        satoshis: 1,
        outputDescription: label,
        tags: ["relinquish"],
        basket: "op_return",
      },
    ],
    options: {
      randomizeOutputs: false,
      acceptDelayedBroadcast: false,
    },
    labels: [label],
    description: label,
  });

  return action;
}
