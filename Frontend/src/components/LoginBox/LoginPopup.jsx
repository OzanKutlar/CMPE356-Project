import React, { useState, useEffect } from 'react';
import './LoginPopup.css'; // for styles

const LoginPopup = () => {
  const [username, setUsername] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    return () => setFadeIn(false);
  }, []);

  // Handle typing effect and backend request
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username.trim()) {
        checkUserExistence(username);
      }
    }, 700);

    return () => clearTimeout(timer); // Cleanup the timer when username changes
  }, [username]);

  // Simulate the backend request to check if the user exists
  const checkUserExistence = async (username) => {
    try {
      // Make the backend call here
      const response = await fetch(`/api/check-user?username=${username}`);
      const data = await response.json();

      // Based on the response, show/hide password fields
      if (data.exists) {
        setShowPasswordField(true);
        setShowConfirmPasswordField(false);
      } else {
        setShowPasswordField(true);
        setShowConfirmPasswordField(true);
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
    }
  };

  return (
    <div className={`popup ${fadeIn ? 'fade-in' : ''}`}>
      <div className="login-container">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {showPasswordField && (
          <input
            type="password"
            placeholder="Password"
            className="password-field"
          />
        )}
        {showConfirmPasswordField && (
          <input
            type="password"
            placeholder="Confirm Password"
            className="password-field confirm-password-field"
          />
        )}
      </div>
    </div>
  );
};

export default LoginPopup;
