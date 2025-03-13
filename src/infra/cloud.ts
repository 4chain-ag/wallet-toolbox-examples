import * as bsv from '@bsv/sdk'
import {
  Services,
  StorageKnex,
  TableSettings,
  WalletStorageManager,
  WalletStorageServerOptions,
  StorageServer,
  Wallet,
  Monitor,
  MonitorDaemon,
  MonitorStorage
} from '@bsv/wallet-toolbox'
import { Knex, knex as makeKnex } from 'knex'

import * as dotenv from 'dotenv'
import { Chain } from '@bsv/wallet-toolbox/out/src/sdk'
dotenv.config({ path: `${__dirname}/.env` })

// Load environment variables
const {
  BSV_NETWORK = 'test',
  HTTP_PORT = 8081, // Must be 8081 if ENABLE_NGINX 'true',
  SERVER_PRIVATE_KEY,
  KNEX_DB_CONNECTION,
  TAAL_API_KEY,
  COMMISSION_FEE = 0,
  COMMISSION_PUBLIC_KEY,
  FEE_MODEL = '{"model":"sat/kb","value":1}'
} = process.env

async function setupWalletStorageAndMonitor() {
  try {
    if (!SERVER_PRIVATE_KEY) {
      throw new Error('SERVER_PRIVATE_KEY must be set')
    }
    if (!KNEX_DB_CONNECTION) {
      throw new Error('KNEX_DB_CONNECTION must be set')
    }
    // NOTE: Here is a fix, comparing to original source code
    if (Number(COMMISSION_FEE) > 0 && !COMMISSION_PUBLIC_KEY) {
      throw new Error(
        'COMMISSION_PUBLIC_KEY must be set when COMMISSION_FEE is greater than zero'
      )
    }
    // Parse database connection details
    const connection = JSON.parse(KNEX_DB_CONNECTION)
    const databaseName = connection['database']

    // You can also use an imported knex configuration file.
    const knexConfig: Knex.Config = {
      client: connection['client'] || 'mysql2',
      connection,
      useNullAsDefault: true,
      pool: {
        min: 2,
        max: 10,
        createTimeoutMillis: 10000,
        acquireTimeoutMillis: 30000,
        idleTimeoutMillis: 600000,
        reapIntervalMillis: 60000,
        createRetryIntervalMillis: 200,
        propagateCreateError: false
      }
    }
    const knex = makeKnex(knexConfig)

    // use testnet unless BSV_NETWORK env variable is set to exactly "main"
    const chain = BSV_NETWORK !== 'main' ? 'test' : 'main'

    // Initialize storage components
    const rootKey = bsv.PrivateKey.fromHex(SERVER_PRIVATE_KEY)
    const storageIdentityKey = rootKey.toPublicKey().toString()

    const activeStorage = new StorageKnex({
      chain,
      knex,
      commissionSatoshis: Number.isInteger(COMMISSION_FEE)
        ? Number(COMMISSION_FEE)
        : 0,
      commissionPubKeyHex: COMMISSION_PUBLIC_KEY || undefined,
      feeModel: JSON.parse(FEE_MODEL)
    })

    await activeStorage.migrate(databaseName, storageIdentityKey)
    const settings = await activeStorage.makeAvailable()

    const storage = new WalletStorageManager(
      settings.storageIdentityKey,
      activeStorage
    )
    await storage.makeAvailable()

    // Initialize wallet components
    const servOpts = Services.createDefaultOptions(chain)
    if (TAAL_API_KEY) {
      servOpts.taalApiKey = TAAL_API_KEY
    }
    const services = new Services(servOpts)

    // Initialize monitor
    const monitor = await setupMonitor(chain, services, storage)

    const wallet = new Wallet({
      chain,
      keyDeriver: new bsv.KeyDeriver(rootKey),
      storage,
      services,
      monitor
    })

    // Set up server options
    const serverOptions: WalletStorageServerOptions = {
      port: Number(HTTP_PORT),
      wallet,
      monetize: false,
      calculateRequestPrice: async () => {
        return 0 // Monetize your server here! Price is in satoshis.
      }
    }
    const server = new StorageServer(activeStorage, serverOptions)

    return {
      databaseName,
      knex,
      activeStorage,
      storage,
      services,
      settings,
      wallet,
      server
    }
  } catch (error) {
    console.error('Error setting up Wallet Storage and Monitor:', error)
    throw error
  }
}

async function setupMonitor(
  chain: Chain,
  services: Services,
  storage: MonitorStorage
) {
  const monitor = new Monitor({
    chain,
    services,
    storage,
    msecsWaitPerMerkleProofServiceReq: 500,
    taskRunWaitMsecs: 5000,
    abandonedMsecs: 1000 * 60 * 5,
    unprovenAttemptsLimitTest: 10,
    unprovenAttemptsLimitMain: 144,
    chaintracks: services.options.chaintracks!
  })
  monitor.addDefaultTasks()

  const daemon = new MonitorDaemon({ monitor })
  await daemon.createSetup()
  daemon.runDaemon().catch(console.error)

  return monitor
}

// Main function to start the server
;(async () => {
  try {
    const context = await setupWalletStorageAndMonitor()
    console.log('wallet-toolbox StorageServer v1.1.13')
    console.log(JSON.stringify(context.settings, null, 2))

    context.server.start()
    console.log('wallet-toolbox StorageServer started')
  } catch (error) {
    console.error('Error starting server:', error)
  }
})()
