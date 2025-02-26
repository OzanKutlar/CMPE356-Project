import React, { useState } from "react";
import Navbar from "../Navbar/Navbar";
import LoginPopup from "../LoginBox/LoginPopup";

const Header = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  
  return (
    <>
      <header className="bg-red-300 flex justify-between items-center p-2 relative">
        {/* Navigation Button */}
        <button
          className="w-10 h-10 flex justify-center items-center text-2xl rounded-lg bg-red-800 text-pink-200 cursor-pointer transition-all duration-300 hover:bg-red-600 hover:text-white ml-3 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          onClick={() => setShowNavbar(!showNavbar)}
        >
          ☰
        </button>
        {/* Title */}
        <h1 className="text-3xl font-bold text-black text-center flex-grow">
          E-Kasap
        </h1>
        {/* Login Button */}
        <button
          className="w-20 h-10 bg-red-800 text-pink-200 rounded-3xl cursor-pointer transition-all duration-300 hover:bg-red-600 hover:text-white mr-3 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          onClick={() => setShowLogin(true)}
        >
          Login
        </button>
      </header>
      {/* Always render Navbar, but control its visibility */}
      <Navbar showNavbar={showNavbar} setShowNavbar={setShowNavbar} />
      
      {/* Login Popup */}
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
    </>
  );
};

export default Header;