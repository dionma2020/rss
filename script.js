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

        console.log("Fetched RSS Feed:", rssText);
        console.log("All Calls Data:", allCallsData);
        console.log("Fire Truck Data:", fireTruckData);

        const decodedData = decodeRSSFeed(rssText, allCallsData, fireTruckData);
        console.log("Decoded Data:", decodedData);

        displayData(decodedData);
    } catch (error) {
        console.error("Error processing RSS feed:", error);
    }
}

// Decode and display functions remain the same...

// Periodically fetch updates
setInterval(processRSSFeed, 5000); // Check for updates every 10 seconds
processRSSFeed(); // Initial fetch