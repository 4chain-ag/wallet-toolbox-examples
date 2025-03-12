import {brc29ProtocolID, Setup} from "@bsv/wallet-toolbox";

async function faucetAddress() {
  const env = Setup.getEnv('test')
  const setup = await Setup.createWalletClient({ env })

  const derivationPrefix = 'SfKxPIJNgdI=';
  const derivationSuffix = 'NaGLC6fMH50=';
  const keyId = `${derivationPrefix} ${derivationSuffix}`

  const address = setup.keyDeriver
    .derivePrivateKey(brc29ProtocolID, keyId, 'anyone')
    .toAddress('testnet')

  console.log("====================================")
  console.log("")
  console.info("Below is the address that you should top up from faucet:")
  console.log("")
  console.info(address.toString())
  console.log("")
  console.info("You can use one of those testnet faucets:")
  console.info("https://scrypt.io/faucet")
  console.info("https://witnessonchain.com/faucet/tbsv")
}


faucetAddress().catch(console.error)
