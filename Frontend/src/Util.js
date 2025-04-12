import wsService from './WebSocketService';
class Util {
    static backendIp = 'http://127.0.0.1:33000/api';
    static fakeIt = false;
    static fakeDataDelay = 1000; // Define the timeout delay
    static CallLogin = null;
    static CallVerification = null;
    static CallPasswordReset = null;
    static forgot = false;
    static tempPhoneNumber = '';
    static footerColor = "bg-rose-500";
    static fakeData = {
        'endpoint2': {data: 'Fake Data for Endpoint 2'},
        "items": [
            {
                ItemName: "Minced Meat",
                ItemPrice: 59.99,
                ItemPhotoLink: "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/kuzu-az-yagli-kiyma-1f-4f9.jpg"
            },
            {
                ItemName: "Cubed Meat",
                ItemPrice: 69.99,
                ItemPhotoLink: "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-kusbasi--478c-.jpg"
            },
            {
                ItemName: "Entrecôte",
                ItemPrice: 120,
                ItemPhotoLink: "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-antrikot--8f97-.jpg"
            },
            {
                ItemName: "Steak",
                ItemPrice: 99.99,
                ItemPhotoLink: "https://static.ticimax.cloud/cdn-cgi/image/width=-,quality=85/43437/uploads/urunresimleri/buyuk/dilimli-dana-bonfile-83e53-.jpg"
            },
            {
                ItemName: "Steak",
                ItemPrice: 99.99,
                ItemPhotoLink: "https://static.ticimax.cloud/cdn-cgi/image/width=-,quality=85/43437/uploads/urunresimleri/buyuk/dilimli-dana-bonfile-83e53-.jpg"
            },
            {
                ItemName: "Chopped Meat",
                ItemPrice: 66.99,
                ItemPhotoLink: "https://www.eskitadinda.com/cdn-cgi/imagedelivery/iyyOLTStLptbsvCoMH9lkA/188576e7-fcff-46bc-655a-650dadc2a600/700x500"
            }],
        "cart": [
            {
                "ItemCount": 2,
                "ItemName": "Minced Meat",
                "ItemPhotoLink": "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/kuzu-az-yagli-kiyma-1f-4f9.jpg",
                "ItemPrice": 59.99
            },
            {
                "ItemCount": 1,
                "ItemName": "Cubed Meat",
                "ItemPhotoLink": "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-kusbasi--478c-.jpg",
                "ItemPrice": 69.99
            },
            {
                "ItemCount": 3,
                "ItemName": "Entrecôte",
                "ItemPhotoLink": "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-antrikot--8f97-.jpg",
                "ItemPrice": 120
            },
            {
                "ItemCount": 1,
                "ItemName": "Steak",
                "ItemPhotoLink": "https://static.ticimax.cloud/cdn-cgi/image/width=-,quality=85/43437/uploads/urunresimleri/buyuk/dilimli-dana-bonfile-83e53-.jpg",
                "ItemPrice": 99.99
            }
        ],
        "submitOrder": "success",
        "cancelOrder": {msg: "Your order has been cancelled successfully."},
        "changeAddr": {msg: "Your address change has been accepted."},
        "contDriver": {msg: "Your driver will contact you shortly."},
        "getStock": [
            {
                ItemName: "Minced Meat",
                ItemPrice: 59.99,
                ItemPhotoLink: "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/kuzu-az-yagli-kiyma-1f-4f9.jpg",
                currentStock: 12,
                startStock: 30
            },
            {
                ItemName: "Cubed Meat",
                ItemPrice: 69.99,
                ItemPhotoLink: "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-kusbasi--478c-.jpg",
                currentStock: 10,
                startStock: 24
            },
            {
                ItemName: "Entrecôte",
                ItemPrice: 120,
                ItemPhotoLink: "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-antrikot--8f97-.jpg",
                currentStock: 0,
                startStock: 60
            },
            {
                ItemName: "Steak",
                ItemPrice: 99.99,
                ItemPhotoLink: "https://static.ticimax.cloud/cdn-cgi/image/width=-,quality=85/43437/uploads/urunresimleri/buyuk/dilimli-dana-bonfile-83e53-.jpg",
                currentStock: 30,
                startStock: 30
            },
            {
                ItemName: "Chopped Meat",
                ItemPrice: 66.99,
                ItemPhotoLink: "https://www.eskitadinda.com/cdn-cgi/imagedelivery/iyyOLTStLptbsvCoMH9lkA/188576e7-fcff-46bc-655a-650dadc2a600/700x500",
                currentStock: 25,
                startStock: 50
            }],
        "addToCart": "success",
        "updateStock": "success",
        "shutdown": {msg: "success"},
        "restart": {msg: "success"},
        "delUser": {msg: "success"},
        "saveCart": "success",
        "saveButcher": "success",
        "getMostProfits": [ // Returns the top 5 profiting items
            {
                itemPhotoLink: "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/kuzu-az-yagli-kiyma-1f-4f9.jpg",
                itemName: "Minced Meat",
                totalProfit: 1199.80,
                totalSales: 20
            },
            {
                itemPhotoLink: "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-kusbasi--478c-.jpg",
                itemName: "Cubed Meat",
                totalProfit: 1399.80,
                totalSales: 20
            },
            {
                itemPhotoLink: "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-antrikot--8f97-.jpg",
                itemName: "Entrecôte",
                totalProfit: 7200.00,
                totalSales: 60
            },
            {
                itemPhotoLink: "https://static.ticimax.cloud/cdn-cgi/image/width=-,quality=85/43437/uploads/urunresimleri/buyuk/dilimli-dana-bonfile-83e53-.jpg",
                itemName: "Steak",
                totalProfit: 2999.70,
                totalSales: 30
            },
            {
                itemPhotoLink: "https://www.eskitadinda.com/cdn-cgi/imagedelivery/iyyOLTStLptbsvCoMH9lkA/188576e7-fcff-46bc-655a-650dadc2a600/700x500",
                itemName: "Chopped Meat",
                totalProfit: 3349.50,
                totalSales: 50
            }
        ],
        "getTransactions": [ // Returns the last 5 sales
            {
                "id": "tx-1",
                "userID": "user-123",
                "address": "123 Sample St, New York, NY, 10001",
                "itemName": "Minced Meat",
                "itemPhoto": "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/kuzu-az-yagli-kiyma-1f-4f9.jpg",
                "paymentMethod": "Paid with card at door",
                "paymentID": "#416645453773",
                "status": "Success",
                "totalPrice": 119.98
            },
            {
                "id": "tx-2",
                "userID": "user-124",
                "address": "456 Example Rd, San Francisco, CA, 94121",
                "itemName": "Cubed Meat",
                "itemPhoto": "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-kusbasi--478c-.jpg",
                "paymentMethod": "Paid Online",
                "paymentID": "#147784455454",
                "status": "Canceled",
                "totalPrice": 69.99
            },
            {
                "id": "tx-3",
                "userID": "user-125",
                "address": "789 Demo Ave, Chicago, IL, 60616",
                "itemName": "Entrecôte",
                "itemPhoto": "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-antrikot--8f97-.jpg",
                "paymentMethod": "Cash",
                "paymentID": "#147784455454",
                "status": "Pending",
                "totalPrice": 360.00
            },
            {
                "id": "tx-4",
                "userID": "user-123",
                "address": "123 Sample St, New York, NY, 10001",
                "itemName": "Steak",
                "itemPhoto": "https://static.ticimax.cloud/cdn-cgi/image/width=-,quality=85/43437/uploads/urunresimleri/buyuk/dilimli-dana-bonfile-83e53-.jpg",
                "paymentMethod": "Cash",
                "paymentID": "#147784455454",
                "status": "Success",
                "totalPrice": 99.99
            },
            {
                "id": "tx-5",
                "userID": "user-126",
                "address": "12 Market Rd, Austin, TX, 78703",
                "itemName": "Chopped Meat",
                "itemPhoto": "https://www.eskitadinda.com/cdn-cgi/imagedelivery/iyyOLTStLptbsvCoMH9lkA/188576e7-fcff-46bc-655a-650dadc2a600/700x500",
                "paymentMethod": "Paid with card at door",
                "paymentID": "#147784455454",
                "status": "Success",
                "totalPrice": 66.99
            }
        ],
        "getOrders": [ // Returns the last 5 sales
            {
                "id": "tx-1",
                "userID": "user-123",
                "address": "123 Sample St, New York, NY, 10001",
                "itemName": "Minced Meat",
                "itemPhoto": "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/kuzu-az-yagli-kiyma-1f-4f9.jpg",
                "paymentMethod": "Paid at door",
                "paymentID": "#416645453773",
                "status": "Success",
                "totalPrice": 119.98
            },
            {
                "id": "tx-2",
                "userID": "user-124",
                "address": "456 Example Rd, San Francisco, CA, 94121",
                "itemName": "Cubed Meat",
                "itemPhoto": "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-kusbasi--478c-.jpg",
                "paymentMethod": "Paid Online",
                "paymentID": "#147784455454",
                "status": "Canceled",
                "totalPrice": 69.99
            },
            {
                "id": "tx-3",
                "userID": "user-125",
                "address": "789 Demo Ave, Chicago, IL, 60616",
                "itemName": "Entrecôte",
                "itemPhoto": "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-antrikot--8f97-.jpg",
                "paymentMethod": "Cash",
                "paymentID": "#147784455454",
                "status": "Pending",
                "totalPrice": 360.00
            },
            {
                "id": "tx-4",
                "userID": "user-123",
                "address": "123 Sample St, New York, NY, 10001",
                "itemName": "Steak",
                "itemPhoto": "https://static.ticimax.cloud/cdn-cgi/image/width=-,quality=85/43437/uploads/urunresimleri/buyuk/dilimli-dana-bonfile-83e53-.jpg",
                "paymentMethod": "Cash",
                "paymentID": "#147784455454",
                "status": "Success",
                "totalPrice": 99.99
            },
            {
                "id": "tx-5",
                "userID": "user-126",
                "address": "12 Market Rd, Austin, TX, 78703",
                "itemName": "Chopped Meat",
                "itemPhoto": "https://www.eskitadinda.com/cdn-cgi/imagedelivery/iyyOLTStLptbsvCoMH9lkA/188576e7-fcff-46bc-655a-650dadc2a600/700x500",
                "paymentMethod": "Paid with card at door",
                "paymentID": "#147784455454",
                "status": "Success",
                "totalPrice": 66.99
            }
        ],
        "getRecipes": [
            {
                "name": "Grilled Steak with Garlic Butter",
                "photo": "https://static.ticimax.cloud/cdn-cgi/image/width=-,quality=85/43437/uploads/urunresimleri/buyuk/dilimli-dana-bonfile-83e53-.jpg",
                "data": "Season the steak with salt and pepper. Grill on high heat for 3-4 minutes per side. Melt butter with minced garlic and pour over the steak before serving."
            },
            {
                "name": "Beef Entrecôte with Herb Sauce",
                "photo": "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-antrikot--8f97-.jpg",
                "data": "Season entrecôte with salt and sear on high heat for 3 minutes per side. Make a sauce with olive oil, parsley, garlic, and lemon juice. Drizzle over the meat."
            },
            {
                "name": "Minced Meat Tacos",
                "photo": "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/kuzu-az-yagli-kiyma-1f-4f9.jpg",
                "data": "Cook minced meat with taco seasoning. Serve in taco shells with chopped lettuce, tomatoes, shredded cheese, and sour cream."
            },
            {
                "name": "Cubed Meat Stew",
                "photo": "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-kusbasi--478c-.jpg",
                "data": "Brown the cubed meat in a pot. Add onions, carrots, potatoes, and beef stock. Simmer for 2 hours until tender."
            },
            {
                "name": "Chopped Meat Stir-Fry",
                "photo": "https://www.eskitadinda.com/cdn-cgi/imagedelivery/iyyOLTStLptbsvCoMH9lkA/188576e7-fcff-46bc-655a-650dadc2a600/700x500",
                "data": "Heat oil in a pan. Add chopped meat, bell peppers, onions, and soy sauce. Stir-fry on high heat until cooked through. Serve with rice."
            }
        ],
    };

