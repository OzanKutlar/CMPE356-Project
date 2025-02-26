class Util {
  static backendIp = 'http://127.0.0.1:3199/';
  static fakeIt = true;
  static fakeData = {
    'check-user': { exists: true },
    'endpoint2': { data: 'Fake Data for Endpoint 2' },
    "items": [{ItemName:"Test1", ItemPrice:12, ItemPhotoLink: "https://t4.ftcdn.net/jpg/03/59/86/55/360_F_359865519_H5OPBm9bqpu8UWvr2OGf6afr1O8TB0nJ.jpg"}, {ItemName:"Test2", ItemPrice:12, ItemPhotoLink: "https://t4.ftcdn.net/jpg/03/59/86/55/360_F_359865519_H5OPBm9bqpu8UWvr2OGf6afr1O8TB0nJ.jpg"}, {ItemName:"Test3", ItemPrice:12, ItemPhotoLink: "https://t4.ftcdn.net/jpg/03/59/86/55/360_F_359865519_H5OPBm9bqpu8UWvr2OGf6afr1O8TB0nJ.jpg"}],
    "purchase": "success",
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
    "submitOrder": "success"
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
    if(username == "admin"){
      return {exists: true, role: "admin"};
    }
    if(username == "clerk"){
      return {exists: true, role: "clerk"};
    }
    if(username == "delivery"){
      return {exists: true, role: "delivery"};
    }
    return {exists: false}
  }
  
  static async callBackend(endpoint, headers = {}) {
    console.log(`Calling backend endpoint: ${endpoint}`);
    if (Util.fakeIt) {
      if (Util.fakeData[endpoint]) {
        if(endpoint == "check-user"){
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