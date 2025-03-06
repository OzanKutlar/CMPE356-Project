import React from "react";
import Util from '../../../Util.js';

const NavbarButcher = ({showNavbar, setShowNavbar}) => {
    const navigatePages = [
        {name: 'Home', path: 'butcher'},
        {name: 'Add Items', path: 'butcher/add'},
        {name: 'Sales', path: 'butcher/sales'},
        {name: 'Reviews', path: 'butcher/reviews'}
    ];


    return (
        <div
            className={`fixed top-0 left-0 w-72 h-full bg-gray-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out p-5 z-50 ${
                showNavbar ? "translate-x-0" : "-translate-x-full"
            }`}
        >
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Navigation</h2>
                <button
                    className="bg-red-500 text-white rounded-lg px-4 py-2 cursor-pointer"
                    onClick={() => setShowNavbar(!showNavbar)}
                >
                    ☰
                </button>
            </div>

            <div className="mt-4 space-y-4">
                {navigatePages.map((navItem, index) => (
                    <button
                        key={index}
                        className="block w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-md font-medium"
                        onClick={() => {
                            Util.navigateTo(navItem.path);
                            setShowNavbar(false);
                        }}
                    >
                        {navItem.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default NavbarButcher;