    // Navigation system
    static currentPage = 'home';
    static pageChangeListeners = [];
    static cartUpdateListeners = [];
    static savedUser = {
        id: '',
        username: '',
        profilePictureLink: '',
        role: '',
        email: '',
        phone: '',
        address: ''
    };

    static delUser() {
        this.savedUser = {
            id: '',
            username: '',
            profilePictureLink: '',
            role: '',
            email: '',
            phone: '',
            address: ''
        };
    }

    static fakeLogin(username) {
        const user = Util.fakeData["getUsers"].find(user => user.Username === username);
        if (user) {
            return user;
        } else {
            console.error("User not found");
            return null; // or throw an error, depending on your use case
        }
    }

    static navigateTo(page) {
        this.currentPage = page;
        // Notify all listeners
        this.pageChangeListeners.forEach(listener => listener(page));
    }

    static navigateSilent(page) {
        this.currentPage = page;
    }

    static addPageChangeListener(callback) {
        this.pageChangeListeners.push(callback);
        return () => {
// Return function to remove listener
            this.pageChangeListeners = this.pageChangeListeners.filter(cb => cb !== callback);
        };
    }

    static triggerCartUpdate() {
        this.cartUpdateListeners.forEach(listener => listener());
    }

    static registerCartUpdate(callback) {
        this.cartUpdateListeners.push(callback);
        return () => {
            this.cartUpdateListeners = this.cartUpdateListeners.filter(cb => cb !== callback);
        };
    }

