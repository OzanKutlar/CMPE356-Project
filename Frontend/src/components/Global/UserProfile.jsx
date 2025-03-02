import React, {useState} from 'react';
import Util from "../../Util.js";

export default function UserProfile() {
    const [menuOpen, setMenuOpen] = useState(false);

    // Assuming Util.savedUser contains user data
    const savedUser = Util.savedUser;
    const profilePictureURL = savedUser.profilePictureURL || '/default-profile.png'; // Fallback to a default image
    const isAdmin = savedUser.role === 'admin';

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const handleEditProfile = () => {
        console.log('Edit Profile clicked');
        // Add logic for editing profile here
    };

    const handleChangePassword = () => {
        console.log('Change Password clicked');
        // Add logic for changing password here
    };

    const handleSwitchToAdminPanel = () => {
        console.log('Switch to Admin Panel clicked');
        // Add logic for switching to admin panel here
    };

    return (
        <div className="relative inline-block">
            <img
                src={profilePictureURL}
                alt="User Profile"
                className="w-16 h-16 rounded-full cursor-pointer"
                onClick={toggleMenu}
            />
            {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                    <button
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={handleEditProfile}
                    >
                        Edit Profile
                    </button>
                    <button
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={handleChangePassword}
                    >
                        Change Password
                    </button>
                    {isAdmin && (
                        <button
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                            onClick={handleSwitchToAdminPanel}
                        >
                            Switch to Admin Panel
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}