import React from "react";
import "./Navbar.css";

const Navbar = ({ showNavbar, setShowNavbar }) => {
  return (
    <div className={`slidingBar ${showNavbar ? "open" : ""}`}>
      <button className="nav-btnNav" onClick={() => setShowNavbar(!showNavbar)}>
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
              className="p-2 bg-gray-800 text-white rounded-md hover:bg-red-600 cursor-pointer"
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
