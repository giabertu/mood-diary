const DEFAULT_RELAYS = [
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://relay.snort.social',
]

export {
  DEFAULT_RELAYS,
}

export type Failed = {
  code: number,
  message: string
}


export function hasFailed(res: any | Failed): res is Failed{
  return (typeof res === 'object' && "code" in res && "message" in res)
}