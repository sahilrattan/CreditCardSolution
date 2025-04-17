import React, { useState, useEffect, createContext } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import Footer from "./components/Footer";
import SignUpForm from "./components/SignUpForm";
import SetPassword from "./components/SetPassword";
import ApplyCard from "./components/ApplyCard";
import CardDetailsPage from "./components/CardDetailsPage";
import ApplyCreditCardForm from "./components/ApplyCreditCardForm";
import Sidebar from "./components/SideBar";
import LoginForm from "./components/LoginForm";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import AdminLoginForm from "./components/AdminLoginForm";
import AdminPage from "./components/AdminPage";
import UserDashboard from "./components/UserDashboard";
import Home from "./components/Home"; // Moved to components for cleanliness
import Chatbot from "./components/Chatbot";

export const ThemeContext = createContext();

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/";
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    document.body.className = theme;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Router>
        <div className="app-wrapper">
          <Sidebar 
            isOpen={sidebarOpen} 
            toggleSidebar={toggleSidebar} 
            isLoggedIn={isLoggedIn}
            handleLogout={handleLogout}
          />
          <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <Routes>
              <Route path="/" element={<Home toggleSidebar={toggleSidebar} />} />
              <Route path="/signup" element={<SignUpForm />} />
              <Route path="/set-password/:userId" element={<SetPassword />} />
              <Route path="/login" element={<LoginForm setIsLoggedIn={setIsLoggedIn} />} />
              <Route path="/cards" element={<ApplyCard />} />
              <Route path="/cards/:id" element={<CardDetailsPage />} />
              <Route path="/apply/:cardId" element={<ApplyCreditCardForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/admin-login" element={<AdminLoginForm />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/user-dashboard" element={<UserDashboard />} />
              <Route path="/ApplyCard" element={<ApplyCard />} />

            </Routes>
            
<Chatbot />
          </div>
        </div>
      </Router>
    </ThemeContext.Provider>
  );
}

export default App;
