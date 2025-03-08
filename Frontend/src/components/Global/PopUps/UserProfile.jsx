import React, {useContext, useState} from 'react';
import Util from "../../../Util.js";
import {GlobalContext} from '../GlobalContext.jsx';

export default function UserProfile() {
    const [menuOpen, setMenuOpen] = useState(false);

    // Assuming Util.savedUser contains user data
    const savedUser = Util.savedUser;
    const profilePictureURL = savedUser.profilePictureLink || '/default-profile.png'; // Fallback to a default image
    const isAdmin = savedUser.role === 'admin';
    const isDelivery = savedUser.role === 'delivery';
    const isButcher = savedUser.role === 'butcher';
    const currentPage = useContext(GlobalContext);

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const handleAction = (action) => {
        switch (action) {
            case 'editProfile':
                // Add logic for editing profile here
                break;
            case 'changePassword':
                Util.forgot = false;
                Util.CallPasswordReset(true);
                break;
            case "orders":
                Util.navigateTo("orders");
                break;
            case 'switchToAdminPanel':
                Util.navigateTo("admin");
                break;
            case 'switchToDeliveryPanel':
                Util.navigateTo("delivery");
                break;
            case 'logout':
                Util.navigateTo("home");
                Util.delUser();
                break;
            case 'switchToButcher':
                Util.navigateTo("butcher");
                break;
            case 'switchToHome':
                Util.navigateTo("home");
                break;
            default:
                break;
        }
    };

    const inSpecialistPage = (currentPage) => {
        return !(currentPage.startsWith("admin") || currentPage.startsWith("butcher") || currentPage.startsWith("delivery"));
    }

    return (
        <div className="relative inline-block ">
            <img
                src={profilePictureURL}
                alt="User Profile"
                className="w-10 h-10 rounded-full cursor-pointer border-4 border-gray-300"
                onClick={toggleMenu}
            />
            {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
                    <button
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => handleAction('editProfile')}
                    >
                        Edit Profile
                    </button>
                    <button
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => handleAction('orders')}
                    >
                        My Orders
                    </button>
                    <button
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => handleAction('changePassword')}
                    >
                        Change Password
                    </button>
                    {inSpecialistPage(currentPage) ? (
                            <>
                                {isAdmin && (
                                    <button
                                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                        onClick={() => handleAction('switchToAdminPanel')}
                                    >
                                        Switch to Admin Panel
                                    </button>
                                )}
                                {isDelivery && (
                                    <button
                                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                        onClick={() => handleAction('switchToDeliveryPanel')}
                                    >
                                        Switch to Delivery Panel
                                    </button>
                                )}
                                {isButcher && (
                                    <button
                                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                        onClick={() => handleAction('switchToButcher')}
                                    >
                                        Switch to Butcher Panel
                                    </button>
                                )}
                            </>
                        ) :
                        (
                            <button
                                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                onClick={() => handleAction('switchToHome')}
                            >
                                Return to Home Page
                            </button>
                        )
                    }

                    <button
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => handleAction('logout')}
                    >
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );
}
