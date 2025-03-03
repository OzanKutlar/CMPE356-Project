import React, { useState } from "react";
import CartBar from "../HomePage/CartBar/CartBar.jsx";
import LoginPopup from "../Global/LoginPopup.jsx";
import Util from "../../Util.js";
import UserProfile from "../Global/UserProfile.jsx";
import NavbarButcher from "./NavbarButcher.jsx";

const Header = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [showNavbar, setShowNavbar] = useState(false);

    return (
        <>
            <header className="bg-gray-300 flex justify-between items-center p-2 relative">
                {/* Navigation Button */}
                <button
                    className="w-10 h-10 flex justify-center items-center text-2xl rounded-lg bg-gray-800 text-white cursor-pointer transition-all duration-300 hover:bg-gray-600 hover:text-white ml-3 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={() => setShowNavbar(!showNavbar)}
                >
                    ☰
                </button>
                {/* Title */}
                <h1 className="text-3xl font-bold text-rose-950 text-center flex-grow">
                    Butcher Panel
                </h1>
                {/* Login Button or User Profile */}
                {Util.savedUser.id !== "" ? (
                    <UserProfile/>
                ) : (
                    <button
                        className="w-20 h-10 bg-gray-800 text-white rounded-3xl cursor-pointer transition-all duration-300 hover:bg-gray-800 hover:text-white mr-3 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        onClick={() => setShowLogin(true)}
                    >
                        Login
                    </button>
                )}
            </header>
            {/* Always render CartBar, but control its visibility */}
            <NavbarButcher showNavbar={showNavbar} setShowNavbar={setShowNavbar}/>

            {/* Login Popup */}
            {showLogin && <LoginPopup setShowLogin={setShowLogin}/>}
        </>
    );
};

export default Header;
