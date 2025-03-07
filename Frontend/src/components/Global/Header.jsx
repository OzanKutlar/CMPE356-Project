import React, {useState} from "react";
import CartBar from "../HomePage/CartBar/CartBar.jsx";
import LoginPopup from "./PopUps/LoginPopup.jsx";
import Util from "../../Util.js";
import UserProfile from "./PopUps/UserProfile.jsx";
import ChangePassword from "./PopUps/ChangePasswordPopup.jsx";

const Header = () => {
    const [showLogin, setShowLogin] = useState(false);
    const [showPassReset, setPassReset] = useState(false);
    const [showNavbar, setShowNavbar] = useState(false);

    Util.CallLogin = () => {
        setShowLogin(true);
    };

    Util.CallPasswordReset = () => {
        setPassReset(true);
    };


    Util.footerColor = "bg-rose-500";

    return (
        <>
            <header className={`${Util.footerColor} flex justify-between items-center p-2 relative`}>
                {/* Navigation Button */}
                <button
                    className="w-10 h-10 flex justify-center items-center rounded-lg bg-rose-50 cursor-pointer transition-all duration-300 hover:bg-red-600 ml-3 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
                    onClick={() => setShowNavbar(!showNavbar)}
                >
                    <img
                        src="/src/assets/trolley.svg"
                        alt="Trolley Icon"
                        className="w-6 h-6 transition-all duration-300 group-hover:invert group-hover:brightness-0 group-hover:contrast-200"
                    />
                </button>

                {/* Title */}
                <a
                    className="pl-20 transition-all duration-300 text-3xl font-bold text-red-50 text-center flex-grow hover:text-blue-300 mr-6"
                    target="_blank"
                    onClick={() => Util.navigateTo("home")}
                >
                    MeatGo
                </a>
                {/* Login Button or User Profile */}
                {Util.savedUser.id !== "" ? (
                    <UserProfile/>
                ) : (
                    <button
                        className="w-30 h-12 bg-rose-50 text-rose-700 rounded-3xl cursor-pointer transition-all duration-300 hover:bg-red-600 hover:text-white mr-3 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        onClick={() => setShowLogin(true)}
                    >
                        Login/Register
                    </button>
                )}
            </header>
            {/* Always render CartBar, but control its visibility */}
            <CartBar showNavbar={showNavbar} setShowNavbar={setShowNavbar}/>

            {/* Login Popup */}
            {showLogin && <LoginPopup setShowLogin={setShowLogin}/>}

            {showPassReset && <ChangePassword setChangePass={setPassReset}/>}
        </>
    );
};

export default Header;
