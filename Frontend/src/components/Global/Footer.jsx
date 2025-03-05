import React from "react";

const Footer = () => {
  return (
    <footer className="bg-rose-500 text-white py-6 mt-8">
      <div className="container mx-auto text-center">
        <div className="flex justify-center space-x-6 mb-4">
          {/* Social Media Links */}
          <a
            href="https://twitter.com/yourhandle"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl transition-all duration-300 hover:text-gray-300"
          >
            Twitter
          </a>
          <a
            href="https://www.instagram.com/yourhandle"
            target="_blank"
            rel="noopener noreferrer"
            className="text-2xl transition-all duration-300 hover:text-gray-300"
          >
            Instagram
          </a>
        </div>

        {/* Contact Info */}
        <div className="mb-4">
          <p className="text-lg">Contact us: +123 456 7890</p>
          <p className="text-lg">Email: support@ebutcher.com</p>
        </div>

        {/* Quality & Copyright Message */}
        <div className="text-sm text-gray-200">
          <p>We provide the highest quality meat sourced from trusted suppliers.</p>
          <p>&copy; {new Date().getFullYear()} E-Butcher. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
