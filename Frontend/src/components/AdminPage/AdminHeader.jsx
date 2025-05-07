import React, { useState } from "react";
import LoginPopup from "../Global/PopUps/LoginPopup.jsx";
import Util from "../../Util.js";
import UserProfile from "../Global/PopUps/UserProfile.jsx";

const AdminHeader = () => {
    const [showLogin, setShowLogin] = useState(false);
    Util.footerColor = "bg-blue-300";

    return (
        <>
            <header className={`${Util.footerColor} flex justify-between items-center p-2`}>
                {/* Title - Now centered with more space since navbar button is gone */}
                <h1 className="text-3xl font-bold text-rose-950 text-center flex-grow ml-[-170px]">
                    Admin Panel
                </h1>
                {/* Login Button or User Profile */}
                {Util.savedUser.id !== "" ? (
                    <UserProfile />
                ) : (
                    <button
                        className="w-20 h-10 bg-blue-800 text-white rounded-3xl cursor-pointer transition-all duration-300 hover:bg-blue-800 hover:text-white mr-3 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        onClick={() => setShowLogin(true)}
                    >
                        Login
                    </button>
                )}
            </header>

            {/* Login Popup */}
            {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
        </>
    );
};

export default AdminHeader;