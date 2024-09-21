const axios = require('axios');
const dotenv = require('dotenv').config();

module.exports = async function getAccessToken(authCode) {
    try {
        const response = await axios.post(
            'https://auth.calendly.com/oauth/token',
            {
              grant_type: 'authorization_code',
              code: authCode,
              client_id: "dydNyasNk2tY1xaJA1JHJZW4_hPgoILL9rFG75vdnIo",
              client_secret: "aIhDJyNmPltV1ijybKBZZGdqoIwqRucL3-0RNldN7TA",
              redirect_uri: "https://localhost:5173" // Same as in the authorization request
            },
            {
              headers: { 
                'Content-Type': 'application/json',
              },
            }
          );
        //   console.log('Access Token:', response.data);
      const { access_token } = response.data;
      console.log('Access Token:', access_token); 
  
      return access_token;
    } catch (error) {
      console.error('Error obtaining access token:', error.data);
    }
  }

