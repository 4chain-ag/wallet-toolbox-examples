import dotenv from "dotenv";
import { getUser1Setup, getUser2Setup } from "./setup";
dotenv.config({ path: `${__dirname}/.env` });

// Function to get balance for user1
export async function getUser1Balance(): Promise<number> {
  const setup = await getUser1Setup();
  return await setup.wallet.balance();
}

// Function to get balance for user2
export async function getUser2Balance(): Promise<number> {
  const setup = await getUser2Setup();
  return await setup.wallet.balance();
}
