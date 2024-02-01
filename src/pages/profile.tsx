import { useSkContext } from "@/app/context/secretKeyContext"

function Profile() {

  const {sk, setSecret} = useSkContext()

  return (
    <>
      <h1>Profile</h1>
      {sk && <p>Secret key: {sk}</p>}
    </>
  )

}

export default Profile