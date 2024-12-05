const rssFeedUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/feed.xml";
const allCallsFileUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/allcalls.dat";
const fireTruckFileUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/FireTruckStatus.dat";

async function processRSSFeed() {
    try {
        // Fetch all data in parallel
        const [rssResponse, allCallsResponse, fireTruckResponse] = await Promise.all([
            fetch(rssFeedUrl),
            fetch(allCallsFileUrl),
            fetch(fireTruckFileUrl),
        ]);

        const rssText = await rssResponse.text();
        const allCallsData = await allCallsResponse.text();
        const fireTruckData = await fireTruckResponse.text();

        // Parse data into usable structures
        const rssItems = parseRSS(rssText);
        const allCalls = parseData(allCallsData);
        const fireTruck = parseData(fireTruckData);

        // Debugging output
        console.log("RSS Items:", rssItems);
        console.log("All Calls Data:", allCalls);
        console.log("Fire Truck Data:", fireTruck);

        const decodedData = decodeRSSFeed(rssItems, allCalls, fireTruck);

        // Debugging output
        console.log("Decoded Data:", decodedData);

        displayData(decodedData);
    } catch (error) {
        console.error("Error processing RSS feed:", error);
    }
}

function parseRSS(rssText) {
    // Extract RSS data lines (strip XML tags for simplicity)
    const lines = rssText.split("\n").filter(line => line.trim().match(/^[A-Za-z0-9,]+$/));
    return lines.map(line => line.split(",")[0].trim());
}

function parseData(dataText) {
    // Parse CSV-like data into an array of [key, value] pairs
    return dataText.split("\n").map(line => line.split(",").map(item => item.trim())).filter(line => line.length === 2);
}

function decodeRSSFeed(rssItems, allCalls, fireTruck) {
    const results = [];

    rssItems.forEach(rssItem => {
        const callMatch = allCalls.find(([callId]) => rssItem === callId);
        const truckMatch = fireTruck.find(([truckId]) => rssItem === truckId);

        if (callMatch || truckMatch) {
            results.push({
                selcall: rssItem,
                alias: callMatch ? callMatch[1] : "Unknown",
                status: truckMatch ? truckMatch[1] : "No Status",
            });
        }
    });

    return results;
}

function displayData(decodedData) {
    const outputContainer = document.getElementById("output");
    outputContainer.innerHTML = ""; // Clear existing data

    decodedData.forEach(item => {
        const div = document.createElement("div");
        div.textContent = `Selcall: ${item.selcall}, Alias: ${item.alias}, Status: ${item.status}`;
        outputContainer.appendChild(div);
    });
}

// Periodically fetch updates
setInterval(processRSSFeed, 5000);
processRSSFeed(); // Initial fetch