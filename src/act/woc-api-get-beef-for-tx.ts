import { Beef } from '@bsv/sdk'

export async function wocAPIGetBeefForTX(network: string, txid: string): Promise<Beef> {
  const url = `https://api.whatsonchain.com/v1/bsv/${network}/tx/${txid}/beef`

  const response = await fetch(url)
  const text = await response.text()

  if (!text) {
    throw new Error('Empty response received from WhatsonChain API')
  }

  if (text === 'Internal server error') {
    throw new Error('Internal server error from WhatsonChain API')
  }

  console.debug("Got BEEF of txid", txid, "from WOC API:", text)

  return Beef.fromString(text)
}
