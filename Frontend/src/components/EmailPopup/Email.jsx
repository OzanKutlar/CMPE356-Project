import "./Email.css";
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
      <div className={`popup-box ${isVisible ? "slide-up" : "slide-down"}`}>
        <button className="close-btn" onClick={handleClose}>✖</button>
        {!submitted ? (
          <>
            <h2>Subscribe to our Newsletter</h2>
            <p className="subtext">Subscribe to our newsletter for exclusive discounts & more</p>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </>
        ) : (
          <div className={`thank-you ${fadeOut ? "fade-out" : "fade-in"}`}>
            <h2 className="thank-you">Thank You!</h2>
          </div>
        )}
      </div>
    )
  );
}
