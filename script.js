const rssFeedUrl = "https://raw.githubusercontent.com/dionma2020/rss/main/feed.xml";
const allCallsFileUrl = "https://raw.githubusercontent.com/dionma2020/rss/main/allcalls.dat";
const fireTruckFileUrl = "https://raw.githubusercontent.com/dionma2020/rss/main/FireTruckStatus.dat";

async function processRSSFeed() {
    try {
        const [rssResponse, allCallsResponse, fireTruckResponse] = await Promise.all([
            fetch(rssFeedUrl),
            fetch(allCallsFileUrl),
            fetch(fireTruckFileUrl),
        ]);

        const rssText = await rssResponse.text();
        const allCallsData = await allCallsResponse.text();
        const fireTruckData = await fireTruckResponse.text();

        const rssEntries = parseRSS(rssText);
        const allCalls = parseDataFile(allCallsData);
        const fireTruck = parseDataFile(fireTruckData);

        const decodedData = decodeEntries(rssEntries, allCalls, fireTruck);

        displayData(decodedData);
    } catch (error) {
        console.error("Error processing RSS feed:", error);
        document.getElementById("output").textContent = "Error loading data.";
    }
}

function parseRSS(rssText) {
    const lines = rssText.split("\n").filter(line => line.includes(","));
    return lines.map(line => {
        const [code, timestamp] = line.split(",");
        return { code: code.trim(), timestamp: timestamp.trim() };
    });
}

function parseDataFile(dataText) {
    const lines = dataText.split("\n").filter(line => line.includes(","));
    const map = new Map();
    lines.forEach(line => {
        const [code, description] = line.split(",");
        map.set(code.trim(), description.trim());
    });
    return map;
}

function decodeEntries(rssEntries, allCalls, fireTruck) {
    return rssEntries.map(entry => {
        const callDesc = allCalls.get(entry.code) || "Unknown Call";
        const truckDesc = fireTruck.get(entry.code) || "Unknown Status";
        return { ...entry, callDesc, truckDesc };
    });
}

function displayData(decodedData) {
    const outputContainer = document.getElementById("output");
    outputContainer.innerHTML = decodedData
        .map(entry =>
            `<p><strong>${entry.code}</strong>: ${entry.callDesc} - ${entry.truckDesc} (Last seen: ${entry.timestamp})</p>`
        )
        .join("");
}

// Start processing
processRSSFeed();
setInterval(processRSSFeed, 10000);