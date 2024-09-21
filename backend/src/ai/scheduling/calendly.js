const axios = require("axios");

// Function to schedule a meeting for a single candidate
function convertUrlToUri(eventTypeUrl) {
    // Extract everything after the base URL "https://api.calendly.com"
    const baseUrl = "https://api.calendly.com";
    
    // Ensure the eventTypeUrl starts with the base URL
    if (eventTypeUrl.startsWith(baseUrl)) {
      return eventTypeUrl.replace(baseUrl, ""); // Remove the base URL, leaving the relative URI
    } else {
      throw new Error('Invalid Event Type URL');
    }
  }
    
async function scheduleMeeting(accessToken, eventTypeUrl, candidateEmail) {
    try {
        console.log("candidate email", candidateEmail);
        // Validate inputs
        if (!eventTypeUrl || !candidateEmail) {
            throw new Error('Event type URL and candidate email are required.');
        }
        console.log("schedule meeting function")
        const event_type_uri=  convertUrlToUri(eventTypeUrl);
        console.log("event type url", event_type_uri);
      const response = await axios.post(
        "https://api.calendly.com/scheduled_events", 
        {
          event: {
            event_type: event_type_uri, // Calendly event type URL of the recruiter
            invitees: [
              {
                email: candidateEmail, // Candidate's email
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`, // OAuth token of the recruiter
            "Content-Type": "application/json",
          },
        }
      );
   
      console.log(`Meeting scheduled for ${candidateEmail}:`, response.data);
    } catch (error) {
      // Improved error logging
      console.error(`Error scheduling meeting for ${candidateEmail}:`, error);
    }
  }

  async function bulkScheduleMeetings(accessToken, eventTypeUrl, candidateEmails) {
    console.log("bulk schedule meeting function");
    if (!Array.isArray(candidateEmails)) {
        throw new Error('Candidate emails must be an array');
    }
    
    const results = [];
    for (const candidateEmail of candidateEmails) {
        try {
            const result = await scheduleMeeting(accessToken, eventTypeUrl, candidateEmail);
            results.push({ email: candidateEmail, status: 'success', data: result });
        } catch (error) {
            results.push({ email: candidateEmail, status: 'failed', error: error.message });
        }
    }
    
    return results;
}

// Example usage
// const recruiterAccessToken = "recruiter_oauth_access_token"; // OAuth access token for the recruiter
// const eventTypeUrl = "https://calendly.com/recruiter/interview"; // Replace with actual event type URL
// const candidateEmails = [
//   "candidate1@example.com",
//   "candidate2@example.com",
//   "candidate3@example.com",
//   // Add more candidate emails as needed
// ];

// // Call the bulk scheduling function
// bulkScheduleMeetings(recruiterAccessToken, eventTypeUrl, candidateEmails);

// // Bulk schedule for multiple candidates
// const candidates = [
//   { email: "candidate1@example.com" },
//   { email: "candidate2@example.com" },
//   // Add more candidates
// ];

// getToken().then((accessToken) => {
//   candidates.forEach((candidate) => {
//     scheduleMeeting(accessToken, candidate.email);
//   });
// });

module.exports = {
    scheduleMeeting,
    bulkScheduleMeetings,
    };