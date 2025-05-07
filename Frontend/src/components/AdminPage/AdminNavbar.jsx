import React from "react";
import Util from "../../Util.js";

const AdminNavbar = () => {
    const navigatePages = [
        { name: "Manage Users", page: "admin/users" },
        { name: "Manage Stores", page: "admin/stores" },
        { name: "Manage Backend", page: "admin/backend" },
        { name: "Back To Shop", page: "home" }
    ];

    return (
        <div className="fixed top-0 left-0 w-72 h-full bg-gray-800 text-white shadow-xl p-5 z-40">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Navigation</h2>
            </div>
            <div className="mt-8 space-y-4">
                {navigatePages.map((navItem, index) => (
                    <button
                        key={index}
                        className="block w-full text-left bg-gray-700 hover:bg-gray-600 p-3 rounded-md font-medium"
                        onClick={() => {
                            Util.navigateTo(navItem.page);
                        }}
                    >
                        {navItem.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AdminNavbar;