import { generateSecretKey, getPublicKey, Relay } from 'nostr-tools'

let sk = generateSecretKey() // `sk` is a Uint8Array
let pk = getPublicKey(sk) // `pk` is a hex string

type KeyPair = {
  sk: Uint8Array,
  pk: string
}


class NostrService {

  constructor() { }

  static generateKeyPair(): KeyPair {
    const sk = generateSecretKey()

    return {
      sk,
      pk: getPublicKey(sk)
    }
  }

  static getPublicKey(sk: Uint8Array): string {
    return getPublicKey(sk)
  }

  static async connectToRelay(url: string) {
    const relay = await Relay.connect(url)
    console.log(`connected to `, relay)
    const sub = relay.subscribe([
      { authors: ['npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3evf6u64th6gkwsyjh6w6'] },
    ], {
      onevent(event) {
        console.log('we got the event we wanted:', event)
      },
      oneose() {
        sub.close()
      }
    })
    return relay
  }




}


export { NostrService }
/**
 *     const events = await pool.querySync(relays, {
      authors: ['72c3b924c01e2bc4a75f042bf53bc86670a52fac4d32e563ec166271fbba5141'],
    })

    console.log({events})
 */

/**
 * import { Relay, finalizeEvent, generateSecretKey, getPublicKey } from 'nostr-tools'

const relay = await Relay.connect('wss://relay.example.com')
console.log(`connected to ${relay.url}`)

// let's query for an event that exists
const sub = relay.subscribe([
  {
    ids: ['d7dd5eb3ab747e16f8d0212d53032ea2a7cadef53837e5a6c66d42849fcb9027'],
  },
], {
  onevent(event) {
    console.log('we got the event we wanted:', event)
  },
  oneose() {
    sub.close()
  }
})

// let's publish a new event while simultaneously monitoring the relay for it
let sk = generateSecretKey()
let pk = getPublicKey(sk)

relay.sub([
  {
    kinds: [1],
    authors: [pk],
  },
], {
  onevent(event) {
    console.log('got event:', event)
  }
})

let eventTemplate = {
  kind: 1,
  created_at: Math.floor(Date.now() / 1000),
  tags: [],
  content: 'hello world',
}

// this assigns the pubkey, calculates the event id and signs the event in a single step
const signedEvent = finalizeEvent(eventTemplate, sk)
await relay.publish(signedEvent)

relay.close()
 * 
 * 
 * 
 */
