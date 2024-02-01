import { useSkContext } from "@/app/context/secretKeyContext"
import { hasFailed } from "@/app/globals";
import { NostrService } from "@/app/services/NostrService"

function Profile() {

  const { keyPair, setKeyPair } = useSkContext()

  // getEvents()
  async function getProfile() {
    const events = await NostrService.getProfileEvents('72c3b924c01e2bc4a75f042bf53bc86670a52fac4d32e563ec166271fbba5141')
    console.log(events)
  }
  getProfile()


  return (
    <>
      <h1>Profile</h1>
      {keyPair && <p>KeyPair: {JSON.stringify(keyPair)}</p>}
    </>
  )

}

export default Profile