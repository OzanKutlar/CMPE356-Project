import React, {useState, useEffect} from 'react';
import Util from '../../Util.js';
import '../Global/PopUps/LoginPopup.css'

const LoginOrPhone = ({setShowPopUp}) => {
    const [phoneNo, setPhoneNo] = useState('');
    const [showPasswordField, setShowPasswordField] = useState(false);
    const [showConfirmPasswordField, setShowConfirmPasswordField] = useState(true);
    const [fadeIn, setFadeIn] = useState(false);
    const [buttonText, setButtonText] = useState('Login');
    const [buttonDest, setButtonDest] = useState('home');
    const [buttonColor, setButtonColor] = useState('#007bff');
    const [isHovered, setIsHovered] = useState(false);
    const [isHoveredPhone, setIsHoveredPhone] = useState(false);


    useEffect(() => {
        const timeout = setTimeout(() => setFadeIn(true), 50);
        return () => {
            clearTimeout(timeout);
            setFadeIn(false);
        };
    }, []);

    let lastformat = '';

    function formatPhoneNumber(phone) {
        if (phone === lastformat) {
            return phone;
        }
        let offset = Number(phone.length >= 13);

        if (phone.length >= 2 && !showPasswordField) {
            setShowPasswordField(true)
        }

        const pattern = [
            {index: 0, prefix: "+"},
            {index: 2 + offset, prefix: " ("},
            {index: 5 + offset, prefix: ") "},
            {index: 8 + offset, prefix: " "},
            {index: 10 + offset, prefix: " "}
        ];

        let formatted = "";
        for (let i = 0; i < phone.length; i++) {
            let formatRule = pattern.find(p => p.index === i);
            if (formatRule) formatted += formatRule.prefix;

            formatted += phone[i];
        }
        let formatRule = pattern.find(p => p.index === phone.length);
        if (formatRule) formatted += formatRule.prefix;
        return formatted;
    }


    const handleLoginClick = async () => {
        setShowPopUp(false);
        if (Util.CallLogin != null) {
            Util.CallLogin(true);
        }
    };

    const handlePhoneClick = async () => {
        setShowPopUp(false);
        Util.tempPhoneNumber = phoneNo;
    };

    let lastVal = '';

    const handleChange = (e) => {
        const {name, value} = e.target;
        let phoneNum;
        if (lastVal.length > value.length) {
            phoneNum = formatPhoneNumber(value.replaceAll(/[^0-9]/g, ""));
        } else {
            if (value.replaceAll(/[^0-9]/g, "") === lastVal.replaceAll(/[^0-9]/g, "")) {
                phoneNum = formatPhoneNumber(value.replaceAll(/[^0-9]/g, "").slice(0, -1));
            } else {
                phoneNum = formatPhoneNumber(value.replaceAll(/[^0-9]/g, ""));
            }
        }
        setPhoneNo(phoneNum);
        lastVal = value;
    }

    const handleForgotPasswordClick = () => {
        Util.navigateTo('forgot');
    };

    return (
        <div className="login-popup-wrapper">
            {/* Background Overlay */}
            <div className="login-overlay" onClick={() => setShowPopUp(false)}></div>

            {/* Popup */}
            <div className={`login-popup ${fadeIn ? 'show' : ''}`}>
                <h2 className="text-2xl font-bold mb-4">Oops! We dont know who you are!</h2>
                <button
                    onClick={handleLoginClick}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{backgroundColor: isHovered ? '#0056b3' : buttonColor}}
                    className="w-full px-5 py-3 rounded text-white text-lg cursor-pointer transition-colors duration-300"
                >
                    Login/Register
                </button>
                <h2 className="text-xl font-light mb-4">or Provide a Phone Number</h2>
                <input
                    type="text"
                    placeholder='+90 (xxx) xxx xx xx'
                    value={phoneNo}
                    onChange={handleChange}
                    className="w-full p-3 mb-4 border rounded"
                />
                <div className={`password-field-container ${showPasswordField ? 'slide-down' : ''}`}>
                    <button
                        onClick={handlePhoneClick}
                        onMouseEnter={() => setIsHoveredPhone(true)}
                        onMouseLeave={() => setIsHoveredPhone(false)}
                        style={{backgroundColor: isHoveredPhone ? '#0056b3' : buttonColor}}
                        className="w-full px-5 py-3 rounded text-white text-lg cursor-pointer transition-colors duration-300"
                    >
                        Continue Without Logging in
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginOrPhone;
