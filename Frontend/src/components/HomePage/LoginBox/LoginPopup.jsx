import React, { useState, useEffect } from 'react';
import Util from '../../../Util.js';

const LoginPopup = () => {
  const [username, setUsername] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [buttonText, setButtonText] = useState('Login');
  const [buttonDest, setButtonDest] = useState('home');
  const [buttonColor, setButtonColor] = useState('#007bff');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    return () => setFadeIn(false);
  }, []);

  // When the username changes, reset fields and check for existence after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (username.trim()) {
        checkUserExistence(username);
      }
    }, 400);
    setShowPasswordField(false);
    setShowConfirmPasswordField(false);
    setButtonText('Login');
    setButtonColor('#007bff');
    return () => clearTimeout(timer);
  }, [username]);

  const checkUserExistence = async (usernameString) => {
    console.log("Trying to send backend request with user: " + usernameString);
    try {
      const data = await Util.callBackend(`check-user`, { username: usernameString });
      console.log("Received that the user exists? " + data.exists);
      if (data.exists) {
        setShowPasswordField(true);
        setShowConfirmPasswordField(false);
        setButtonText('Login');
        setButtonColor('#007bff');
        setButtonDest(data.role);
      } else {
        setShowPasswordField(true);
        setShowConfirmPasswordField(true);
        setButtonText('Register');
        setButtonColor('orange');
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
    }
  };

  const handleLoginClick = () => {
    console.log(`${buttonText} clicked`);
    Util.navigateTo("admin");
  };

  return (
    <div
      className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 w-[300px] p-5 z-[3] bg-white rounded-[8px] shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-transform duration-500 ease-in-out ${fadeIn ? 'translate-y-0' : 'translate-y-[100px] opacity-0'}`}
    >
      <div className="flex flex-col items-center">
        <h2 className="mb-5 text-2xl text-[#333]">
          {buttonText === 'Login' ? 'Login' : 'Register'}
        </h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2.5 my-2.5 border border-[1px] border-[#ccc] rounded-[4px]"
        />
        <input
          type="password"
          placeholder="Password"
          className={`w-full p-2.5 my-2.5 border border-[1px] border-[#ccc] rounded-[4px] overflow-hidden transition-all duration-300 ease-in-out ${
            showPasswordField ? 'max-h-[50px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
          }`}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className={`w-full p-2.5 my-2.5 border border-[1px] border-[#ccc] rounded-[4px] overflow-hidden transition-all ease-in-out ${
            showConfirmPasswordField ? 'max-h-[50px] opacity-100' : 'max-h-0 opacity-0'
          }`}
          style={{ transition: 'max-height 0.35s ease-in-out, opacity 0.3s ease-in-out' }}
        />
        <button
          onClick={handleLoginClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ backgroundColor: isHovered ? '#0056b3' : buttonColor }}
          className="mt-[15px] px-5 py-2 rounded-[4px] text-[16px] text-white cursor-pointer transition-colors duration-300"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;
