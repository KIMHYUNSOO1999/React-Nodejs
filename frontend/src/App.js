import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Logout from "./pages/Logout";
import Home from "./pages/Home";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchAuth = async () => {
      try {
        const res = await axios.get("/api/v1/user/auth", { withCredentials: true });
        setUser(res.data.user);
      } catch (err) {
        setUser(null);
      }
    };
    fetchAuth();
  }, []);

  const handleLogout = () => {
    setUser(null); 
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <Link to="/">TEST.COM</Link>
          </h1>
          <nav className="space-x-4">
            <Link to="/" className="hover:underline">홈</Link>
            {user ? (
              <>
                <Link to="/profile" className="hover:underline">{user}</Link>
                <Logout onLogout={() => setUser(null)} />
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">로그인</Link>
              </>
            )}
          </nav>
        </header>

        <main className="p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