    static checkUser(username) {
        const user = Util.fakeData["getUsers"].find(user => user.Username === username);
        if (user) {
            return {exists: true};
        }
        return {exists: false};
    }


    static getImageFromBackend(filename){
        return this.backendIp + "/image/get/" + filename
    }

    static async callBackend(endpoint, headers = {}) {
        console.log(`Calling backend endpoint: ${endpoint}`);
        if (Util.fakeIt) {
            if (endpoint === "check-user") {
                const userData = this.checkUser(headers.username);
                console.log(`Simulated response: ${JSON.stringify(userData)}`);
                return new Promise((resolve) => {
                    setTimeout(() => resolve(userData), this.fakeDataDelay);
                });
            }
            if (endpoint === "login") {
                return new Promise((resolve) => {
                    setTimeout(() => resolve({
                        msg: "success",
                        user: this.fakeLogin(headers.username)
                    }), this.fakeDataDelay);
                });
            }
            if (Util.fakeData[endpoint]) {
                console.log(`Simulated response: ${JSON.stringify(Util.fakeData[endpoint])}`);
                return new Promise((resolve) => {
                    setTimeout(() => resolve(Util.fakeData[endpoint]), this.fakeDataDelay);
                });
            } else {
                return new Promise((_, reject) => {
                    setTimeout(() => reject({error: 'Fake endpoint not found'}), this.fakeDataDelay);
                });
            }
        }
        const url = `${Util.backendIp}/${endpoint}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: headers,
            });
            if (!response.ok) {
                throw new Error(`Backend error: ${response.statusText}`);
            }
            const responseData = await response.json();
            console.log(`Response from backend: ${JSON.stringify(responseData)}`);
            return responseData;
        } catch (error) {
            console.error(`Backend request failed: ${error.message}`);
            if (endpoint === "check-user") {
                const userData = this.checkUser(headers.username);
                console.log(`Simulated response: ${JSON.stringify(userData)}`);
                return new Promise((resolve) => {
                    setTimeout(() => resolve(userData), this.fakeDataDelay);
                });
            }
            if (endpoint === "login") {
                return new Promise((resolve) => {
                    setTimeout(() => resolve({
                        msg: "success",
                        user: this.fakeLogin(headers.username)
                    }), this.fakeDataDelay);
                });
            }
            if (Util.fakeData[endpoint]) {
                console.log(`Simulated response: ${JSON.stringify(Util.fakeData[endpoint])}`);
                return new Promise((resolve) => {
                    setTimeout(() => resolve(Util.fakeData[endpoint]), this.fakeDataDelay);
                });
            } else {
                return new Promise((_, reject) => {
                    setTimeout(() => reject({error: 'Fake endpoint not found'}), this.fakeDataDelay);
                });
            }
        }
    }


    // Initialize STOMP websocket connection and return the connection promise
    static initializeWebSocket(serverUrl = 'http://localhost:8080') {
        return wsService.connect(serverUrl);
    }
    
    // Subscribe to a STOMP topic, now returns a promise that resolves when subscribed
    static async subscribeToTopic(topic, callback) {
        await wsService.subscribe(topic, callback);
    }
    
    // Unsubscribe from a STOMP topic
    static unsubscribeFromTopic(topic) {
        wsService.unsubscribe(topic);
    }
    
    // Disconnect from STOMP server
    static disconnectWebSocket() {
        wsService.disconnect();
    }

}

export default Util;