import Cookies from "js-cookie";

export function generateRandomString(length: number): string {
  const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomString = "";
  for (let i = 0; i < length; i++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomString;
}

export function confirmLogin(sessionId: string, apiUrl: string, loginUrl: string, locationString: string): Promise<string> {
    return new Promise((resolve, reject) => {
    // Set the CORS headers
    const headers = new Headers();
    headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Access-Control-Allow-Credentials', 'true');
    headers.append('Access-Control-Allow-Methods', 'GET');

    // Make an API request to check the login status
    function checkStatus() {
      fetch(`${apiUrl}${sessionId}`, {
        method: 'GET',
        headers: headers,
      },)
        .then(response => response.text()) // Read response as text
          .then(data => {
            console.log(data);
              if (data == 'completed') {
                fetch(`${loginUrl}${sessionId}`, {
                    method: 'GET',
                    headers: headers,
                },)
                  .then(response => response.text())
                  .then((data: any) => {
                    if (data.errorType){
                      console.log(data.errorType);
                      reject('error');
                    }
                    else {
                      // setCookie("authToken", data, 1000);
                      Cookies.set("authToken", data, { expires: 30 });
                      location.href = locationString
                      resolve(data);
                    }
                  })
              } else if (data == 'pending') {
                    // If login is still pending, schedule another check
                    setTimeout(checkStatus, 2000); // Check again after 2 seconds
                } else if (data === 'failed') {
                    // If login is still pending, schedule another check
                    // console.log('Login failed. Try again');
                    reject(data);
                } else {
                  console.log('Unknown issue');
                  reject('Unknown issue');
                }
            })
            .catch(error => {
                console.error(error);
            });
    }

    // Start checking the login status
    setTimeout(checkStatus, 5000);
    });
  }

export function handleChange(url: string, apiUrl: string, loginUrl: string, locationString: string) {
    let sessionId = generateRandomString(15)

    let myWindow = window.open(`${url}/${sessionId}`, '_blank');
    let promise = confirmLogin(sessionId, apiUrl, loginUrl, locationString);

    promise.
    then(response => {
      console.log('Outer',response);
      myWindow?.close();
    })
    .catch(error => {
      console.log('Error: ', error);
    });
  }