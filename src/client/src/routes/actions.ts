import { Router, Request, Response, NextFunction } from 'express'
import { listActions } from '../functions/listActions'

const router = Router()

// Get actions for a specific identity key
router.post(
  '/actions',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('Actions route called')
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

      const actions = await listActions(identityKey)

      res.json({
        status: 'success',
        message: 'Actions retrieved successfully',
        timestamp: new Date().toISOString(),
        data: {
          identityKey,
          actions
        }
      })
    } catch (error) {
      console.error('Error retrieving actions:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve actions',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  }
)

export default router
