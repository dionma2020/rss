const rssFeedUrl = "https://raw.githubusercontent.com/dionma2020/rss/main/feed.xml";
const allCallsFileUrl = "https://raw.githubusercontent.com/dionma2020/rss/main/allcalls.dat";
const fireTruckFileUrl = "https://raw.githubusercontent.com/dionma2020/rss/main/FireTruckStatus.dat";

// Fetch file data
async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error fetching ${url}: ${response.statusText}`);
    }
    return response.text();
}

// Parse RSS feed
function parseRSSFeed(feedText) {
    const entries = [];
    const lines = feedText.split("\n").filter(line => line.includes(","));
    for (const line of lines) {
        const [code, timestamp] = line.split(",");
        entries.push({ code: code.trim(), timestamp: timestamp.trim() });
    }
    return entries;
}

// Parse data file
function parseDataFile(fileText) {
    const map = new Map();
    const lines = fileText.split("\n").filter(line => line.includes(","));
    for (const line of lines) {
        const [key, value] = line.split(",");
        map.set(key.trim(), value.trim());
    }
    return map;
}

// Decode RSS entries
function decodeEntries(rssEntries, allCallsMap, fireTruckMap) {
    return rssEntries.map(entry => {
        let callDesc = "Unknown Call";
        let truckDesc = "Unknown Status";

        // Iterate over possible prefix-suffix splits
        for (let i = 1; i < entry.code.length; i++) {
            const prefix = entry.code.slice(0, i);
            const suffix = entry.code.slice(i);

            if (allCallsMap.has(prefix)) callDesc = allCallsMap.get(prefix);
            if (fireTruckMap.has(suffix)) truckDesc = fireTruckMap.get(suffix);
        }

        // Debugging output to console
        console.log(`Code: ${entry.code}, Prefix Match: ${callDesc}, Suffix Match: ${truckDesc}`);
        return { ...entry, callDesc, truckDesc };
    });
}

// Display decoded entries
function displayDecodedEntries(decodedEntries) {
    const output = document.getElementById("output");
    output.innerHTML = ""; // Clear previous content

    for (const entry of decodedEntries) {
        const p = document.createElement("p");
        p.textContent = `${entry.code}: ${entry.callDesc} - ${entry.truckDesc} (Last seen: ${entry.timestamp})`;
        output.appendChild(p);
    }
}

// Main function
async function processRSSFeed() {
    try {
        const [rssText, allCallsText, fireTruckText] = await Promise.all([
            fetchData(rssFeedUrl),
            fetchData(allCallsFileUrl),
            fetchData(fireTruckFileUrl),
        ]);

        const rssEntries = parseRSSFeed(rssText);
        const allCallsMap = parseDataFile(allCallsText);
        const fireTruckMap = parseDataFile(fireTruckText);

        const decodedEntries = decodeEntries(rssEntries, allCallsMap, fireTruckMap);
        displayDecodedEntries(decodedEntries);
    } catch (error) {
        console.error("Error:", error);
        const output = document.getElementById("output");
        output.innerHTML = `<p>Error: ${error.message}</p>`;
    }
}

// Refresh data every 5 seconds
setInterval(processRSSFeed, 5000);
processRSSFeed();