import { derivationParts } from '../utils/derivation-prefix-suffix'
import { sdk, Setup, brc29ProtocolID } from '@bsv/wallet-toolbox'

export async function faucetAddress(network: sdk.Chain) {
  const env = Setup.getEnv(network)
  const setup = await Setup.createWalletClient({ env })

  const {keyId, identityKey} = derivationParts()

  const address = setup.keyDeriver
    .derivePrivateKey(brc29ProtocolID, keyId, identityKey)
    .toAddress(`${network}net`)

  console.log('====================================')
  console.log('')
  console.info('Below is the address that you should top up from faucet:')
  console.log('')
  console.info(address.toString())
  console.log('')
  console.info('You can use one of those testnet faucets:')
  console.info('https://scrypt.io/faucet')
  console.info('https://witnessonchain.com/faucet/tbsv')
}
