import logo from "./logo.svg";
import "./App.css";
import NavBar from "./components/NavBar";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import ViewListsIndex from "./components/Lists";
import CreateList from "./components/Lists/CreateList";
import CreateRoute from "./components/Lists/CreateRoute";
import ProfileSettings from "./components/ProfileSettings";
import Home from "./components/Home";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/view-lists" element={<ViewListsIndex />} />
          <Route path="/create-new" element={<CreateList />} />
          <Route path="/create-route" element={<CreateRoute />} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
          <Route path="*" element={<Link to="/">GO HOME, 404</Link>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
