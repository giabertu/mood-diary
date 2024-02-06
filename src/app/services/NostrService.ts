import { DEFAULT_RELAYS, Failed, isValidPk } from '../globals'
import { getUnit8ArrayFromHex } from './utils'
import { generateSecretKey, getPublicKey, Relay, nip19 } from 'nostr-tools'
import { pool } from './utils'
import { Event } from 'nostr-tools'

let sk = generateSecretKey() // `sk` is a Uint8Array
let pk = getPublicKey(sk) // `pk` is a hex string

export type KeyPair = {
  sk: Uint8Array,
  nsec: `nsec1${string}`,
  pk: string,
  npub: `npub1${string}`
}

type PubKeyPair = {
  pk: string,
  npub: `npub1${string}`
}

type SecKeyPair = {
  sk: Uint8Array,
  nsec: `nsec1${string}`
}


class NostrService {

  constructor() { }

  static generateKeyPair(): KeyPair {
    const sk = generateSecretKey()
    const nsec = nip19.nsecEncode(sk)
    const pk = getPublicKey(sk)
    const npub = nip19.npubEncode(pk)
    return {
      sk,
      nsec,
      pk,
      npub
    }
  }


  static getKeyPair(sk: Uint8Array | string): KeyPair | Failed {
    try {
      let nsec: `nsec1${string}` = 'nsec1'
      if (typeof sk === 'string') {
        if (!sk.startsWith('nsec1')) {
          sk = getUnit8ArrayFromHex(sk)
          nsec = nip19.nsecEncode(sk)
        } else {
          nsec = sk as `nsec1${string}`

          const { type, data } = nip19.decode(nsec)
          sk = data as Uint8Array
        }
      } else {
        nsec = nip19.nsecEncode(sk)
      }

      pk = getPublicKey(sk)

      return {
        sk,
        nsec,
        pk,
        npub: nip19.npubEncode(pk)
      }
      //error is of type {message, stack}
    } catch (error) {
      console.error("Error: ", error)
      return {
        code: 500,
        message: 'The private key is either not valid or not in the right format. Make sure it starts with nsec.'
      }
    }
  }


  static checkSkFormat(sk: string) {
    console.log("sk", sk)
    const res = nip19.decode(sk)
    console.log("res", res)
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


  static connectToRelays() {
    let h = pool.subscribeMany(
      DEFAULT_RELAYS,
      [
      ],
      {
        onevent(event) {
          // this will only be called once the first time the event is received
          // ...
          console.log("Received ", event)
        },
        oneose() {
          h.close()
        }
      }
    )
  }

  static async getProfileEvents(pk: string) {
    let events = await pool.querySync(DEFAULT_RELAYS, { authors: [pk] })
    return events
  }

  //returns posts (not replies to posts) in cronological order
  static async getProfilePosts(pk: string) {
    let posts = await pool.querySync(DEFAULT_RELAYS, { kinds: [1], authors: [pk] })
    const mainPosts = posts.filter(post => {
      console.log("post", post)
      if (post.tags.length === 0) return true //no replies
      return post.tags[0][0] !== 'e' //not mentioning other events (a post is an event)
    })
    return mainPosts.toSorted((a: Event, b: Event) => b.created_at - a.created_at)
  }

  static async getProfileRelays(pk: string) {
    let relays = await pool.querySync(DEFAULT_RELAYS, { kinds: [3], authors: [pk] })
    return relays
  }

  static async getProfileFollowers(pk: string) {
    let followers = await pool.querySync(DEFAULT_RELAYS, { kinds: [3], "#p": [pk] })
    return followers
  }

  static async getProfileFollowing(pk: string) {
    let kind3 = await pool.querySync(DEFAULT_RELAYS, { kinds: [3], authors: [pk] })
    let following = kind3[0].tags.filter((arrString: string[]) => isValidPk(arrString[1]) && arrString[1])
    return following
  }

  static async getProfileInfo(pk: string) {
    let info = await pool.querySync(DEFAULT_RELAYS, { kinds: [0], authors: [pk] })
    return info
  }

  static async publishEvent(newEvent: Event) {
    try {
      const res = await Promise.all(pool.publish(DEFAULT_RELAYS, newEvent))
      console.log('published to at least one relay! ', res)
      return true
    } catch (error) {
      console.error('Error: ', error)
      return false
    }
  }


}


export { NostrService }