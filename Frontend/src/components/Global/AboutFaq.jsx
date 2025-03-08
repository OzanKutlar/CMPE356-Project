import React from "react";
import Header from "../Global/Header.jsx";
import Footer from "../Global/Footer.jsx";

export const AboutUs = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-12">
                <h1 className="text-5xl font-bold mb-8 text-center">About Us</h1>
                <p className="text-xl leading-relaxed mb-8">
                    Welcome to MeatGo, your trusted source for high-quality meats. We are dedicated to
                    providing fresh, ethically sourced meat directly to your doorstep. Our commitment
                    to quality and customer satisfaction sets us apart in the industry.
                </p>
                <p className="text-xl leading-relaxed mb-8">
                    Our team works closely with local farmers and butchers to ensure that every cut of meat
                    meets our high standards. From farm to table, we prioritize sustainability, freshness,
                    and excellence.
                </p>
            </main>
            <Footer />
        </div>
    );
};

export const FAQ = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-12">
                <h1 className="text-5xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
                <div className="mb-8">
                    <h2 className="text-3xl font-semibold mb-4">How can I place an order?</h2>
                    <p className="text-lg leading-relaxed">Simply browse our products, add them to your cart, and proceed to checkout.</p>
                </div>
                <div className="mb-8">
                    <h2 className="text-3xl font-semibold mb-4">Do you offer delivery?</h2>
                    <p className="text-lg leading-relaxed">Yes, we offer fast and reliable delivery to your location.</p>
                </div>
                <div className="mb-8">
                    <h2 className="text-3xl font-semibold mb-4">Is your meat fresh?</h2>
                    <p className="text-lg leading-relaxed">Absolutely! We source only the freshest meat from trusted suppliers.</p>
                </div>
            </main>
            <Footer />
        </div>
    );
};