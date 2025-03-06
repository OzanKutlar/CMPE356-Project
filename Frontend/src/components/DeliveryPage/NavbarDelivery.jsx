import UserProfile from '../Global/UserProfile';
import PropTypes from 'prop-types';
import Util from "../../Util.js";
import React, {useState} from "react";
import LoginPopup from "../Global/LoginPopup.jsx";

export default function NavbarDelivery({ activeTab, handleTabClick }) {

    const [showLogin, setShowLogin] = useState(false);

    Util.footerColor = "bg-gray-800";
  return(
    <nav className="bg-gray-800 p-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          {['A', 'B', 'C'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-white rounded ${activeTab === tab ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
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
                  className="w-20 h-10 bg-rose-50 text-rose-700 rounded-3xl cursor-pointer transition-all duration-300 hover:bg-red-600 hover:text-white mr-3 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
  activeTab: PropTypes.any,
  handleTabClick: PropTypes.func
};
