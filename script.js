const rssFeedUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/feed.xml";
const allCallsFileUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/allcalls.dat";
const fireTruckFileUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/FireTruckStatus.dat";

let lastUpdated = null; // Track the last update time

async function processRSSFeed() {
    try {
        const [rssResponse, allCallsResponse, fireTruckResponse] = await Promise.all([
            fetch(rssFeedUrl),
            fetch(allCallsFileUrl),
            fetch(fireTruckFileUrl)
        ]);

        const rssText = await rssResponse.text();
        const allCallsData = await allCallsResponse.text();
        const fireTruckData = await fireTruckResponse.text();

        logDebug("Fetched RSS Feed:\n" + rssText);
        logDebug("All Calls Data:\n" + allCallsData);
        logDebug("Fire Truck Data:\n" + fireTruckData);

        const decodedData = decodeRSSFeed(rssText, allCallsData, fireTruckData);
        logDebug("Decoded Data:\n" + JSON.stringify(decodedData, null, 2));

        displayData(decodedData);
    } catch (error) {
        logDebug("Error processing RSS feed:\n" + error.message);
    }
}
function logDebug(message) {
    const debugLogs = document.getElementById("debugLogs");
    if (typeof message === "object") {
        message = JSON.stringify(message, null, 2); // Pretty-print objects
    }
    debugLogs.textContent += message + "\n";
}


// Decode and display functions remain the same...

// Periodically fetch updates
setInterval(processRSSFeed, 5000); // Check for updates every 10 seconds
processRSSFeed(); // Initial fetch