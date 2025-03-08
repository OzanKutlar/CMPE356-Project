import React from 'react';
import Header from "../Global/Header.jsx";
import Util from "../../Util.js";

const AboutUs = () => {
    const teamMembers = [
        {
            name: "Ozan Kutlar",
            role: "Head of Backend & Team Leader",
            bio: "Leading our backend development and overall technical strategy to ensure MeatGo delivers the best online meat shopping experience.",
            image: "/src/assets/ozan.png"
        },
        {
            name: "Çağatay Batuker",
            role: "Head of Frontend",
            bio: "Creating beautiful and intuitive user interfaces that make browsing and purchasing premium meats a pleasure.",
            image: "/src/assets/face6.jpeg"
        },
        {
            name: "Abdul Hadi Khan",
            role: "Head of Testing",
            bio: "Ensuring every feature works flawlessly so you can order with confidence and receive exactly what you expect.",
            image: "/src/assets/face6.jpeg"
        },
        {
            name: "Zeynep Mutlu",
            role: "Head of Documentation",
            bio: "Crafting clear documentation for both our team and customers, making the MeatGo experience seamless from start to finish.",
            image: "/src/assets/face6.jpeg"
        }
    ];

    return (
        <div className="bg-white min-h-screen">
            <Header/>
            {/* Hero Section */}
            <div className={`${Util.footerColor} text-white`}>
                <div className="container mx-auto px-6 py-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">About MeatGo</h1>
                    <p className="text-xl max-w-3xl mx-auto">Premium quality meats delivered straight to your doorstep. The freshest cuts, handled with care by meat enthusiasts.</p>
                </div>
            </div>

            {/* Our Story Section */}
            <div className="container mx-auto px-6 py-12">
                <h2 className="text-3xl font-bold text-center mb-8">Our Story</h2>
                <div className="max-w-4xl mx-auto">
                    <p className="text-lg mb-6">
                        MeatGo was born from a simple idea: what if we made a website for a fake meat delivery service just to finish our homework? Our founders, passionate about meeting deadlines (and maybe food), set out to revolutionize how professors grade assignments.
                    </p>
                    <p className="text-lg mb-6">
                        We've built this platform with a focus on looking legit, sounding professional, and making sure we get full credit. Every word is carefully selected, expertly written, and delivered with the utmost care to ensure it looks like a real business.
                    </p>
                    <p className="text-lg mb-6">
                        Today, MeatGo serves exactly 0 customers (because it doesn’t actually exist). But if this were real, we’d totally be committed to quality and convenience. For now, we’re just hoping this gets us an A.
                    </p>
                </div>

            </div>

            {/* Team Section */}
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-64 object-cover"
                                />
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                                    <p className="text-red-700 font-medium mb-3">{member.role}</p>
                                    <p className="text-gray-600">{member.bio}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Open Source Section */}
            <div className="container mx-auto px-6 py-12 text-center">
                <h2 className="text-3xl font-bold mb-6">We're Open Source</h2>
                <p className="text-lg max-w-3xl mx-auto mb-8">
                    We believe in transparency and collaboration. That's why the entire MeatGo project is open source. Check out our code, contribute, or simply see how we built our platform.
                </p>
                <a
                    href="https://github.com/OzanKutlar/CMPE356-Project"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-rose-500 hover:bg-red-800 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-300"
                >
                    View on GitHub
                </a>
            </div>
        </div>
    );
};

export default AboutUs;