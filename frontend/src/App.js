import { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";

import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Profile from "./Pages/Profile";
import Logout from "./Pages/Logout";
import Home from "./Pages/Home";

import {AlertProvider} from "./Layout/SetAlert";

function App() {

  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        
        {/* 헤더 */}
        <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center fixed top-0 left-0 right-0 z-50">
          <div className="flex items-center space-x-2">
            <button
              ref={hamburgerRef}
              className="text-2xl font-bold focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              &#9776;
            </button>
            <h1 className="text-2xl font-bold">
              <Link to="/">TEST.COM</Link>
            </h1>
          </div>

          {/* 네비게이션 */}
          <nav className="space-x-4">
            {user ? (
              <>
                <Link to="/profile" className="hover:underline">{user}</Link>
                <Logout onLogout={handleLogout} />
              </>
            ) : (
              <Link to="/login" className="hover:underline">로그인</Link>
            )}
          </nav>
        </header>

        {/* 사이드바 */}
        <div
          ref={sidebarRef}
          className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md transform transition-transform duration-300 z-40 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 font-bold border-b">Navigation</div>
          <ul className="p-4 space-y-2">
            <li>
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="block text-black-300 font-bold text-lg hover:underline"
              >
                Home
              </Link>
            </li>
          </ul>
        </div>

        {/* 메인 */}
        <main className="p-4 mt-16">
        <AlertProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
          </Routes>
        </AlertProvider>
        </main>
      </div>
    </Router>
  );
}

export default App;
