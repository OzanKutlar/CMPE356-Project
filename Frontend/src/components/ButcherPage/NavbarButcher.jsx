import React from "react";
import Util from '../../Util.js';

const NavbarButcher = ({ currentPage }) => {
    const navigationItems = [
        { name: 'Home', path: 'home' },
        { name: 'Shop', path: 'shop' },
        { name: 'Cart', path: 'cart' },
        { name: 'Account', path: 'account' }
    ];

    const handleNavigation = (path) => {
        Util.navigateTo(path);
    };

    return (
        <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white shadow-xl z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo/Brand */}
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => handleNavigation('home')}>
                        <h1 className="text-xl font-bold">Your Store</h1>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex space-x-4">
                        {navigationItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => handleNavigation(item.path)}
                                className={`px-3 py-2 rounded-md text-sm font-medium
                  ${currentPage === item.path
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                } transition-colors duration-200`}
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavbarButcher;