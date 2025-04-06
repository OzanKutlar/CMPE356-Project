import {useState, useRef, useEffect} from 'react';
import {ChevronDownIcon, EyeIcon, EyeOffIcon} from '../Global/Icons';
import Util from "../../Util.js";
import Info from "../Global/PopUps/Info.jsx";
import Utils from "../../Util.js";

const RegistrationPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        countryCode: {code: '+90', country: 'Turkey'},
        email: ''
    });

    const [errors, setErrors] = useState({});
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [disableButton, setDisableButton] = useState(false);
    const [disableText, setDisableText] = useState(false);
    const dropdownRef = useRef(null);

    const countryCodes = [
        {code: '+1', country: 'USA/Canada'},
        {code: '+44', country: 'UK'},
        {code: '+90', country: 'Turkey'},
        {code: '+49', country: 'Germany'},
        {code: '+33', country: 'France'},
        {code: '+81', country: 'Japan'},
        {code: '+86', country: 'China'},
        {code: '+91', country: 'India'},
        {code: '+55', country: 'Brazil'},
        {code: '+61', country: 'Australia'}
    ];

    const images = [
        'https://assets.epicurious.com/photos/5c6dc12afd08082d5c726d24/1:1/w_3323,h_3323,c_limit/Cook-From-Frozen-Steak-With-Burst-Cherry-Tomato-Sauce-6x9-120219.jpg',
        'https://images.food52.com/B-VWJ_VnXPG37JNwUtERbdRe-RY=/1200x900/a10038b2-6674-43ef-8149-f8b21718c926--2018-0907_roys-3-ingredient-soy-steak-sauce-genius_3x2_ty-mecham_001.jpg',
        'https://thumbs.dreamstime.com/b/delicate-medallions-veal-vegetables-food-gourmet-luxury-lifestyle-expensive-restaurant-recipe-serving-concept-83494930.jpg'
    ];

    const captions = [
        "Fresh Raw Beef Steak",
        "Premium Cut Ribeye",
        "BBQ Feast"
    ];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextSlide = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleInputChange = (e) => {
        const {name, value} = e.target;

        if (name === 'phoneNumber') {
            const numericValue = value.replace(/\D/g, '');
            setFormData({
                ...formData,
                [name]: numericValue
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const [showPopup, setShowPopup] = useState(false);
    const [popUpText, setPopUpText] = useState('');
    const [popUpType, setPopUpType] = useState('');

    const handleDeleteAccountClick = async (e) => {
        if(disableText) return;
        setDisableText(true)
        try {
            const response = await Util.callBackend("delUser", {
                userID: Util.savedUser.id
            });
            if(response.msg === "success"){
                Util.delUser();
                setPopUpText("Your registration has been cancelled.")
                setPopUpType("Info")
                setShowPopup(true);
            }
            else{
                setPopUpText("Error : " + response.msg)
                setPopUpType("Error")
                setShowPopup(true);
            }
        } catch (err) {
            setPopUpText("Error : " + err.error)
            setPopUpType("Error")
            setShowPopup(true);
            console.error(err);
        }
        setDisableText(false)
        setTimeout(() => {
            Util.navigateTo("home");
        }, 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setDisableButton(true);
        const newErrors = {};

        if (!formData.firstName) newErrors.firstName = 'Required';
        if (!formData.lastName) newErrors.lastName = 'Required';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Required';

        if (!formData.email) {
            newErrors.email = 'Required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        } else {
            try {
                const response = await Util.callBackend("user/registerUserFull", {
                    userID: Util.savedUser.id,
                    name: formData.firstName,
                    surname: formData.lastName,
                    phone: formData.countryCode.code + " " + formData.phoneNumber,
                    email: formData.email,
                    country: formData.countryCode.country
                });
                if(response.msg === "success" && response.user){
                    Util.savedUser = response.user;
                    setPopUpText("Your account has been successfully registered.")
                    setPopUpType("Info")
                    setShowPopup(true);
                    setTimeout(() => {
                        Util.navigateTo("home");
                    }, 2000);
                }
                else{
                    setPopUpText("Error : " + response.msg)
                    setPopUpType("Error")
                    setShowPopup(true);
                }
            } catch (err) {
                setPopUpText("Error : " + err.error)
                setPopUpType("Error")
                setShowPopup(true);
                console.error(err);
            }

            console.log('Form submitted successfully:', formData);
        }
        setDisableButton(false);
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {showPopup && (
                <Info popUpText={popUpText} popUpType={popUpType} setShowPopup={setShowPopup} />
            )}
            <div className="w-2/3 relative overflow-hidden bg-gray-900 hidden md:block">
                <div className="h-full w-full flex items-center justify-center">
                    {images.map((img, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-500 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`}
                            style={{
                                backgroundImage: `url(${img})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}
                        >
                            {/* Black stripe centered vertically with height limitation */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div
                                    className="bg-[rgba(0,0,0,0.5)] h-[150px] w-full flex items-center justify-center text-white">
                                    <div className="text-center">
                                        <h1 className="text-4xl font-bold mb-2">You're almost there!</h1>
                                        <p className="text-lg max-w-lg mx-auto">Fill in your details to complete your registration</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-gray-400'}`}
                            onClick={() => setCurrentImageIndex(index)}
                        />
                    ))}
                </div>
                <button
                    className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    onClick={prevSlide}
                >
                    ❮
                </button>
                <button
                    className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                    onClick={nextSlide}
                >
                    ❯
                </button>
            </div>

            <div className="w-full md:w-1/3 p-4 flex items-center">
                <div className="max-w-md mx-auto w-full text-left">
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold mb-1">Customize Your Account</h2>
                        <p className="text-gray-600 text-sm">Fill in your details to complete your registration</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label htmlFor="firstName" className="block text-xs px-1 font-medium text-gray-700">First
                                    Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="ex: John"
                                    className={`w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-amber-500 ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                />
                                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-xs px-1 font-medium text-gray-700">Last
                                    Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="ex: Brown"
                                    className={`w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-amber-500 ${errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                />
                                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email"
                                   className="block text-xs px-1 font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="ex: john.brown@example.com"
                                className={`w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-amber-500 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            />
                            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-3">

                            <div>
                                <label htmlFor="phoneNumber" className="block text-xs px-1 font-medium text-gray-700">Phone
                                    Number</label>
                                <div className="flex">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            className="flex items-center justify-between w-14 p-1.5 text-sm font-medium border border-gray-300 rounded-l-md bg-gray-50"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                        >
                                            <span className="text-left">{formData.countryCode.code}</span>
                                            <ChevronDownIcon/>
                                        </button>

                                        {dropdownOpen && (
                                            <div
                                                ref={dropdownRef}
                                                className="absolute left-0 z-10 mt-1 w-32 bg-white shadow-lg max-h-48 rounded-md overflow-auto"
                                            >
                                                {countryCodes.map((country) => (
                                                    <div
                                                        key={country.code}
                                                        className="px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-sm text-left"
                                                        onClick={() => {
                                                            setFormData({
                                                                ...formData,
                                                                countryCode: country
                                                            });
                                                            setDropdownOpen(false);
                                                        }}
                                                    >
                                                        {country.code} {country.country}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <input
                                        type="tel"
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className={`w-full p-1.5 text-sm border border-l-0 rounded-r-md focus:ring-1 focus:ring-amber-500 ${errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    />
                                </div>
                                {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber}</p>}
                            </div>
                        </div>


                        <button
                            type="submit"
                            disabled={disableButton}
                            className={`w-full ${disableButton ? "bg-gray-600" : "bg-amber-600"} text-white py-1.5 px-4 rounded-md ${disableButton ? "hover:bg-gray-700" : "hover:bg-amber-700"}  focus:outline-none focus:ring-1 focus:ring-amber-500 focus:ring-offset-1 transition-colors text-sm`}
                        >
                            Register Now
                        </button>

                        <p className="text-center text-xs text-gray-600 mt-1">
                            Not feeling ready? {' '}
                            <a href="#" onClick={handleDeleteAccountClick} className={`${disableText ? "text-gray-600" : "text-amber-600"} hover:underline font-medium`}>
                                Go Back To Home
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;