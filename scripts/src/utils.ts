// In `scripts/src/utils.ts`
export function toB64(data: Uint8Array): string {
  return Buffer.from(data).toString('base64')
}

export function fromB64(data: string): Uint8Array {
  return Buffer.from(data, 'base64')
}
