import React, { useState, useEffect } from 'react';
import './LoginPopup.css'; // for styles
import Util from '../../Util.js';

const LoginPopup = () => {
  const [username, setUsername] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [buttonText, setButtonText] = useState('Login');
  const [buttonColor, setButtonColor] = useState('#007bff');

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
    }, 400);
    setShowPasswordField(false);
    setShowConfirmPasswordField(false);
    setButtonText('Login'); // Set to login
    setButtonColor('#007bff'); // Set to blue
    return () => clearTimeout(timer); // Cleanup the timer when username changes
  }, [username]);

  // Simulate the backend request to check if the user exists
  const checkUserExistence = async (usernameString) => {
    console.log("Trying to send backend request with user : " + usernameString);
    try {
      // Make the backend call here
      const data = await Util.callBackend(`check-user`, {username: usernameString});
      console.log("Recieved that the user " + data.exists);

      // Based on the response, show/hide password fields
      if (data.exists) {
        setShowPasswordField(true);
        setShowConfirmPasswordField(false);
        setButtonText('Login'); // Set to login
        setButtonColor('#007bff'); // Set to blue
      } else {
        setShowPasswordField(true);
        setShowConfirmPasswordField(true);
        setButtonText('Register'); // Change to Register
        setButtonColor('orange'); // Change to orange color
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
    }
  };

  // Submit login or register form (you can modify this to your needs)
  const handleLoginClick = () => {
    console.log(`${buttonText} clicked`);
    checkUserExistence(username);
    // Add your login or registration logic here
  };

  return (
    <div className={`popup ${fadeIn ? 'fade-in' : ''}`}>
      <div className="login-container">
        <h2>{buttonText === 'Login' ? 'Login' : 'Register'}</h2> {/* Heading for login or register */}
        
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className={`password-field ${showPasswordField ? 'active' : ''}`}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className={`password-field confirm-password-field ${showConfirmPasswordField ? 'active' : ''}`}
        />

        {/* Login/Register button */}
        <button
          className="login-button"
          onClick={handleLoginClick}
          style={{ backgroundColor: buttonColor }} // Dynamically change button color
        >
          {buttonText} {/* Dynamically change button text */}
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;
