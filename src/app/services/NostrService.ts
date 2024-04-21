import { DEFAULT_RELAYS, Failed, isValidPk } from '../globals'
import { getHexFromUnit8Array, getUnit8ArrayFromHex } from './utils'
import { generateSecretKey, getPublicKey, Relay, nip19, finalizeEvent, EventTemplate, verifyEvent } from 'nostr-tools'
import { pool } from './utils'
import { Event } from 'nostr-tools'

let sk = generateSecretKey() // `sk` is a Uint8Array
let pk = getPublicKey(sk) // `pk` is a hex string

export type KeyPair = {
  sk: Uint8Array,
  nsec: string,
  pk: string,
  npub: string
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
        {kinds: [1]},
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

  static async getProfileEvents(pk: string[]) {
    let events = await pool.querySync(DEFAULT_RELAYS, { authors: pk })
    return events
  }

  // kind 1 text note, kind 6 is repost (content is stringified event object)
  static async getFeed(pks: string[]) {
    let feed = await pool.querySync(DEFAULT_RELAYS, { kinds: [1, 6], authors: pks, limit: 40 })
    console.log({ feed })
    const feedPosts = feed.filter(post => {
      if (post.kind === 6) return true //repost
      let isReply = false;
      for (let i = 0; i < post.tags.length; i++) {
        if (post.tags[i][0] === 'e') {
          isReply = true
          break;
        }
      }
      return !isReply
    })
    return feedPosts.toSorted((a: Event, b: Event) => b.created_at - a.created_at)
  }

  //returns posts (not replies to posts) in cronological order
  //pk needs to be in hex format
  static async getProfilePosts(pk: string) {
    let posts = await pool.querySync(DEFAULT_RELAYS, { kinds: [1, 6], authors: [pk] })
    console.log({ posts })
    const mainPosts = posts.filter(post => {
      // console.log("post", post)
      if (post.tags.length === 0) return true //no replies
      return post.tags[0][0] !== 'e' || post.kind == 6 //not mentioning other events (a post is an event) or is a repost
    })

    console.log({ initialPostLength: posts.length, filteredPostLength: mainPosts.length })

    return mainPosts.toSorted((a: Event, b: Event) => b.created_at - a.created_at)

  }

  static async getProfileRelays(pk: string) {
    let relays = await pool.querySync(DEFAULT_RELAYS, { kinds: [3], authors: [pk] })
    return relays
  }

  static async getPost(id: string) {
    let post = await pool.querySync(DEFAULT_RELAYS, { ids: [id] })
    return post
  }

  static async getPostEngagement(id: string) {
    console.log("Id in getPostEngagement ", { id })
    let found = false;
    let tries = 0;
    let res: Event[] = []
    while (!found && tries < 2) {
      res = await pool.querySync(DEFAULT_RELAYS, { kinds: [1, 6, 7], "#e": [id] }) //replies, reposts, reactions
      console.log("res in getPostEngagement ", { res, id })
      if (res.length > 0) {
        found = true
      }
      tries++
    }
    const replies: Event[] = []
    const reactions: Event[] = []
    const reposts: Event[] = []
    const postEng = { replies, reactions, reposts }
    for (let i = 0; i < res.length; i++) {
      if (res[i].kind === 1) {
        postEng.replies.push(res[i])
      } else if (res[i].kind === 7) {
        postEng.reactions.push(res[i])
      } else if (res[i].kind === 6) {
        reposts.push(res[i])
      }
    }
    return postEng
  }

  //nip-25
  static async likePost(eId: string, ePk: string, keyPair: KeyPair) {
    const { type, data } = nip19.decode(keyPair.nsec)
    const newData = data as Uint8Array
    const likeEvent = finalizeEvent({
      kind: 7,
      content: '+',
      tags: [['e', eId], ['p', ePk]],
      created_at: Math.floor(Date.now() / 1000)
    }, newData)
    const isGood = verifyEvent(likeEvent)
    const e = await Promise.any(pool.publish(DEFAULT_RELAYS, likeEvent))
    return e
  }


  static async postTweet(content: string, keyPair: KeyPair) {
    const { type, data } = nip19.decode(keyPair.nsec)
    const newData = data as Uint8Array
    const tweetEvent = finalizeEvent({
      kind: 1,
      content,
      tags: [],
      created_at: Math.floor(Date.now() / 1000)
    }, newData)
    const isGood = verifyEvent(tweetEvent)
    const e = await Promise.any(pool.publish(DEFAULT_RELAYS, tweetEvent))
    console.log({tweetEvent})
    return tweetEvent
  }

  //nip-18
  static async repostPost(ogE: Event, keyPair: KeyPair) {
    const { data } = nip19.decode(keyPair.nsec)
    const newData = data as Uint8Array
    const repostEvent = finalizeEvent({
      kind: 6,
      content: JSON.stringify(ogE),
      tags: [['e', ogE.id, 'wss://relay.primal.net'], ['p', ogE.pubkey]],
      created_at: Math.floor(Date.now() / 1000)
    }, newData)
    const isGood = verifyEvent(repostEvent)
    const e = await Promise.any(pool.publish(DEFAULT_RELAYS, repostEvent))
    return e
  }

  //nip-09 (eId is the of the like event)
  static async deleteEvent(eId: string, keyPair: KeyPair, content: string) {
    const { type, data } = nip19.decode(keyPair.nsec)
    const newData = data as Uint8Array
    const unlikePost = {
      kind: 5,
      content, //"unlike post", "unrepost event", "delete post" etc.
      tags: [['e', eId]],
      created_at: Math.floor(Date.now() / 1000)
    }

    const finalisedEvent = finalizeEvent(unlikePost, newData)
    await Promise.any(pool.publish(DEFAULT_RELAYS, finalisedEvent))
    return true
  }

  static async getProfileFollowers(pk: string) {
    let followers = await pool.querySync(DEFAULT_RELAYS, { kinds: [3], "#p": [pk] })
    console.log("followers in nostrservice ", { followers })
    if (followers.length == 0) return []
    // let followersList = followers.map((event: Event) => {event.pubkey, event.content}) //check the content if you want relay info
    let followersList = followers.map((event: Event) => event.pubkey)
    return followersList
  }

  static async getProfileFollowing(pk: string) {
    console.log("Here is the pk mf ", pk)
    let found = false;
    let tries = 0;
    while (!found && tries < 3) {
      let info = await pool.querySync(DEFAULT_RELAYS, { kinds: [3], authors: [pk] })
      // console.log("Profil in getProfileInfo ", {info})
      if (info.length > 0) {
        found = true
        let following = info[0].tags.filter((arrString: string[]) => isValidPk(arrString[1]) && arrString[1])
        return following.map((arrString: string[]) => arrString[1])
      }
      tries++
    }
    return []
  }



  //pass pk for user to follow, not npub!
  static async followProfile(pk: string, followingNoP: string[], keyPair: KeyPair) {
    const newFollowing = ['p', pk]
    const following = followingNoP.map(pubKey => ['p', pubKey])
    const { data } = nip19.decode(keyPair.nsec)
    const newData = data as Uint8Array
    const newFollowList = finalizeEvent({
      kind: 3,
      content: "",
      tags: [...following, newFollowing],
      created_at: Math.floor(Date.now() / 1000)
    }, newData)
    const isGood = verifyEvent(newFollowList)
    const e = await Promise.any(pool.publish(DEFAULT_RELAYS, newFollowList))
    console.log({ e })
    return e
  }

  static async unfollowProfile(pk: string, followingNoP: string[], keyPair: KeyPair) {
    const following = followingNoP.map(pubKey => ['p', pubKey])
    const { data } = nip19.decode(keyPair.nsec)
    const newData = data as Uint8Array
    const newFollowList = finalizeEvent({
      kind: 3,
      content: "",
      tags: following.filter(arr => arr[1] !== pk),
      created_at: Math.floor(Date.now() / 1000)
    }, newData)
    const isGood = verifyEvent(newFollowList)
    const e = await Promise.any(pool.publish(DEFAULT_RELAYS, newFollowList))
    console.log({ e })
    return e
  }

  static async getProfileInfo(pk: string[]) {
    // console.log("pk in getProfileInfo ", pk)
    let found = false;
    let tries = 0;
    while (!found && tries < 3) {
      let info = await pool.querySync(DEFAULT_RELAYS, { kinds: [0], authors: pk })
      // console.log("Profil in getProfileInfo ", {info})
      if (info.length > 0) {
        found = true
        return info
      }
      tries++
    }
    return []
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