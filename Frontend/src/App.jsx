/* eslint-disable */
import React, {useState, useEffect} from "react";
import Email from "./components/HomePage/EmailPopup/Email";
import Header from "./components/Global/Header.jsx";
import Slider from "./components/HomePage/SlideShow/Slider";
import ItemPicker from "./components/HomePage/ItemPicker/ItemPicker";
import Recipelist from "./components/RecipePage/Recipelist/Recipelist";
import Util from './Util';
import "./App.css";
import CartItemsLarge from "./components/CartPage/CartItemsLarge/CartItemsLarge.jsx";
import ButcherItemSelector from "./components/ButcherPage/ButcherItem.jsx";
import NavbarButcher from "./components/ButcherPage/NavbarButcher.jsx";
import ButcherItemPicker from "./components/ButcherPage/ButcherItemPicker.jsx"; // Import styles
import NavbarDelivery from "./components/DeliveryPage/NavbarDelivery.jsx";
import UserList from "./components/AdminPage/UserList.jsx";

export default function App() {
    const [currentPage, setCurrentPage] = useState(Util.currentPage);
    const [animationClass, setAnimationClass] = useState("opacity-100");

    useEffect(() => {
        // Register listener for page changes
        const removeListener = Util.addPageChangeListener((newPage) => {
            setAnimationClass("opacity-0");
            setTimeout(() => {
                setCurrentPage(newPage);
                setAnimationClass("opacity-100"); // Fade-in new page
                window.history.pushState({}, '', `/${newPage}`);
            }, 300);
        });

    const handlePopState = () => {
            const path = window.location.pathname.split('/')[1];
            Util.navigateTo(path || "home");
        };
        window.addEventListener("popstate", handlePopState);

        // Clean up listeners when component unmounts
        return () => {
            removeListener();
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    useEffect(() => {
        const path = window.location.pathname;
        const value = path.split('/')[1];
        if (value) {
            Util.navigateTo(value);
        }
    }, []);

    const renderPage = () => {
        switch (currentPage) {
            case "home":
                return (
                    <div>
                        <Header/>
                        <Slider/>
                        <ItemPicker/>
                        <button onClick={() => Util.navigateTo("admin")}>Go to Admin Panel</button>
                    </div>
                );
            case "admin":
                return (
                    <div>
                        <h1>Admin Page</h1>
                        <UserList />
                        <button onClick={() => Util.navigateTo("home")}>Back to Home</button>
                    </div>
                );
            case "butcher": // Butcher Main page
                return (
                    <div>
                        <h1>Butcher Page</h1>
                        <NavbarButcher/>
                        <ButcherItemPicker/>
                        <button onClick={() => Util.navigateTo("home")}>Back to Home</button>
                    </div>
                );
            case "butcher/add": // Butcher Add Page
                return (
                    <div>
                        <h1>Butcher Add Page</h1>
                        <NavbarButcher/>
                        <ButcherItemSelector/>
                        <button onClick={() => Util.navigateTo("home")}>Back to Home</button>
                    </div>
                );
            case "recipe":
                return (
                    <div>
                        <Recipelist/>
                        <button onClick={() => Util.navigateTo("home")}>Back to Home</button>
                    </div>
                );
            case "cart":
                return (
                    <div>
                        <CartItemsLarge/>
                        <button onClick={() => Util.navigateTo("home")}>Back to Home</button>
                    </div>
                );
            case "delivery":
                return (
                    <div>
                        <NavbarDelivery/>
                        <button onClick={() => Util.navigateTo("home")}>Back to Home</button>
                    </div>
                )

            default:
                return (
                    <div>
                        <h1>Page {currentPage} not found</h1>
                        <button onClick={() => Util.navigateTo("home")}>Back to Home</button>
                    </div>

                );
        }
    };

    return (
        <div className={`app-container transition-opacity duration-300 ${animationClass}`}>
            {renderPage()}
        </div>
    );
}