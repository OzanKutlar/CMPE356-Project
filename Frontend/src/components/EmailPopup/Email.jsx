import { useState, useEffect } from "react";

export default function Email() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsOpen(true);
      setTimeout(() => setIsVisible(true), 10);
    }, 500);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setClosing(true);
      setTimeout(() => setIsOpen(false), 500);
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setFadeOut(true); // Initiate fade out for the form
      setTimeout(() => setFadeOut(false), 500); // Reset fade out after transition
      setTimeout(handleClose, 2000); // Close after some delay
    }
  };

  return (
    isOpen && (
      <div
        className={`popup-box fixed bottom-[-100px] left-[40%] bg-white w-[350px] p-[15px] rounded-[12px] text-center shadow-md transition-transform duration-500 ease-in-out opacity-100 ${
          isVisible ? "transform translate-y-[-120px]" : "transform translate-y-[100px] opacity-0"
        }`}
      >
        <button
          className="close-btn absolute top-[-10px] right-[-10px] w-[25px] h-[25px] bg-[#ff4d4d] text-white rounded-full cursor-pointer flex justify-center items-center shadow-lg transition-colors duration-300 ease-in-out hover:bg-[#cc0000]"
          onClick={handleClose}
        >
          ✖
        </button>
        {!submitted ? (
          <>
            <h2 className="text-lg font-semibold">Subscribe to our Newsletter</h2>
            <p className="text-sm text-[#555] mb-2">Subscribe to our newsletter for exclusive discounts & more</p>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-[90%] p-[8px] mt-[10px] border border-[#ccc] rounded-[5px] block"
              />
              <button
                type="submit"
                className="w-[80%] mt-[10px] bg-[#007bff] text-white p-[10px] rounded-[5px] cursor-pointer hover:bg-[#0056b3]"
              >
                Subscribe
              </button>
            </form>
          </>
        ) : (
          <div
            className={`thank-you text-green-600 text-[20px] transition-opacity duration-500 ease-in-out ${
              fadeOut ? "opacity-0" : "opacity-100"
            }`}
          >
            <h2>Thank You!</h2>
          </div>
        )}
      </div>
    )
  );
}
