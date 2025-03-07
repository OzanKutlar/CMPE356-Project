/* eslint-disable */
import React, {useState, useEffect} from "react";
import Email from "./components/HomePage/EmailPopup/Email";
import Header from "./components/Global/Header.jsx";
import Slider from "./components/HomePage/SlideShow/Slider";
import ItemPicker from "./components/HomePage/ItemPicker/ItemPicker";
import Recipelist from "./components/RecipePage/RecipeList/RecipeList";
import Util from './Util';
import "./App.css";
import CartItemsLarge from "./components/CartPage/CartItemsLarge.jsx";
import ButcherItemSelector from "./components/ButcherPage/ButcherItem.jsx";
import ButcherItemPicker from "./components/ButcherPage/ButcherItemPicker.jsx"; // Import styles
import UserList from "./components/AdminPage/UserList.jsx";
import AdminHeader from "./components/AdminPage/AdminHeader.jsx";
import ButcherHeader from "./components/ButcherPage/Global/ButcherHeader.jsx";
import ButcherMostProfit from "./components/ButcherPage/Home/ButcherMostProfit.jsx";
import ButcherLatestSale from "./components/ButcherPage/Home/ButcherLatestSale.jsx";
import ButcherTransactions from "./components/ButcherPage/Transactions/ButcherTransactions.jsx";
import ButcherItems from "./components/ButcherPage/Items/ButcherItems.jsx";
import DeliveryPage from "./components/DeliveryPage/DeliveryPage.jsx";
import Footer from "./components/Global/Footer.jsx";
import { GlobalContext } from "./components/Global/GlobalContext.jsx";
import RegistrationPage from "./components/RegisterPage/RegisterPage.jsx";
import OrderList from "./components/HomePage/Orders/OrderList.jsx";
import ServerMonitor from "./components/AdminPage/ServerMonitor.jsx";

export default function App() {
    const [currentPage, setCurrentPage] = useState(Util.currentPage);
    const [animationClass, setAnimationClass] = useState("opacity-100");

    useEffect(() => {
        const handlePopState = () => {
            const path = window.location.pathname.substring(1);
            console.log(path);
            Util.navigateSilent(path || "home");
        };
        window.addEventListener("popstate", handlePopState);

        // Clean up listeners when component unmounts
        return () => {
            removeListener();
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    useEffect(() => {
        const value = window.location.pathname.substring(1);
        if (value) {
            Util.navigateTo(value);
        }
    }, []);

    const removeListener = Util.addPageChangeListener((newPage) => {
        setAnimationClass("opacity-0");
        setTimeout(() => {
            setCurrentPage(newPage);
            setAnimationClass("opacity-100"); // Fade-in new page
            window.history.pushState({}, '', `/${newPage}`);
        }, 300);
    });


    const renderPage = () => {
        switch (currentPage) {
            case "home":
                return (
                    <div>
                        <Header/>
                        <Slider/>
                        <ItemPicker/>
                    </div>
                );
            case "orders":
                return (
                    <div>
                        <Header/>
                        <OrderList/>
                    </div>
                );
            case "register":
                return (
                    <div>
                        <RegistrationPage />
                    </div>
                );
            case "admin/users":
            case "admin":
                return (
                    <div>
                        <AdminHeader/>
                        <UserList/>
                    </div>
                );
            case "admin/backend":
                return(
                    <div>
                        <AdminHeader/>
                        <ServerMonitor/>
                    </div>
                )
            case "butcher": // Butcher Main page
                return (
                    <div>
                        <ButcherHeader/>
                        <div style={{display: "flex", gap: "20px"}}>
                            <ButcherLatestSale/>
                            <ButcherMostProfit/>
                        </div>
                    </div>
                );
            case "butcher/add": // Butcher Add Page
                return (
                    <div>
                        <ButcherHeader/>
                        <ButcherItemSelector/>
                    </div>
                );
            case "butcher/transactions": // Butcher Add Page
                return (
                    <div>
                        <ButcherHeader/>
                        <ButcherTransactions/>
                    </div>
                );
            case "butcher/sales": // Butcher Add Page
                return (
                    <div>
                        <ButcherHeader/>
                        <ButcherItems/>
                    </div>
                );
            case "recipe":
                return (
                    <div>
                        <Header/>
                        <Recipelist/>
                    </div>
                );
            case "cart":
                return (
                    <div>
                        <Header/>
                        <CartItemsLarge/>
                    </div>
                );
            case "delivery":
                return (
                    <div>
                        <DeliveryPage/>
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
            <GlobalContext.Provider value={ currentPage }>
                {/*<Email />*/}
                {renderPage()}
                {currentPage != "delivery" && currentPage != "register" ? <Footer/> : null}
            </GlobalContext.Provider>
        </div>
    );
}
