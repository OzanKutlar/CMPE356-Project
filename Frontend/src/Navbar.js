import { useState } from "react";
import { Menu } from "lucide-react";

export default function MeatStore() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`bg-red-700 text-white p-4 h-full transition-all duration-300 ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          <Menu size={24} />
        </button>
        {isOpen && (
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
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-4xl font-bold">Meat Store</h1>
      </div>
    </div>
  );
}
