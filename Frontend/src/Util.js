class Util {
  static backendIp = 'http://127.0.0.1:3199/';
  static fakeIt = true;
  static fakeData = {
    'check-user': { exists: true },
    'endpoint2': { data: 'Fake Data for Endpoint 2' },
  };

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
      // Simulate backend response with delay
      if (Util.fakeData[endpoint]) {
        if(endpoint == "check-user"){
            Util.fakeData[endpoint] = Util.checkUser(headers.username);
        }
        console.log(`Simulated response: ${JSON.stringify(Util.fakeData[endpoint])}`);
        return new Promise((resolve) => {
          setTimeout(() => resolve(Util.fakeData[endpoint]), 200); // Simulated delay
        });
      } else {
        return Promise.reject({ error: 'Fake endpoint not found' });
      }
    }

    // Send real fetch request to the backend
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
