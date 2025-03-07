import React from "react";
import Util from "../../Util.js";

const Footer = () => {
    return (
        <footer className={`${Util.footerColor} text-white py-6 mt-8`}>
            <div className="container mx-auto text-center">
                <div className="flex justify-center space-x-6 mb-4">
                    {/* Social Media Links */}
                    <a
                        href="https://twitter.com/yourhandle"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-all duration-300 hover:opacity-75"
                    >
                        <img src="/src/assets/twitter.png" alt="Twitter" className="w-8 h-8" />
                    </a>

                    <a
                        href="https://www.instagram.com/yourhandle"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-all duration-300 hover:opacity-75"
                    >
                        <img src="/src/assets/instagram.png" alt="Instagram" className="w-8 h-8" />
                    </a>

                </div>

                {/* Contact Info */}
                <div className="mb-4">
                    <p className="text-lg">Contact us: +123 456 7890</p>
                    <p className="text-lg">Email: support@meatgo.com</p>
                </div>

                {/* About Us and FAQ Links */}
                <div className="mb-4">
                    <button
                        className="text-lg transition-all duration-300 hover:text-blue-300 mr-6"
                        onClick={() => Util.navigateTo("about")}
                    >
                        About Us
                    </button>
                    <button
                        className="text-lg transition-all duration-300 hover:text-blue-300 mr-6"
                        onClick={() => Util.navigateTo("faq")}
                    >
                        FAQ
                    </button>
                </div>

                {/* Quality & Copyright Message */}
                <div className="text-sm text-gray-200">
                    <p>We provide the highest quality meat sourced from trusted suppliers.</p>
                    <p>&copy; {new Date().getFullYear()} MeatGo. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
