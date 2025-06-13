import fetch from 'node-fetch'
const API_BASE_URL = 'http://localhost:3000'
const FAUCET_ENDPOINT = `${API_BASE_URL}/api/faucet`

export async function testFaucet(
  outputs: { address: string; satoshis: number }[],
  key: string = '4chain'
) {
  try {
    console.log('Testing Faucet Endpoint')
    console.log('==========================')
    console.log(`Key: ${key}`)
    console.log(`Outputs:`, outputs)
    console.log(`Endpoint: ${FAUCET_ENDPOINT}`)

    const requestBody = {
      outputs,
      key
    }

    console.log('Sending request...')
    console.log('Request Body:')
    console.log(JSON.stringify(requestBody, null, 2))

    const response = await fetch(FAUCET_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    const responseData = (await response.json()) as any

    console.log(`Response Status: ${response.status}`)
    console.log('Response Data:')
    console.log(JSON.stringify(responseData, null, 2))

    if (response.status === 200) {
      console.log('Faucet transaction successful!')
      if (responseData.data?.txid) {
        console.log(`Transaction ID: ${responseData.data.txid}`)
      }
    } else {
      console.log('Faucet transaction failed!')
    }

    return responseData
  } catch (error) {
    console.error('Error calling faucet endpoint:', error)
    throw error
  }
}

const s = async () => {
  const testOutputs = [
    {
      address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      satoshis: 1
    }
  ]

  const r = await testFaucet(testOutputs, '4chain')
  console.log('Final result:', r)
}

s()
