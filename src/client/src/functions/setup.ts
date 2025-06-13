import { Setup } from "@bsv/wallet-toolbox";
import dotenv from "dotenv";
dotenv.config({ path: `${__dirname}/.env` });

// Get the test environment
export function getTestEnv() {
  return Setup.getEnv("test");
}

// Get user 1 setup
export async function getUser1Setup() {
  const env = getTestEnv();
  return await Setup.createWalletClient({
    env,
    endpointUrl: "http://localhost:8100",
    rootKeyHex: env.devKeys[env.identityKey],
  });
}

// Get user 2 setup
export async function getUser2Setup() {
  const env = getTestEnv();
  return await Setup.createWalletClient({
    env,
    endpointUrl: "http://localhost:8100",
    rootKeyHex: env.devKeys[env.identityKey2],
  });
}

// Get both users setup
export async function getBothUserSetup() {
  const user1 = await getUser1Setup()
  const user2 = await getUser2Setup()

  return { user1, user2 };
}
