import { Router } from 'express'
import statusRoutes from './status'
import keysRoutes from './keys'
import internalizeRoutes from './internalize'
import balanceRoutes from './balance'
import faucetRoutes from './faucet'
import opreturnRoutes from './opreturn'
import outputsRoutes from './outputs'
import actionsRoutes from './actions'
import deleteOutputRoutes from './deleteOutput'

const router = Router()

// Mount all route modules
router.use('/api', statusRoutes)
router.use('/api', keysRoutes)
router.use('/api', internalizeRoutes)
router.use('/api', balanceRoutes)
router.use('/api', faucetRoutes)
router.use('/api', opreturnRoutes)
router.use('/api', outputsRoutes)
router.use('/api', actionsRoutes)
router.use('/api', deleteOutputRoutes)

export default router
