import React, { useState, useEffect } from 'react';
import './LoginPopup.css'; // for styles
import Util from '../../Util.js'

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
  const checkUserExistence = async (usernameString) => {
  	console.log("Trying to send backendrequest with user : " + usernameString)
    try {
      // Make the backend call here
      console.log("One");
      const data = await Util.callBackend(`check-user`, {username: usernameString});
      console.log("Two");
      console.log("Recieved that the user " + data.exists);

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

  // Submit login form (you can modify this to your needs)
  const handleLoginClick = () => {
    console.log('Login clicked');
    checkUserExistence(username);
    // Add your login logic here
  };

  return (
    <div className={`popup ${fadeIn ? 'fade-in' : ''}`}>
      <div className="login-container">
        <h2>Login</h2> {/* Heading for login */}
        
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

        {/* Login button */}
        <button className="login-button" onClick={handleLoginClick}>
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;
