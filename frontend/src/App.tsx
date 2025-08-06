import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Notification from "./components/Notification";
import Login from "./pages/Login";
import CreateUser from "./pages/CreateUser";
import Home from "./pages/Home";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Notification />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create-user" element={<CreateUser />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
