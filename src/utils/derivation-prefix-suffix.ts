import { Utils, PrivateKey } from '@bsv/sdk'

const oldPrefix = 'SfKxPIJNgdI='
const oldSuffix = 'NaGLC6fMH50='

export function derivationParts() {
  const prefix = '' // set this to any string you want to change the address
  const suffix = '' // set this to any string you want to change the address

  const bytes = derivationBytes(prefix, suffix)

  const derivationPrefix = Utils.toBase64(bytes.derivationPrefix)
  const derivationSuffix = Utils.toBase64(bytes.derivationSuffix)

  const paymentRemittance = {
    derivationPrefix,
    derivationSuffix,
    senderIdentityKey: new PrivateKey(1).toPublicKey().toString()
  }

  return {
    keyId: keyID(derivationPrefix, derivationSuffix),
    identityKey: paymentRemittance.senderIdentityKey,
    paymentRemittance
  }
}

export function keyID(derivationPrefix: string, derivationSuffix: string) {
  return `${derivationPrefix} ${derivationSuffix}`
}

export function derivationBytes(
  prefix: string,
  suffix: string,
  opts?: { encoding?: 'utf8' | 'base64' }
) {
  let derivationPrefix = Utils.toArray(oldPrefix, 'base64')
  let derivationSuffix = Utils.toArray(oldSuffix, 'base64')
  if (prefix) {
    derivationPrefix = Utils.toArray(prefix, opts?.encoding || 'utf8')
  }
  if (suffix) {
    derivationSuffix = Utils.toArray(suffix, opts?.encoding || 'utf8')
  }

  return {
    derivationPrefix,
    derivationSuffix
  }
}
