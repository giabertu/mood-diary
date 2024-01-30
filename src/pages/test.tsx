import { NostrService } from '@/services/NostrService'
import React, { useState } from 'react'


function Test(){


  const [privKey, setPrivKey] = useState<Uint8Array>(new Uint8Array(0))
  const [pubKey, setPubKey] = useState<string>('')
  


  return (
    <div>
      Ciao this is a test page

      <button
        onClick={() => {
          const keyPair = NostrService.generateKeyPair()
          setPrivKey(keyPair.sk)
          setPubKey(keyPair.pk)
        }}
      >Click to generate private key / pub key pair</button>

      {privKey.length > 0 && <div>Private key: {privKey}</div>}
      {pubKey ? <div>Public key: {pubKey}</div> : null}
    </div>
  )


}


export default Test