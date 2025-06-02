import readline from 'readline'

export async function userMustProvideTransactionID() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise<string>(resolve => {
    rl.question('Please enter the transaction ID to internalize: ', txId => {
      rl.close()
      if (!txId) {
        console.error('Transaction ID cannot be empty.')
        process.exit(1)
      }
      txId = txId.toLowerCase()

      if (!/^[a-f0-9]{64}$/i.test(txId)) {
        console.error('Invalid transaction ID format. It should be a 64-character hexadecimal string.')
        process.exit(1)
      }

      resolve(txId)
    })
  })
}

export async function userCouldProvideTransactionID() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise<string>(resolve => {
    rl.question('Please enter the transaction ID to internalize: ', txId => {
      rl.close()
      txId = txId.trim().toLowerCase()
      if (!txId) {
        resolve("")
        return
      }

      if (!/^[a-f0-9]{64}$/i.test(txId)) {
        console.error('Invalid transaction ID format. It should be a 64-character hexadecimal string.')
        process.exit(1)
      }

      resolve(txId)
    })
  })
}
