import { generateSecretKey, getPublicKey } from 'nostr-tools'

let sk = generateSecretKey() // `sk` is a Uint8Array
let pk = getPublicKey(sk) // `pk` is a hex string

type KeyPair = {
  sk: Uint8Array,
  pk: string
}


class NostrService {

  constructor() {}

  static generateKeyPair(): KeyPair  {
    const sk = generateSecretKey()
    
    return {
      sk,
      pk: getPublicKey(sk)
    }      
  }

  static getPublicKey(sk: Uint8Array): string {
    return getPublicKey(sk)
  }




}


export { NostrService }

