// const axios = require('axios');
// const dotenv = require('dotenv').config();

// module.exports = async function getAccessToken(authCode) {
//     try {
//         const response = await axios.post(
//             'https://auth.calendly.com/oauth/token',
//             {
//               grant_type: 'authorization_code',
//               code: authCode,
//               client_id: "dydNyasNk2tY1xaJA1JHJZW4_hPgoILL9rFG75vdnIo",
//               client_secret: "aIhDJyNmPltV1ijybKBZZGdqoIwqRucL3-0RNldN7TA",
//               redirect_uri: "https://localhost:5173" // Same as in the authorization request
//             },
//             {
//               headers: { 
//                 'Content-Type': 'application/json',
//               },
//             }
//           );
//         //   console.log('Access Token:', response.data);
//       const { access_token } = response.data;
//       console.log('Access Token:', access_token); 
  
//       return access_token;
//     } catch (error) {
//       console.error('Error obtaining access token:', error.data);
//     }
//   }
const { google } = require('googleapis'); 
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  '665488303177-057lra11leog8gnbati275ej7p6afdf4.apps.googleusercontent.com',     // Your OAuth 2.0 client ID
  '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', // Your OAuth 2.0 client secret
  'https://localhost:5173/oauth/callback'   // Redirect URI specified in the Google Cloud Console
);

// Step 2: Exchange authorization code for access token
 module.exports = async function getAccessToken(authCode) {
  try {
    // Exchange the authorization code for access token
    const { tokens } = await oauth2Client.getToken(authCode);
    
    // Save the access token and refresh token for future API requests
    oauth2Client.setCredentials(tokens);
    
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);
    
    return tokens;
  } catch (error) {
    console.error('Error retrieving access token:', error.message);
  }
}


