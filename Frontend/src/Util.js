class Util {
  static backendIp = 'http://127.0.0.1:3199/';
  static fakeIt = true;
  static fakeData = {
    'check-user': { exists: true },
    'endpoint2': { data: 'Fake Data for Endpoint 2' },
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
      "saveCart": "success",
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
      ]
  };

  // Navigation system
  static currentPage = 'home';
  static pageChangeListeners = [];

  static navigateTo(page) {
    this.currentPage = page;
    // Notify all listeners
    this.pageChangeListeners.forEach(listener => listener(page));
  }

  static addPageChangeListener(callback) {
    this.pageChangeListeners.push(callback);
    return () => {
      // Return function to remove listener
      this.pageChangeListeners = this.pageChangeListeners.filter(cb => cb !== callback);
    };
  }

    static checkUser(username) {
        const users = ["admin", "clerk", "delivery", "butcher"];
        if (users.includes(username)) {
            return {exists: true, role: username};
        }
        return {exists: false};
    }

    static async callBackend(endpoint, headers = {}) {
        console.log(`Calling backend endpoint: ${endpoint}`);
        if (Util.fakeIt) {
            if (endpoint === "check-user") {
                const userData = Util.checkUser(headers.username);
                console.log(`Simulated response: ${JSON.stringify(userData)}`);
                return new Promise((resolve) => {
                    setTimeout(() => resolve(userData), 100);
                });
            }
            if (Util.fakeData[endpoint]) {
                console.log(`Simulated response: ${JSON.stringify(Util.fakeData[endpoint])}`);
                return new Promise((resolve) => {
                    setTimeout(() => resolve(Util.fakeData[endpoint]), 100);
                });
            } else {
                return Promise.reject({error: 'Fake endpoint not found'});
            }
        }
        const url = `${Util.backendIp}${endpoint}`;
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
            return {error: error.message};
        }
    }
}

export default Util;