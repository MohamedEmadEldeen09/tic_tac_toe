import { Route, RouterProvider, createBrowserRouter, 
  createRoutesFromElements } from "react-router-dom";

//components
import PlayerInfo from "./components/gameEntry/PlayerInfo";
import RoomId from "./components/gameEntry/RoomId";
import RoomRounds from "./components/gameEntry/RoomRounds";
import RoomDashboard from "./components/gameDashboard/RoomDashboard";
import AvailableRooms from "./components/gameEntry/AvailableRooms";
import AvailablePlayers from "./components/gameEntry/AvailablePlayers";
import Notifications from "./components/gameEntry/Notifications";
import RoomDetails from "./components/gameEntry/RoomDetails";
import JoinRoom from "./components/gameEntry/roomiD/JoinRoom";
import CreateRoom from "./components/gameEntry/roomiD/CreateRoom";
import EntryContainer from "./components/gameEntry/EntryContainer";
import RandomRoom from "./components/gameEntry/roomiD/RandomRoom";
import RedirectedPage from "./components/RedirectedPage";
//

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/tic_tac_toe" element={<RedirectedPage/>}/>
      <Route path="/tic_tac_toe/entry" element={<EntryContainer/>}>
        <Route index element={<PlayerInfo/>}/>
        <Route index path="player_info" element={<PlayerInfo/>}/>
        <Route path="room_id/:afterLeaveRoom"  element={<RoomId/>}>
          <Route index element={<CreateRoom/>}/>
          <Route path="join_room" element={<JoinRoom/>}/>
          <Route path="create_room" element={<CreateRoom/>}/>
          <Route path="random_room" element={<RandomRoom/>}/>
        </Route>
        <Route path="room_id"  element={<RoomId/>}>
          <Route index element={<CreateRoom/>}/>
          <Route path="join_room" element={<JoinRoom/>}/>
          <Route path="create_room" element={<CreateRoom/>}/>
          <Route path="random_room" element={<RandomRoom/>}/>
        </Route>
        <Route path="available_rooms" element={<AvailableRooms/>}/>
        <Route path="room_rounds" element={<RoomRounds/>}/>
        <Route path="available_players" element={<AvailablePlayers/>}/>
        <Route path="notifications" element={<Notifications/>}/>
        <Route path="room_details/:roomID" element={<RoomDetails/>}/>
      </Route>
      <Route path="/tic_tac_toe/dashboard">
        <Route path="room/:roomID/:entryWay" element={<RoomDashboard/>}/>
      </Route>
    </>
  )
)

function App() {
  return (
    <RouterProvider router={router}/>
  );
}

export default App;
