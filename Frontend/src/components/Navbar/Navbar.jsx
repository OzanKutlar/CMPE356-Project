import React from "react";

const Navbar = ({ showNavbar, setShowNavbar }) => {
  return (
    <div
      className={`fixed top-0 left-0 w-72 h-full bg-gray-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out p-5 z-50 ${
        showNavbar ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <button
        className="bg-red-500 text-white rounded-lg px-4 py-2 cursor-pointer"
        onClick={() => setShowNavbar(!showNavbar)}
      >
        ☰
      </button>
      <nav className="mt-4">
        <ul className="space-y-2">
          {[
            "Weekly Discounted Offer",
            "Chicken",
            "Beef",
            "Mutton",
            "Sea-food",
            "Order",
            "Contact Us",
            "Logout",
          ].map((item) => (
            <li
              key={item}
              className="bg-gray-700 p-2 rounded-md hover:bg-red-600 cursor-pointer"
            >
              {item}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Navbar;
