import { Router, Request, Response, NextFunction } from 'express'
import { sweep } from '../functions/sweep'

const router = Router()

// Sweep funds from one wallet to another
router.post(
  '/sweep',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('Sweep route called')
    try {
      const { sendingIdentityKey, receivingIdentityKey } = req.body

      // Validate required fields
      if (!sendingIdentityKey || !receivingIdentityKey) {
        res.status(400).json({
          status: 'error',
          message: 'sendingIdentityKey and receivingIdentityKey are required',
          timestamp: new Date().toISOString()
        })
        return
      }

      const sweepResult = await sweep(sendingIdentityKey, receivingIdentityKey)

      res.json({
        status: 'success',
        message: 'Sweep completed successfully',
        timestamp: new Date().toISOString(),
        data: {
          sendingIdentityKey,
          receivingIdentityKey,
          sweepResult
        }
      })
    } catch (error) {
      console.error('Error sweeping funds:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to sweep funds',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  }
)

export default router
