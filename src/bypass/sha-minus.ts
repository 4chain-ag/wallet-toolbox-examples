// THIS IS BYPASS ON GAS METTER TO HASH byte arrays containing -1
import { Hash } from '@bsv/sdk';
const originalSha256 = Hash.sha256

// @ts-ignore
Hash.sha256 = (msg: number[] | string, enc?: 'hex' | 'utf8') => {
  if (Array.isArray(msg) && isGoCompatibilityMode()) {
    // Convert array of numbers to a string
    msg = msg.map(it => it < 0 ? 256 + it : it);
  }
  return originalSha256(msg, enc)
}

export function isGoCompatibilityMode(): boolean {
  return process.env.BOGM_GO_COMPATIBILITY === 'true'
}

