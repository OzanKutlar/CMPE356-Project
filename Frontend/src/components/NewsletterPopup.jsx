import "./NewsletterPopup.css";
import { useState, useEffect } from "react";

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setIsOpen(true); // Show the popup on page load
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => setIsOpen(false), 1500); // Close after showing "Thank You"
    }
  };

  return (
    isOpen && (
      <div className="popup-overlay">
        <div className="popup-box">
          {/* Close Button */}
          <button className="close-btn" onClick={() => setIsOpen(false)}>✖</button>

          {/* Content */}
          {!submitted ? (
            <>
              <h2>Subscribe to our Newsletter</h2>
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
            <h2 className="thank-you">Thank You!</h2>
          )}
        </div>
      </div>
    )
  );
}
