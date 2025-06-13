import { Router, Request, Response, NextFunction } from 'express'
import { listChange } from '../functions/listChange'

const router = Router()

// Get outputs for a specific identity key
router.post(
  '/outputs',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('Outputs route called')
    try {
      const { identityKey } = req.body

      // Validate required fields
      if (!identityKey) {
        res.status(400).json({
          status: 'error',
          message: 'identityKey is required',
          timestamp: new Date().toISOString()
        })
        return
      }

      const outputs = await listChange(identityKey)

      res.json({
        status: 'success',
        message: 'Outputs retrieved successfully',
        timestamp: new Date().toISOString(),
        data: {
          identityKey,
          outputs
        }
      })
    } catch (error) {
      console.error('Error retrieving outputs:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve outputs',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  }
)

export default router
