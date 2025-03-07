import { useState } from "react";
import UserProfile from '../Global/PopUps/UserProfile.jsx';
import PropTypes from 'prop-types';
import Util from "../../Util.js";
import LoginPopup from "../Global/PopUps/LoginPopup.jsx";

export default function NavbarDelivery({activeTab, handleTabClick}) {
    const [showLogin, setShowLogin] = useState(false);

    return (
        <nav className="bg-stone-700 p-2">
            <div className="flex justify-between items-center">
                <div className="flex space-x-4">
                    {['Waiting Orders', 'Taken Orders'].map((tab) => (
                        <button
                            key={tab}
                            className={`px-4 py-2 text-white rounded-lg transition-all ${activeTab === tab ? 'bg-emerald-700 duration-100 ' : 'hover:bg-emerald-600 duration-300'}`}
                            onClick={() => handleTabClick(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Login Button or User Profile */}
                {Util.savedUser.id !== "" ? (
                    <UserProfile/>
                ) : (
                    <button
                        className="w-20 h-10 bg-emerald-700 text-white rounded-3xl cursor-pointer transition-all duration-300 mr-3 focus:ring-2 hover:bg-emerald-600 hover:text-white focus:ring-red-500 focus:ring-offset-2"
                        onClick={() => setShowLogin(true)}
                    >
                        Login
                    </button>
                )}
                {showLogin && <LoginPopup setShowLogin={setShowLogin}/>}
            </div>
        </nav>
    )
}

NavbarDelivery.propTypes = {
    activeTab: PropTypes.string,
    handleTabClick: PropTypes.func
};
