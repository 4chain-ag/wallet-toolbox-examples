import { SetupWallet, brc29ProtocolID, Setup } from "@bsv/wallet-toolbox";
import { derivationParts } from "./derivation";
import { PublicKey } from "@bsv/sdk";

// Get the address from the keyId and identityKey
export function getAddressFromDerivation(setup: SetupWallet) {
  const parts = derivationParts();
  let keyId = parts.keyId;
  let identityKey = parts.identityKey;

  return setup.keyDeriver
    .derivePrivateKey(brc29ProtocolID, keyId, identityKey)
    .toAddress(`testnet`);
}

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

