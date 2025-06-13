export async function requestTransactionFromFaucet(address: string): Promise<string> {
  try {
    const response = await fetch('https://witnessonchain.com/v1/faucet/tbsv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address: address,
        channel: 'scrypt.io'
      })
    });

    const result = await response.json();

    if (!result.txid) {
      throw new Error(`Failed to get transaction: ${result.message || 'Unknown error'}`);
    }

    return result.txid;
  } catch (error) {
    console.error('Error requesting transaction from faucet:', error);
    throw error;
  }
}
