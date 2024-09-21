module.exports = function percentageFilter(scoredCandidates, rawPercentage) {
    const percentage = parseInt(rawPercentage) / 100;

    const sortedCandidates = scoredCandidates.sort(
        (a, b) => b.suitability_rating - a.suitability_rating
    );
    const keepCount = Math.ceil(sortedCandidates.length * percentage);
    const topCandidates = sortedCandidates.slice(0, keepCount);
    return topCandidates;
}

// Example usage
const candidates = [
    {
        "personal_information": {
            "name": "Aries Dmello",
            "contact_number": "8446917747",
            "email": "dmelloaries@gmail.com",
            "location": "Mumbai, India"
        },
        "suitability_rating": 85,
        "reason": "Aries Dmello is a strong candidate...",
        "applicantId": 1
    },
    {
        "personal_information": {
            "name": "SUJIT MISHRA",
            "contact_number": "8263954372",
            "email": "mishrasujit409@gmail.com",
            "location": "Vasai"
        },
        "suitability_rating": 85,
        "reason": "The candidate possesses a strong skill set...",
        "applicantId": 2
    }
];

// Call the function with 50% filter
// const topCandidates = percentageFilter(candidates, 50);
// console.log(topCandidates);
