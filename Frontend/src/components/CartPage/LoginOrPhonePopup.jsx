import React, {useState, useEffect} from 'react';
import Util from '../../Util.js';
import '../Global/LoginPopup.css'

const LoginOrPhone = ({setShowPopUp}) => {
    const [username, setUsername] = useState('');
    const [showPasswordField, setShowPasswordField] = useState(false);
    const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(false);
    const [fadeIn, setFadeIn] = useState(false);
    const [buttonText, setButtonText] = useState('Login');
    const [buttonDest, setButtonDest] = useState('home');
    const [buttonColor, setButtonColor] = useState('#007bff');
    const [isHovered, setIsHovered] = useState(false);


    console.log("Loaded in LoginOrPhone.jsx")
    useEffect(() => {
        const timeout = setTimeout(() => setFadeIn(true), 50);
        return () => {
            clearTimeout(timeout);
            setFadeIn(false);
        };
    }, []);

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
        try {
            const data = await Util.callBackend(`check-user`, {username: usernameString});
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

    const handleLoginClick = async () => {
        setShowPopUp(false);
        if(Util.CallLogin != null) {
            Util.CallLogin(true);
        }
    };

    const handleForgotPasswordClick = () => {
        Util.navigateTo('forgot');
    };

    return (
        <div className="login-popup-wrapper">
            {/* Background Overlay */}
            <div className="login-overlay" onClick={() => setShowPopUp(false)}></div>

            {/* Popup */}
            <div className={`login-popup ${fadeIn ? 'show' : ''}`}>
                <button
                    onClick={handleLoginClick}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{backgroundColor: isHovered ? '#0056b3' : buttonColor}}
                    className="w-full px-5 py-3 rounded text-white text-lg cursor-pointer transition-colors duration-300"
                >
                    {buttonText}
                </button>
                <h2 className="text-2xl font-bold mb-4">{buttonText === 'Login' ? 'Login' : 'Register'}</h2>
                <input
                    type="text"
                    placeholder='Write your username to login/register'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-3 mb-4 border rounded"
                />
                <div className={`password-field-container ${showPasswordField ? 'slide-down' : ''}`}>
                    {showPasswordField && (
                        <input type="password" placeholder="Password" className="w-full p-3 mb-4 border rounded"/>
                    )}
                    {showConfirmPasswordField && (
                        <input type="password" placeholder="Confirm Password"
                               className="w-full p-3 mb-4 border rounded"/>
                    )}
                </div>
                {buttonText === 'Login' && (
                    <button
                        className="forgot-password"
                        onClick={handleForgotPasswordClick}
                    >
                        Forgot Password?
                    </button>
                )}
            </div>
        </div>
    );
};

export default LoginOrPhone;
