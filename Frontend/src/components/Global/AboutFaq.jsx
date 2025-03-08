import React from "react";
import Header from "../Global/Header.jsx";
import Footer from "../Global/Footer.jsx";
import Util from "../../Util.js";

export const AboutUs = () => {
    return (
        <div>
            <Header/>
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4">About Us</h1>
                <p className="text-lg mb-4">
                    Welcome to MeatGo, your trusted source for high-quality meats. We are dedicated to
                    providing fresh, ethically sourced meat directly to your doorstep. Our commitment
                    to quality and customer satisfaction sets us apart in the industry.
                </p>
                <p className="text-lg mb-4">
                    Our team works closely with local farmers and butchers to ensure that every cut of meat
                    meets our high standards. From farm to table, we prioritize sustainability, freshness,
                    and excellence.
                </p>
            </div>
        </div>
    );
};

export const FAQ = () => {
    return (
        <div>
            <Header/>
            <div className="container mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">How can I place an order?</h2>
                    <p>Simply browse our products, add them to your cart, and proceed to checkout.</p>
                </div>
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">Do you offer delivery?</h2>
                    <p>Yes, we offer fast and reliable delivery to your location.</p>
                </div>
                <div className="mb-4">
                    <h2 className="text-xl font-semibold">Is your meat fresh?</h2>
                    <p>Absolutely! We source only the freshest meat from trusted suppliers.</p>
                </div>
            </div>
        </div>
    );
};
