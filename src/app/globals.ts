import { KeyPair } from "./services/NostrService"

const DEFAULT_RELAYS = [
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://relay.snort.social',
]

const DEFAULT_KEYPAIR: KeyPair = { sk: new Uint8Array(), nsec: 'nsec1', pk: '', npub: 'npub1' }

export {
  DEFAULT_RELAYS,
  DEFAULT_KEYPAIR
}

export type Failed = {
  code: number,
  message: string
}


export function hasFailed(res: any | Failed): res is Failed {
  return (typeof res === 'object' && "code" in res && "message" in res)
}