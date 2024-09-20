const axios = require('axios');
const getToken = require('./getToken');

async function getCurrentUser(accessToken) {
    try {
      const response = await axios.get('https://api.calendly.com/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.data.resource.uri; // Return the user's URI
    } catch (error) {
      console.error('Error fetching user information:', error.response ? error.response.data : error.message);
    }
  }
// Function to check if an event type exists
async function checkEventTypeExists(accessToken, eventTypeName) {
    try {
      // Step 1: Get the current user's URI
      const userUri = await getCurrentUser(accessToken);
      if (!userUri) {
        throw new Error('Could not retrieve user information.');
      }
  
      // Step 2: Fetch event types for the user
      const response = await axios.get('https://api.calendly.com/event_types', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        params: {
          user: userUri,  // Include the user's URI in the request
        },
      });
     console.log("event type name:", eventTypeName);
      const eventTypes = response.data.collection;
      console.log("Event Types:", eventTypes);
      const existingEventType = eventTypes.find(eventType => eventType.name === eventTypeName);
     console.log('Existing Event Type:', existingEventType);
      return existingEventType ? existingEventType.uri : null;
    } catch (error) {
      console.error('Error checking event types:', error.response ? error.response.data : error.message);
    }
}

// Function to create a new event type
async function createEventType(accessToken, eventTypeName) {
    try {
      const userUri = await getCurrentUser(accessToken);
      if (!userUri) {
        throw new Error('Could not retrieve user information.');
      }
  
      const response = await axios.post(
        'https://api.calendly.com/event_types',
        {
          name: eventTypeName,
          duration: 30,
          kind: 'ONE_ON_ONE',
          description: 'Interview scheduling',
          location: 'google_meet', // Default location for interviews
          user: userUri, // Include the user's URI
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log('Event type created:', response.data);
      return response.data.uri; 
    } catch (error) {
      console.error('Error creating event type:', error.response ? error.response.data : error.message);
      throw error; // Throw error for further handling
    }
  }

// Main function to check and create event type if necessary
module.exports = async function ensureEventType(accessToken, eventTypeName) {
  try {
    console.log('Checking event type:', eventTypeName);
    const existingEventTypeUri = await checkEventTypeExists(accessToken, eventTypeName);
    console.log("Existing Event Type URI:", existingEventTypeUri);
    if (existingEventTypeUri) {
      console.log('Event type already exists:', existingEventTypeUri);
      return existingEventTypeUri;
    } else {
      return await createEventType(accessToken, eventTypeName);
    }
  } catch (error) {
    console.error('Error ensuring event type:', error.data);
  }
}

// Example usage
// const recruiterAccessToken = getToken() // OAuth access token for the recruiter

// //What is event type uri ?
// //The event type URI is a unique identifier for the event type created in Calendly. It is used to reference the event type when scheduling meetings or checking the availability of the recruiter. The URI is a URL that points to the specific event type resource in the Calendly API.
// if (recruiterAccessToken) {
//     ensureEventType(recruiterAccessToken, eventTypeName)
//       .then(eventTypeUri => {
//         console.log('Final Event Type URI:', eventTypeUri);
//       })
//       .catch(error => {
//         console.error('Failed to ensure event type:', error);
//       });
// }
