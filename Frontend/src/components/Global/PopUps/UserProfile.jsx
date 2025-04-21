import React, { useContext, useState, useRef, useEffect } from 'react';
import Util from "../../../Util.js";
import { GlobalContext } from '../GlobalContext.jsx';
import EditProfile from './EditProfile.jsx';

export default function UserProfile() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const menuRef = useRef(null);
    const timeoutRef = useRef(null);

    // Assuming Util.savedUser contains user data
    const savedUser = Util.savedUser;
    const profilePictureURL = savedUser.profilePictureLink || '/default-profile.png';
    const isAdmin = savedUser.role === 'admin';
    const isDelivery = savedUser.role === 'delivery driver';
    const isButcher = savedUser.role === 'butcher';
    const currentPage = useContext(GlobalContext);

    // Calculate and update dropdown max height when visibility changes
    useEffect(() => {
        if (menuRef.current) {
            if (menuOpen) {
                const dropdownHeight = menuRef.current.scrollHeight;
                menuRef.current.style.maxHeight = `${dropdownHeight}px`;
            } else {
                menuRef.current.style.maxHeight = '0px';
            }
        }

        return () => {
            // Clear timeout when component unmounts
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [menuOpen]);

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const handleMouseLeave = () => {
        // Set timeout to close menu after 2 seconds
        timeoutRef.current = setTimeout(() => {
            setMenuOpen(false);
        }, 100);
    };

    const handleMouseEnter = () => {
        // Clear timeout if mouse re-enters the menu
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    };

    const handleAction = (action) => {
        switch (action) {
            case 'editProfile':
                Util.navigateTo("edit");
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
        <div className="userprofile-container relative inline-block">
            <style jsx="true">{`
                .userprofile-dropdown {
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
                    opacity: 0;
                    pointer-events: none; /* Disable pointer events when hidden */
                }

                .userprofile-dropdown-open {
                    opacity: 1;
                    visibility: visible; /* Make visible when open */
                    pointer-events: auto; /* Enable pointer events when visible */
                }
            `}</style>

            <img
                src={profilePictureURL}
                alt="User Profile"
                className="userprofile-avatar w-10 h-10 rounded-full cursor-pointer border-4 border-gray-300"
                onClick={toggleMenu}
            />

            <div
                ref={menuRef}
                className={`userprofile-dropdown absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 ${
                    menuOpen ? 'userprofile-dropdown-open' : ''
                }`}
                onMouseLeave={handleMouseLeave}
                onMouseEnter={handleMouseEnter}
            >
                <div className="userprofile-menu-content">
                    <button
                        className="userprofile-button block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => handleAction('editProfile')}
                    >
                        Edit Profile
                    </button>
                    <button
                        className="userprofile-button block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => handleAction('orders')}
                    >
                        My Orders
                    </button>
                    <button
                        className="userprofile-button block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => handleAction('changePassword')}
                    >
                        Change Password
                    </button>
                    {inSpecialistPage(currentPage) ? (
                            <>
                                {isAdmin && (
                                    <button
                                        className="userprofile-button block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                        onClick={() => handleAction('switchToAdminPanel')}
                                    >
                                        Switch to Admin Panel
                                    </button>
                                )}
                                {isDelivery && (
                                    <button
                                        className="userprofile-button block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                        onClick={() => handleAction('switchToDeliveryPanel')}
                                    >
                                        Switch to Delivery Panel
                                    </button>
                                )}
                                {isButcher && (
                                    <button
                                        className="userprofile-button block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                        onClick={() => handleAction('switchToButcher')}
                                    >
                                        Switch to Butcher Panel
                                    </button>
                                )}
                            </>
                        ) :
                        (
                            <button
                                className="userprofile-button block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                                onClick={() => handleAction('switchToHome')}
                            >
                                Return to Home Page
                            </button>
                        )
                    }

                    <button
                        className="userprofile-button block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                        onClick={() => handleAction('logout')}
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="userprofile-modal fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-20">
                    <EditProfile
                        user={savedUser}
                        onClose={() => setEditModalOpen(false)}
                    />
                </div>
            )}
        </div>
    );
}