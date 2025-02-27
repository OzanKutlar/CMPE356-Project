class Util {
  static backendIp = 'http://127.0.0.1:3199/';
  static fakeIt = true;
  static fakeData = {
    'check-user': { exists: true },
    'endpoint2': { data: 'Fake Data for Endpoint 2' },
    "items": [
                {ItemName:"Minced Meat",
                 ItemPrice:12, 
                 ItemPhotoLink: "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/kuzu-az-yagli-kiyma-1f-4f9.jpg"},
                {ItemName:"Cubed Meat", 
                ItemPrice:12, 
                ItemPhotoLink: "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-kusbasi--478c-.jpg"},
                {ItemName:"Entrecôte", 
                ItemPrice:12, 
                ItemPhotoLink: "https://static.ticimax.cloud/43437/uploads/urunresimleri/buyuk/dana-antrikot--8f97-.jpg"},
                {ItemName:"Steak", 
                ItemPrice:12, 
                ItemPhotoLink: "https://static.ticimax.cloud/cdn-cgi/image/width=-,quality=85/43437/uploads/urunresimleri/buyuk/dilimli-dana-bonfile-83e53-.jpg"},
                {ItemName:"Chopped Meat", 
                ItemPrice:12, 
                ItemPhotoLink: "https://www.eskitadinda.com/cdn-cgi/imagedelivery/iyyOLTStLptbsvCoMH9lkA/188576e7-fcff-46bc-655a-650dadc2a600/700x500"}],
    "cart": [
                {
                  "ItemCount": 2,
                  "ItemName": "Grilled Chicken Breast",
                  "ItemPhotoLink": "https://t4.ftcdn.net/jpg/03/59/86/55/360_F_359865519_H5OPBm9bqpu8UWvr2OGf6afr1O8TB0nJ.jpg",
                  "ItemPrice": 12.99
                },
                {
                  "ItemCount": 1,
                  "ItemName": "Premium Beef Burger",
                  "ItemPhotoLink": "https://t4.ftcdn.net/jpg/03/59/86/55/360_F_359865519_H5OPBm9bqpu8UWvr2OGf6afr1O8TB0nJ.jpg",
                  "ItemPrice": 15.50
                },
                {
                  "ItemCount": 3,
                  "ItemName": "Fish Fillet",
                  "ItemPhotoLink": "https://t4.ftcdn.net/jpg/03/59/86/55/360_F_359865519_H5OPBm9bqpu8UWvr2OGf6afr1O8TB0nJ.jpg",
                  "ItemPrice": 9.99
                },
                {
                  "ItemCount": 1,
                  "ItemName": "Lamb Chops",
                  "ItemPhotoLink": "https://t4.ftcdn.net/jpg/03/59/86/55/360_F_359865519_H5OPBm9bqpu8UWvr2OGf6afr1O8TB0nJ.jpg",
                  "ItemPrice": 24.99
                }
              ],
    "submitOrder": "success",
      "addToCart": "success",
      "saveCart": "success",
    "getRecipes": [{
        "name": "Recipe1",   // This could be a string like 'Spaghetti carbonara' that represents the name of this recipe. It doesn’t necessarily have to match actual names because it just demonstrates how you might structure your response data in JavaScript, or if there is any other specific requirements on what should go here
        "photo": "https://t4.ftcdn.net/jpg/03/59/86/55/360_F_359865519_H5OPBm9bqpu8UWvr2OGf6afr1O8TB0nJ.jpg", // This could be a URL pointing towards the photo of this recipe. It doesn’t necessarily have to match actual image paths because it just demonstrates how you might structure your response data in JavaScript, or if there is any other specific requirements on what should go here
        "data": "This is some very long and detailed description about Recipe1." // This could be a string that contains the full text of this recipe. It doesn’t necessarily have to match actual descriptions because it just demonstrates how you might structure your response data in JavaScript, or if there is any other specific requirements on what should go here
    }]
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

  static checkUser(username){
    if(username === "admin"){
      return {exists: true, role: "admin"};
    }
    if(username === "clerk"){
      return {exists: true, role: "clerk"};
    }
    if(username === "delivery"){
      return {exists: true, role: "delivery"};
    }
    return {exists: false}
  }
  
  static async callBackend(endpoint, headers = {}) {
    console.log(`Calling backend endpoint: ${endpoint}`);
    if (Util.fakeIt) {
      if (Util.fakeData[endpoint]) {
        if(endpoint === "check-user"){
            Util.fakeData[endpoint] = Util.checkUser(headers.username);
        }
        console.log(`Simulated response: ${JSON.stringify(Util.fakeData[endpoint])}`);
        return new Promise((resolve) => {
          setTimeout(() => resolve(Util.fakeData[endpoint]), 100); 
        });
      } else {
        return Promise.reject({ error: 'Fake endpoint not found' });
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
      return { error: error.message };
    }
  }
}

export default Util;