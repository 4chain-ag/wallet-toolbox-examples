import { Router, Request, Response, NextFunction } from 'express'
import { verifySignature } from '../functions/verifySignature'

const router = Router()

// Verify signature endpoint
router.post(
  '/verifySignature',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    console.log('Verify signature route called')
    try {
      const { identityKey, message, signature, keyID, protocolID } = req.body

      // Validate required fields
      if (!identityKey || !message || !signature) {
        res.status(400).json({
          status: 'error',
          message: 'identityKey, message, and signature are required',
          timestamp: new Date().toISOString()
        })
        return
      }

      const verificationResult = await verifySignature(
        identityKey,
        message,
        signature,
        keyID,
        protocolID
      )

      res.json({
        status: 'success',
        message: 'Signature verification completed',
        timestamp: new Date().toISOString(),
        data: {
          identityKey,
          message,
          signature,
          keyID,
          protocolID,
          isValid: verificationResult
        }
      })
    } catch (error) {
      console.error('Error verifying signature:', error)
      res.status(500).json({
        status: 'error',
        message: 'Failed to verify signature',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    }
  }
)

export default router
