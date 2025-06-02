import { sdk, Setup, SetupWallet } from '@bsv/wallet-toolbox'

export function getWallets(network: sdk.Chain): {setup1: Promise<SetupWallet>, setup2: Promise<SetupWallet>} {
  const env = Setup.getEnv(network)
  return {
    get setup1() {
      return Setup.createWalletClient({ env }).catch(err => {
        console.error(err)
        process.exit(1)
      })
    },

    get setup2() {
      return Setup.createWalletClient({
        env,
        rootKeyHex: env.devKeys[env.identityKey2]
      })
    }
  }

}
