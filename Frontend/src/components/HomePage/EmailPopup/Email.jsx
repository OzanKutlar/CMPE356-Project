import {useState, useEffect} from "react";

export default function Email() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [closing, setClosing] = useState(false);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Open the popup after a delay
        setTimeout(() => {
            setIsOpen(true);
            setTimeout(() => setIsVisible(true), 10);
        }, 500);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            setClosing(true);
            setTimeout(() => setIsOpen(false), 500);
        }, 300);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email.trim()) {
            setSubmitted(true);
            setFadeOut(true); // Initiate fade out for the form
            setTimeout(() => setFadeOut(false), 500); // Reset fade out after transition
            setTimeout(handleClose, 2000); // Close after some delay
        }
    };

    // Disable page interaction if the email is not submitted
    if (!submitted) {
        document.body.style.overflow = "hidden"; // Prevent scrolling
    } else {
        document.body.style.overflow = "auto"; // Re-enable scrolling
    }

    return (
        isOpen && (
            <div
                className={`popup-box fixed top-0 left-0 right-0 bottom-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50`}
            >
                <div
                    className={`popup-content bg-white w-[500px] p-[30px] rounded-[12px] text-center shadow-lg transition-all duration-500 ease-in-out ${
                        isVisible ? "translate-y-[-120px] opacity-100" : "translate-y-[100px] opacity-0"
                    }`}
                >
                    <button
                        className="close-btn absolute top-[-10px] right-[-10px] w-[30px] h-[30px] bg-[#ff4d4d] text-white rounded-full cursor-pointer flex justify-center items-center shadow-lg transition-colors duration-300 ease-in-out hover:bg-[#cc0000]"
                        onClick={handleClose}
                    >
                        ✖
                    </button>
                    {!submitted ? (
                        <>
                            <h2 className="text-xl font-semibold mb-4">Subscribe to our Newsletter</h2>
                            <p className="text-sm text-[#555] mb-4">Subscribe to our newsletter for exclusive discounts
                                & more</p>
                            <form onSubmit={handleSubmit}>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-[100%] p-[12px] mt-[10px] border border-[#ccc] rounded-[5px] block"
                                />
                                <button
                                    type="submit"
                                    className="w-[100%] mt-[15px] bg-[#007bff] text-white p-[12px] rounded-[5px] cursor-pointer hover:bg-[#0056b3]"
                                >
                                    Subscribe
                                </button>
                            </form>
                        </>
                    ) : (
                        <div
                            className={`thank-you text-green-600 text-[24px] transition-opacity duration-500 ease-in-out ${
                                fadeOut ? "opacity-0" : "opacity-100"
                            }`}
                        >
                            <h2>Thank You!</h2>
                        </div>
                    )}
                </div>
            </div>
        )
    );
}

