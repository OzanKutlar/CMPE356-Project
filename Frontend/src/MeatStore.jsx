import { useState } from "react";
import "./stylesheets.css"; // Ensure styles are applied

export default function MeatStore() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`navbar transition-all duration-300 ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
         ☰
        </button>

        {isOpen && (
          <nav>
            <ul>
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
                <li key={item}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Main Content */}
      <div className="content">
        <h1>Welcome to Meat Store</h1>
      </div>
    </div>
  );
}
