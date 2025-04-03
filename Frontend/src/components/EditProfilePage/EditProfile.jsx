import { useState } from "react";
import { User, CreditCard, MapPin, Phone, Camera, Save, Mail, Briefcase, Calendar } from "lucide-react";

export default function EditProfile() {
    const [profileData, setProfileData] = useState({
        name: "John Doe",
        email: "john.doe@example.com",
        occupation: "Software Engineer",
        birthdate: "1990-01-15",
        address: "123 Main Street, New York, NY 10001",
        phone: "(555) 123-4567",
        creditCard: {
            number: "**** **** **** 4321",
            expiry: "12/25",
            cvv: "***",
            name: "John Doe"
        }
    });

    const [profileImage, setProfileImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setProfileData({
                ...profileData,
                [parent]: {
                    ...profileData[parent],
                    [child]: value
                }
            });
        } else {
            setProfileData({
                ...profileData,
                [name]: value
            });
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfileImage(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            alert("Profile updated successfully!");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your profile information and preferences</p>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-12 gap-6">
                            {/* Sidebar with profile picture */}
                            <div className="col-span-3 bg-gray-50 p-6 border-r border-gray-200">
                                <div className="flex flex-col items-center">
                                    <div className="relative mb-4">
                                        <div className="h-40 w-40 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {profileImage ? (
                                                <img src={profileImage} alt="Profile preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <img src="/api/placeholder/160/160" alt="Profile placeholder" className="h-full w-full object-cover" />
                                            )}
                                        </div>
                                        <label htmlFor="profile-image" className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
                                            <Camera size={20} className="text-white" />
                                            <input
                                                type="file"
                                                id="profile-image"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900">{profileData.name}</h2>
                                    <p className="text-sm text-gray-500 mb-4">{profileData.email}</p>

                                    <div className="text-sm text-gray-500 mt-2 w-full">
                                        <p className="mb-1">Member since: Jan 2023</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                            <div className="bg-blue-600 h-2.5 rounded-full w-3/4"></div>
                                        </div>
                                        <p className="mt-1 text-xs">Profile Completion: 75%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Main content */}
                            <div className="col-span-9 p-8">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                    {/* Basic Info Section */}
                                    <div className="col-span-2">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                            Basic Information
                                        </h2>
                                    </div>

                                    <div>
                                        <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <User size={16} className="mr-2" />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={profileData.name}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <Mail size={16} className="mr-2" />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={profileData.email}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="occupation" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <Briefcase size={16} className="mr-2" />
                                            Occupation
                                        </label>
                                        <input
                                            type="text"
                                            name="occupation"
                                            id="occupation"
                                            value={profileData.occupation}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="birthdate" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <Calendar size={16} className="mr-2" />
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            name="birthdate"
                                            id="birthdate"
                                            value={profileData.birthdate}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <Phone size={16} className="mr-2" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            id="phone"
                                            value={profileData.phone}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="address" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <MapPin size={16} className="mr-2" />
                                            Delivery Address
                                        </label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            rows={2}
                                            value={profileData.address}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>

                                    {/* Payment Info Section */}
                                    <div className="col-span-2 mt-6">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                            Payment Information
                                        </h2>
                                    </div>

                                    <div className="col-span-2">
                                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    <label htmlFor="creditCard.name" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Name on Card
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="creditCard.name"
                                                        id="creditCard.name"
                                                        value={profileData.creditCard.name}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    />
                                                </div>

                                                <div className="col-span-2 sm:col-span-1">
                                                    <label htmlFor="creditCard.number" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                                        <CreditCard size={16} className="mr-2" />
                                                        Card Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="creditCard.number"
                                                        id="creditCard.number"
                                                        value={profileData.creditCard.number}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="creditCard.expiry" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Expiry Date
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="creditCard.expiry"
                                                        id="creditCard.expiry"
                                                        placeholder="MM/YY"
                                                        value={profileData.creditCard.expiry}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="creditCard.cvv" className="block text-sm font-medium text-gray-700 mb-1">
                                                        Security Code (CVV)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="creditCard.cvv"
                                                        id="creditCard.cvv"
                                                        placeholder="CVV"
                                                        value={profileData.creditCard.cvv}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Your payment information is securely stored
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex justify-end pt-8 mt-8 border-t border-gray-200">
                                    <button
                                        type="button"
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex justify-center items-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving Changes...
                      </span>
                                        ) : (
                                            <span className="flex items-center">
                        <Save size={16} className="mr-2" />
                        Save Changes
                      </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}