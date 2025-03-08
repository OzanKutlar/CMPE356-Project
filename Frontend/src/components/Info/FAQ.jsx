import React, { useState } from 'react';
import Header from "../Global/Header.jsx";

const FAQPage = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "How can I place an order?",
            answer: "Simply browse our products, add them to your cart, and proceed to checkout."
        },
        {
            question: "Do you offer delivery?",
            answer: "Yes, we offer fast and reliable delivery to your location."
        },
        {
            question: "Is your meat fresh?",
            answer: "Absolutely! We source only the freshest meat from trusted suppliers."
        },
        {
            question: "What are your delivery hours?",
            answer: "We deliver 7 days a week from 8 AM to 8 PM. You can select your preferred delivery time during checkout."
        },
        {
            question: "How is the meat packaged?",
            answer: "All our meat products are vacuum-sealed and delivered in temperature-controlled packaging to ensure freshness and safety."
        },
        {
            question: "Do you offer any subscription plans?",
            answer: "Yes! We offer weekly and monthly subscription boxes at discounted rates. Check out our 'Subscriptions' page for more details."
        },
        {
            question: "What if I'm not home during delivery?",
            answer: "Our delivery personnel will call you before arrival. If you're not home, we can leave your package with a neighbor or in a safe place of your choosing."
        },
        {
            question: "Can I modify or cancel my order?",
            answer: "Orders can be modified or canceled up to 24 hours before the scheduled delivery time. Please contact our customer service for assistance."
        },
        {
            question: "What payment methods do you accept?",
            answer: "We accept all major credit cards for a seamless checkout experience."
        }
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900">Frequently Asked Questions</h1>
                    <p className="mt-4 text-xl text-gray-600">
                        Everything you need to know about MeatGo's premium meat delivery service
                    </p>
                </div>

                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-gray-200 last:border-b-0">
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="flex justify-between items-center w-full px-6 py-4 text-left"
                            >
                                <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                                <svg
                                    className={`w-5 h-5 text-gray-500 transform ${
                                        openIndex === index ? 'rotate-180' : 'rotate-0'
                                    } transition-transform duration-200`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>
                            <div
                                className={`transition-all duration-200 ease-in-out ${
                                    openIndex === index
                                        ? 'max-h-40 opacity-100 px-6 pb-4'
                                        : 'max-h-0 opacity-0 overflow-hidden'
                                }`}
                            >
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-600">
                        Still have questions? We're here to help!
                    </p>
                    <button className="mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition duration-200">
                        Contact Support
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;