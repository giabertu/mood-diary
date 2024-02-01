import { SimplePool } from "nostr-tools";
import { DEFAULT_RELAYS } from "../globals";

function getUnit8ArrayFromHex(hex: string){
  const arr = Uint8Array.from(Buffer.from(hex, 'hex'));
  return arr
}

function getHexFromUnit8Array(arr: Uint8Array){
  const hex = Buffer.from(arr).toString('hex');
  return hex
}

export {
  getUnit8ArrayFromHex,
  getHexFromUnit8Array
}


export const pool = new SimplePool(); 


let h = pool.subscribeMany(
  DEFAULT_RELAYS,
  [
    {
      authors: ['32e1827635450ebb3c5a7d12c1f8e7b2b514439ac10a67eef3d9fd9c5c68e245'],
    },
  ],
  {
    onevent(event) {
      // this will only be called once the first time the event is received
      // ...
      // console.log("Received ", event)
    },
    oneose() {
      h.close()
    }
  }
)


