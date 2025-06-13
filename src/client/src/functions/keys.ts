import { SetupWallet, brc29ProtocolID } from "@bsv/wallet-toolbox";
import { derivationParts } from "./derivation";

// Get the address from the keyId and identityKey
export function getAddressFromDerivation(setup: SetupWallet) {
  const parts = derivationParts();
  let keyId = parts.keyId;
  let identityKey = parts.identityKey;

  return setup.keyDeriver
    .derivePrivateKey(brc29ProtocolID, keyId, identityKey)
    .toAddress(`testnet`);
}
