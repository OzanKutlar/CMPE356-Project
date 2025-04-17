import {useState} from "react";
import {User, CreditCard, MapPin, Phone, Camera, Save, Mail, Briefcase, Calendar} from "lucide-react";
import Util from "../../Util.js";

export default function EditProfile() {
    // Split state into separate variables
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");

    // Credit card details as separate states
    const [cardNumber, setCardNumber] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvv, setCardCvv] = useState("");
    const [cardName, setCardName] = useState("");

    // Profile image and submission state
    const [profileImage, setProfileImage] = useState(Util.savedUser.profilePictureLink);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [completionRate, setCompletionRate] = useState(40);
    const [memberSince, setMemberSince] = useState("Jan 2020");

    // Separate handler functions for each input
    const handleNameChange = (e) => setName(e.target.value);
    const handleEmailChange = (e) => setEmail(e.target.value);
    const handleBirthdateChange = (e) => setBirthdate(e.target.value);
    const handleAddressChange = (e) => setAddress(e.target.value);
    const handlePhoneChange = (e) => {
        const {name, value} = e.target;
        let phoneNum;
        if (value.length > 20) return;
        if (lastVal.length > value.length) {
            phoneNum = formatPhoneNumber(value.replaceAll(/[^0-9]/g, ""));
        } else {
            if (value.replaceAll(/[^0-9]/g, "") === lastVal.replaceAll(/[^0-9]/g, "")) {
                phoneNum = formatPhoneNumber(value.replaceAll(/[^0-9]/g, "").slice(0, -1));
            } else {
                phoneNum = formatPhoneNumber(value.replaceAll(/[^0-9]/g, ""));
            }
        }
        setPhone(phoneNum);
        lastVal = value;
    }

    let lastVal = '';
    let lastformat = '';

    function formatPhoneNumber(phone) {
        if (phone === lastformat) {
            return phone;
        }
        let offset = Number(phone.length >= 13);


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

    const handleCardNumberChange = (e) => {
        const {name, value} = e.target;

        const formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');

        if (value.length > 19) return;

        setCardNumber(formattedValue);
    }
    const handleCardExpiryChange = (e) => {
        const {name, value} = e.target;
        let formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/');
        if (value.length > 5) return;
        if (value.length === 2 || value.length === 5) {
            const [monthStr, yearStr] = value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/g, '$1/').split('/');
            const month = Number(monthStr);
            const formattedMonth = month ? Math.min(month, 12).toString().padStart(2, '0') : '01';

            if (value.length === 5) {
                const year = Number(yearStr);
                const currentYear = new Date().getFullYear() % 100;

                const formattedYear = year ? Math.max(year, currentYear).toString().slice(-2) : (currentYear + 1).toString().slice(-2);
                formattedValue = `${formattedMonth}/${formattedYear}`;
            } else {
                formattedValue = `${formattedMonth}`;
            }
        }
        setCardExpiry(formattedValue);
    }
    const handleCardCvvChange = (e) => {
        if (e.target.value.length > 3) return;
        setCardCvv(e.target.value.replace(/\D/g, ''));
    }
    const handleCardNameChange = (e) => setCardName(e.target.value);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                setProfileImage(URL.createObjectURL(file));

                const base64Data = reader.result.split(',')[1];

                const fileType = file.name.split('.').pop();

                const userID = Util.savedUser.id

                // Make the upload request
                fetch(Util.backendIp + '/image/upload', {
                    method: 'POST', // Changed to POST to send data in body
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userID: userID,
                        pictureData: base64Data,
                        fileName: fileType
                    })
                }).then(response => response.json()).then(data => {
                    if (data.msg === "success") {
                        setProfileImage(Util.getImageFromBackend(data.url));

                        console.log("Image uploaded successfully:", data.url);
                    } else {
                        console.error(data.message);
                    }
                })
                    .catch(error => {
                        console.error("Error uploading image:", error);
                    });
            };

            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Collect all the form data
        const formData = {
            name,
            email,
            birthdate,
            address,
            phone,
            creditCard: {
                number: cardNumber,
                expiry: cardExpiry,
                cvv: cardCvv,
                name: cardName
            }
        };

        try {
            const response = await Util.callBackend("user/editUser", {
                userID: Util.savedUser.id,
                name: name,
                email: email,
                photourl: profileImage,
                dob: birthdate,
                adress: address,
                phone: phone.replaceAll(/[^0-9+]/g, ""),
                ccnumber: cardNumber,
                ccexpiry: cardExpiry,
                cccvv: cardCvv,
                ccname: cardName
            });
            Util.savedUser.phone = phone;
            Util.savedUser.profilePictureLink = profileImage;
            Util.savedUser.address = address;
            Util.savedUser.email = email;
            console.log("Submitting data:", formData);
            setIsSubmitting(false);
            Util.CallGeneric("Your profile has been updated successfully!");
        } catch (error) {
            console.error("Error submitting data:", error);
            setIsSubmitting(false);
            Util.CallGeneric("Failed to update profile. Please try again.", "Error");
        }
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
                                        <div
                                            className="h-40 w-40 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                            {profileImage ? (
                                                <img src={profileImage} alt="Profile preview"
                                                     className="h-full w-full object-cover"/>
                                            ) : (
                                                <img src="/src/assets/ozan.png" alt="Profile placeholder"
                                                     className="h-full w-full object-cover"/>
                                            )}
                                        </div>
                                        <label htmlFor="profile-image"
                                               className="absolute bottom-2 right-2 bg-rose-500 rounded-full p-2 cursor-pointer hover:bg-rose-600 transition-colors">
                                            <Camera size={20} className="text-white"/>
                                            <input
                                                type="file"
                                                id="profile-image"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
                                    <p className="text-sm text-gray-500 mb-4">{email}</p>

                                    <div className="text-sm text-gray-500 mt-2 w-full">
                                        <p className="mb-1">Member since: {memberSince}</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                            <div className="bg-rose-600 h-2.5 rounded-full"
                                                 style={{width: `${completionRate}%`}}></div>
                                        </div>
                                        <p className="mt-1 text-xs">Profile Completion: {completionRate}%</p>
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
                                        <label htmlFor="name"
                                               className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <User size={16} className="mr-2"/>
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            placeholder='John Doe'
                                            id="name"
                                            value={name}
                                            onChange={handleNameChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email"
                                               className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <Mail size={16} className="mr-2"/>
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            placeholder='exam.ple@example.com'
                                            id="email"
                                            value={email}
                                            onChange={handleEmailChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                                        />
                                    </div>


                                    <div>
                                        <label htmlFor="birthdate"
                                               className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <Calendar size={16} className="mr-2"/>
                                            Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            id="birthdate"
                                            placeholder='28-02-2004'
                                            value={birthdate}
                                            onChange={handleBirthdateChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone"
                                               className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <Phone size={16} className="mr-2"/>
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            placeholder='+90 (xxx) xxx xx xx'
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label htmlFor="address"
                                               className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                            <MapPin size={16} className="mr-2"/>
                                            Delivery Address
                                        </label>
                                        <textarea
                                            id="address"
                                            placeholder='123 Main Street, New York, NY 10001'
                                            rows={2}
                                            value={address}
                                            onChange={handleAddressChange}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
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
                                                    <label htmlFor="cardName"
                                                           className="block text-sm font-medium text-gray-700 mb-1">
                                                        Name on Card
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder='John Doe'
                                                        id="cardName"
                                                        value={cardName}
                                                        onChange={handleCardNameChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                                                    />
                                                </div>

                                                <div className="col-span-2 sm:col-span-1">
                                                    <label htmlFor="cardNumber"
                                                           className="flex items-center text-sm font-medium text-gray-700 mb-1">
                                                        <CreditCard size={16} className="mr-2"/>
                                                        Card Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        placeholder='4242 4242 4242 4242'
                                                        id="cardNumber"
                                                        value={cardNumber}
                                                        onChange={handleCardNumberChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="cardExpiry"
                                                           className="block text-sm font-medium text-gray-700 mb-1">
                                                        Expiry Date
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="cardExpiry"
                                                        placeholder="MM/YY"
                                                        value={cardExpiry}
                                                        onChange={handleCardExpiryChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="cardCvv"
                                                           className="block text-sm font-medium text-gray-700 mb-1">
                                                        Security Code (CVV)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="cardCvv"
                                                        placeholder="CVV"
                                                        value={cardCvv}
                                                        onChange={handleCardCvvChange}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 sm:text-sm"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4 flex items-center text-sm text-gray-500">
                                                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400"
                                                     xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                                                     fill="currentColor">
                                                    <path fillRule="evenodd"
                                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                          clipRule="evenodd"/>
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
                                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 mr-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="inline-flex justify-center items-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500"
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                                                     fill="none" viewBox="0 0 24 24">
                                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                          strokeWidth="4"></circle>
                                                  <path className="opacity-75" fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving Changes...
                                              </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <Save size={16} className="mr-2"/>
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