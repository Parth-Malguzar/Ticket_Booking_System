import { useLocation } from "react-router-dom"
import Movies from "./Movies"
import Concert from "./Concert"
import Train from "./Train"
import UserBookings from "./UserBookings"

const UserPage = () => {

   const location = useLocation()

   const tab =
      new URLSearchParams(
         location.search
      ).get("tab")
      ?? "dashboard"

   return (
      <>
         {tab === "dashboard" && <UserBookings />}

         {tab === "movies" && <Movies />}

         {tab === "concert" && <Concert />}

         {tab === "train" && <Train />}
      </>
   )
}

export default UserPage