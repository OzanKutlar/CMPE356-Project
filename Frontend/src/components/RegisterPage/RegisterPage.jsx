import { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, EyeIcon, EyeOffIcon } from '../Global/Icons';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phoneNumber: '',
    countryCode: '+90',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const countryCodes = [
    { code: '+1', country: 'USA/Canada' },
    { code: '+44', country: 'UK' },
    { code: '+90', country: 'Turkey' },
    { code: '+49', country: 'Germany' },
    { code: '+33', country: 'France' },
    { code: '+81', country: 'Japan' },
    { code: '+86', country: 'China' },
    { code: '+91', country: 'India' },
    { code: '+55', country: 'Brazil' },
    { code: '+61', country: 'Australia' }
  ];
  
  const images = [
    '/api/placeholder/800/600',
    '/api/placeholder/800/600',
    '/api/placeholder/800/600'
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone number to only accept numbers
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
  
  const validatePassword = (password) => {
    if (password.length < 8 || password.length > 30) return false;
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    return hasUpperCase && hasLowerCase && hasNumber;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    if (!formData.firstName) newErrors.firstName = 'Required';
    if (!formData.lastName) newErrors.lastName = 'Required';
    if (!formData.username) newErrors.username = 'Required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Required';
    
    if (!formData.email) {
      newErrors.email = 'Required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Must be 8-30 chars with uppercase, lowercase & number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.password = 'Passwords do not match';
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      console.log('Form submitted successfully:', formData);
    }
  };
  
  const changeImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };
  
  useEffect(() => {
    const timer = setInterval(changeImage, 5000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-2/3 relative overflow-hidden bg-gray-900 hidden md:block">
        <div className="h-full w-full flex items-center justify-center">
          <img 
            src={images[currentImageIndex]} 
            alt="Registration background" 
            className="h-full w-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl font-bold mb-2">Join Our Community</h1>
            <p className="text-lg max-w-lg text-center">Discover new experiences and connect with people around the world.</p>
          </div>
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
      </div>
      
      <div className="w-full md:w-1/3 p-4 flex items-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-1">Create an Account</h2>
            <p className="text-gray-600 text-sm">Fill in your details to get started</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="block text-xs font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="ex: John"
                  className={`w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                />
                {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-xs font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="ex: Brown"
                  className={`w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 ${errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                />
                {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="ex: john.brown@example.com"
                className={`w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="username" className="block text-xs font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="ex: johnb123"
                  className={`w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 ${errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                />
                {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-xs font-medium text-gray-700">Phone Number</label>
                <div className="flex">
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center justify-between w-14 p-1.5 text-sm font-medium border border-gray-300 rounded-l-md bg-gray-50"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <span className="text-left">{formData.countryCode}</span>
                      <ChevronDownIcon />
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
                                countryCode: country.code
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
                    className={`w-full p-1.5 text-sm border border-l-0 rounded-r-md focus:ring-1 focus:ring-blue-500 ${errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                  />
                </div>
                {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Your password"
                  className={`w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-2 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              <p className="text-xs text-gray-500">Password must be longer than 8, shorter than 30 characters.</p>
              <p className="text-xs text-gray-500">Password must contain one upper and lowercase character, and a number.</p>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={`w-full p-1.5 text-sm border rounded-md focus:ring-1 focus:ring-blue-500 ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-2 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-1.5 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1 transition-colors text-sm"
            >
              Register Now
            </button>
            
            <p className="text-center text-xs text-gray-600 mt-1">
              Already have an account? {' '}
              <a href="#" className="text-blue-600 hover:underline font-medium">
                Sign in
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;