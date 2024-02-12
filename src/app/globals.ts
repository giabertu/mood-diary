import { KeyPair } from "./services/NostrService"

const DEFAULT_RELAYS = [
  'wss://relay.primal.net',
  'wss://relay.damus.io',
  'wss://offchain.pub',
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

export function isValidPk (pk: string) {
  return pk.length === 64
}



export const getDate = (timestamp: number) => {
    //if older than 48h ago:
    const now = Math.floor(Date.now() / 1000)
    if (timestamp < now - 48 * 60 * 60) {
      return new Date(timestamp * 1000).toLocaleDateString()
    } else {
      if (timestamp < now - 60 * 60) {
        const hrs = Math.floor((now - timestamp) / 60 / 60)
        if (hrs > 24) return Math.floor(hrs / 24) + 'd ago'
        return hrs + 'h ago'
      }
      if (timestamp < now - 60) {
        return Math.floor((now - timestamp) / 60) + 'm ago'
      }
      if (timestamp < now) {
        return Math.floor((now - timestamp)) + 's ago'
      }
    }

  }