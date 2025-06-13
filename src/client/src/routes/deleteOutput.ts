import { Router, Request, Response, NextFunction } from 'express'
import { relinquishOutput } from '../functions/deleteOutput'

const router = Router()

// Delete output endpoint
router.post(
  '/deleteOutput',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('Delete output route called')
    try {
      const { txID, vout, identityKey } = req.body

      // Validate required fields
      if (!txID || !identityKey) {
        res.status(400).json({
          status: 'error',
          message: 'Both txID and identityKey are required',
          timestamp: new Date().toISOString()
        })
        return
      }

      // Ensure vout is a number, default to 0 if not provided
      const voutNumber = typeof vout === 'number' ? vout : parseInt(vout) || 0

      const result = await relinquishOutput(txID, voutNumber, identityKey)

      res.json({
        status: 'success',
        message: 'Output deleted successfully',
        timestamp: new Date().toISOString(),
        data: {
          txID,
          vout: voutNumber,
          identityKey,
          result
        }
      })
    } catch (error) {
      console.error('Error deleting output:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete output',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  }
)

export default router
