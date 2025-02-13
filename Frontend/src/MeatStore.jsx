import { useState } from "react";
import "./stylesheets.css"; // Ensure styles are applied

export default function MeatStore() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`navbar transition-all duration-300 ${
          isOpen ? "w-128" : "w-16"
        }`}
      >
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
         ☰
        </button>

        <div className={`sliding-bar ${isOpen ? 'open' : ''}`}>
			<button onClick={() => setIsOpen(!isOpen)} className="p-2">
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
				<li key={item} className="p-2 hover:bg-red-600 cursor-pointer">
				  {item}
				</li>
			  ))}
			</ul>
		  </nav>
		</div>
      </div>

      {/* Main Content */}
      <div className="content">
        <h1>Welcome to Our Store</h1>
      </div>
    </div>
  );
}
