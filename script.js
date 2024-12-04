const rssFeedUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/feed.xml";
const allCallsFileUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/allcalls.dat";
const fireTruckFileUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/FireTruckStatus.dat";

async function processRSSFeed() {
    try {
        // Fetch RSS feed and data files
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

function decodeRSSFeed(rssText, allCallsData, fireTruckData) {
    const allCallsMap = new Map();
    const fireTruckMap = new Map();

    // Populate allCallsMap
    allCallsData.split("\n").forEach((line) => {
        const [callCode, description] = line.split(",");
        if (callCode && description) {
            allCallsMap.set(callCode.trim(), description.trim());
        }
    });

    // Populate fireTruckMap
    fireTruckData.split("\n").forEach((line) => {
        const [truckCode, status] = line.split(",");
        if (truckCode && status) {
            fireTruckMap.set(truckCode.trim(), status.trim());
        }
    });

    console.log("All Calls Map:", allCallsMap);
    console.log("Fire Truck Map:", fireTruckMap);

    // Parse the RSS feed
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rssText, "text/xml");
    const entries = xmlDoc.querySelectorAll("channel > entry");

    const results = [];
    entries.forEach((entry) => {
        const rawText = entry.textContent.trim();
        const callInfo = Array.from(allCallsMap.entries()).find(([key]) => rawText.includes(key));
        const truckInfo = Array.from(fireTruckMap.entries()).find(([key]) => rawText.includes(key));

        if (callInfo || truckInfo) {
            results.push({
                raw: rawText,
                call: callInfo ? callInfo[1] : "Unknown",
                truck: truckInfo ? truckInfo[1] : "Unknown"
            });
        }
    });

    console.log("Decoded Results:", results);
    return results;
}

function displayData(data) {
    const outputDiv = document.getElementById("output");
    outputDiv.innerHTML = "";

    if (data.length === 0) {
        outputDiv.textContent = "No matching data found.";
        return;
    }

    data.forEach((item) => {
        const entryDiv = document.createElement("div");
        entryDiv.textContent = `Raw: ${item.raw}, Call Info: ${item.call}, Truck Info: ${item.truck}`;
        outputDiv.appendChild(entryDiv);
    });
}

// Periodically fetch updates
setInterval(processRSSFeed, 5000);
processRSSFeed();