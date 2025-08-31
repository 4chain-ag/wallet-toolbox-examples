import { PrivateKey } from '@bsv/sdk'

const pk = PrivateKey.fromRandom()
console.log('Testnet WIF: ', pk.toWif([0xef]))
console.log(
  'PubKey: ',
  PrivateKey.fromWif(pk.toWif([0xef]))
    .toPublicKey()
    .toString()
)

console.log('\n')

const pkWif = PrivateKey.fromWif('')
console.log(pkWif.toPublicKey().toString())
