import { ARC, P2PKH, PrivateKey, Transaction } from '@bsv/sdk'
import { brc29ProtocolID, Wallet } from '@bsv/wallet-toolbox'
import { createWallet } from './utils'
import { FUNDING_WIF, WIF1 } from './wifs'

const fundWallet = async () => {
  const taalApiKey = 'testnet_0e6cf72133b43ea2d7861da2a38684e3'

  const wifToBeFunded = WIF1
  const pk = PrivateKey.fromWif(wifToBeFunded)
  console.log('address: ', pk.toAddress('testnet'))
  console.log('pkey', pk.toPublicKey().toString())

  const fundingPK = PrivateKey.fromWif(FUNDING_WIF)

  const wallet = await createWallet(pk, 'wallet1')

  const { address, derivationPrefix, derivationSuffix } =
    getBRC29Address(wallet)

  const minSatoshisRequired = 1000

  const balance = await wallet.balance()
  console.log('starting balance', balance)

  if (balance < minSatoshisRequired) {
    const response = await fundWalletTransaction(
      minSatoshisRequired,
      address,
      fundingPK,
      taalApiKey
    )

    if (!response || response.status === 'error') {
      return
    }

    // give some time for external providers (WoC) to get the transaction
    await new Promise(r => setTimeout(r, 3000)) // arbitrary 3sec

    const res = await internalizeTransaction(
      wallet,
      response.txid,
      derivationPrefix,
      derivationSuffix,
      new PrivateKey(1).toPublicKey().toString()
    )

    if (res?.accepted) {
      console.log(`wallet funded with ${await wallet.balance()} satoshis`)
    }
  }

  await wallet.storage.destroy()
}

const getBRC29Address = (wallet: Wallet) => {
  // this is just randomly generated 8-byte base64 string,
  // but it could be generated in a more "meaningful" way
  const derivationPrefix = 'SfKxPIJNgdI='
  const derivationSuffix = 'NaGLC6fMH50='

  const keyId = `${derivationPrefix} ${derivationSuffix}`

  const address = wallet.keyDeriver
    .derivePrivateKey(brc29ProtocolID, keyId, 'anyone')
    .toAddress(`testnet`)

  return { address, derivationPrefix, derivationSuffix }
}

type UTXO = {
  height: number
  tx_pos: number
  tx_hash: string
  value: number
  isSpentInMempoolTx: boolean
  status: string
}

const fundWalletTransaction = async (
  satoshis: number,
  address: string,
  pk: PrivateKey,
  taalApiKey: string
) => {
  let utxos: UTXO[] = []

  const fetchFromAddress = pk.toAddress('testnet')
  await fetch(
    `https://api.whatsonchain.com/v1/bsv/test/address/${fetchFromAddress}/unspent/all`
  )
    .then(response => response.json())
    .then(body => {
      const resUtxos: UTXO[] = body.result
      for (const u of resUtxos) {
        utxos.push(u)
      }
    })

  let currentAmount = 0
  for (let i = 0; i < utxos.length; i++) {
    currentAmount += utxos[i].value

    if (currentAmount > satoshis) {
      utxos = utxos.slice(0, i + 1)
      break
    }
  }

  if (utxos.length === 0) {
    console.log('error fetching utxos or not enough balance')
    return
  }

  const tx = new Transaction()

  for (const u of utxos) {
    let txHex = ''
    await fetch(`https://api.whatsonchain.com/v1/bsv/test/tx/${u.tx_hash}/hex`)
      .then(response => response.text())
      .then(hex => {
        txHex = hex
      })

    if (txHex === '') {
      console.log('Error fetching raw tx hex')
      return
    }

    tx.addInput({
      sourceTransaction: Transaction.fromHex(txHex),
      sourceOutputIndex: u.tx_pos,
      unlockingScriptTemplate: new P2PKH().unlock(pk)
    })
  }

  tx.addOutput({
    lockingScript: new P2PKH().lock(address),
    satoshis: satoshis
  })

  tx.addOutput({
    lockingScript: new P2PKH().lock(pk.toAddress('testnet')),
    change: true
  })

  await tx.fee()
  await tx.sign()

  const response = await tx.broadcast(
    new ARC('https://api.taal.com/arc', taalApiKey)
  )

  console.log('Funding response:')
  console.log(response)

  return response
}

const internalizeTransaction = async (
  wallet: Wallet,
  txid: string,
  derivationPrefix: string,
  derivationSuffix: string,
  senderIdentityKey: string
) => {
  const storageProvider = await wallet.storage.getActiveForStorageProvider()
  const beef = await storageProvider.getBeefForTransaction(txid, {})

  if (!beef) {
    console.log('Could not get beef from TXID')
    return
  }

  wallet.storage._storageProviderLocked = false

  const internalizeResponse = await wallet.internalizeAction({
    tx: beef.toBinaryAtomic(txid),
    outputs: [
      {
        outputIndex: 0,
        protocol: 'wallet payment',
        paymentRemittance: {
          derivationPrefix: derivationPrefix,
          derivationSuffix: derivationSuffix,
          senderIdentityKey: senderIdentityKey
        }
      }
    ],
    description: 'funding wallet utxo'
  })

  console.log(internalizeResponse)

  return internalizeResponse
}

fundWallet().catch(console.error)
