import { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import axios from "axios";

import Home from "./Pages/Home";
import Register from "./Pages/Register";
import Login from "./Pages/Login";
import Profile from "./Pages/Profile";
import Board from "./Pages/Board";
import ResetPw from "./Pages/ResetPw";
import FindEmail from "./Pages/FindEmail";

import { Header } from "./Layout/Header";
import { Navigation } from "./Layout/Navigation";
import { AlertProvider } from "./Layout/SetAlert";
import { Sidebar } from "./Layout/Sidebar";


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
      <AlertProvider>
      <div className="min-h-screen bg-gray-50">
        
        {/* 헤더 */}
        <header className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center fixed top-0 left-0 right-0 z-50">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} hamburgerRef={hamburgerRef} />
          <Navigation user={user} onLogout={handleLogout} />
        </header>

        {/* 사이드바 */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} sidebarRef={sidebarRef} />

        {/* 메인 */}
        <main className="p-1 mt-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Board" element={<Board />} />
            <Route path="/register" element={<Register />} />
            <Route path="/find-email" element={<FindEmail />} />
            <Route path="/reset-password" element={<ResetPw />} />
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
          </Routes>
        </main>
      </div>
      </AlertProvider>
    </Router>
  );
}

export default App;
