import { Router, Request, Response, NextFunction } from 'express'
import { createSignature } from '../functions/signature'

const router = Router()

// Create signature for a message
router.post(
  '/signature',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('Signature route called')
    try {
      const { identityKey, message } = req.body

      // Validate required fields
      if (!identityKey || !message) {
        res.status(400).json({
          status: 'error',
          message: 'identityKey and message are required',
          timestamp: new Date().toISOString()
        })
        return
      }

      const signature = await createSignature(identityKey, message)

      res.json({
        status: 'success',
        message: 'Signature created successfully',
        timestamp: new Date().toISOString(),
        data: {
          identityKey,
          signature
        }
      })
    } catch (error) {
      console.error('Error creating signature:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to create signature',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  }
)

export default router
