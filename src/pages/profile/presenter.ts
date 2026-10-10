export function maskOpenId(openId: string): string {
  if (openId.length <= 10) return openId
  return `${openId.slice(0, 6)}…${openId.slice(-4)}`
}
