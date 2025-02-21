import React, { useState } from "react";
import "./Header.css"; 
import Navbar from "../Navbar/Navbar";
//import Login from "./Login"; // Assuming you have a Login component

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);

  return (
    <>
      <header className="header">
        {/* Navigation Button */}
        <button className="nav-btnHeader" onClick={() => setShowNavbar(!showNavbar)}>
          ☰
        </button>

        {/* Title */}
        <h1 className="title">E-Kasap</h1>

        {/* Login Button */}
        <button className="login-btnHeader" onClick={() => setShowLogin(true)}>
          Login
        </button>
      </header>

      {/* Always render Navbar, but control its visibility */}
      <Navbar showNavbar={showNavbar} setShowNavbar={setShowNavbar} />
    </>
  );
};

export default Header;
