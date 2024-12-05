const rssFeedUrl = "https://raw.githubusercontent.com/dionma2020/rss/main/feed.xml";
const allCallsFileUrl = "https://raw.githubusercontent.com/dionma2020/rss/main/allcalls.dat";
const fireTruckFileUrl = "https://raw.githubusercontent.com/dionma2020/rss/main/FireTruckStatus.dat";

// Function to fetch files
async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch: ${url}`);
    }
    return await response.text();
}

// Function to parse the RSS feed
function parseRSSFeed(rssText) {
    const entries = [];
    const lines = rssText.split("\n").filter(line => line.includes(","));
    lines.forEach(line => {
        const [code, timestamp] = line.split(",");
        entries.push({ code: code.trim(), timestamp: timestamp.trim() });
    });
    return entries;
}

// Function to decode entries
function decodeEntries(rssEntries, allCalls, fireTruck) {
    return rssEntries.map(entry => {
        let callDesc = "Unknown Call";
        let truckDesc = "Unknown Status";

        // Attempt to match substrings of the code
        for (let i = 1; i <= entry.code.length; i++) {
            const prefix = entry.code.slice(0, i);
            const suffix = entry.code.slice(i);

            if (allCalls.has(prefix)) callDesc = allCalls.get(prefix);
            if (fireTruck.has(suffix)) truckDesc = fireTruck.get(suffix);
        }

        return { ...entry, callDesc, truckDesc };
    });
}

// Function to load data into maps
function parseDataFile(dataText) {
    const map = new Map();
    const lines = dataText.split("\n").filter(line => line.includes(","));
    lines.forEach(line => {
        const [key, value] = line.split(",");
        map.set(key.trim(), value.trim());
    });
    return map;
}

// Function to display the decoded data
function displayData(decodedEntries) {
    const output = document.getElementById("output");
    output.innerHTML = "";

    decodedEntries.forEach(entry => {
        const line = document.createElement("p");
        line.textContent = `${entry.code}: ${entry.callDesc} - ${entry.truckDesc} (Last seen: ${entry.timestamp})`;
        output.appendChild(line);
    });
}

// Main function to process the RSS feed and data files
async function processRSSFeed() {
    try {
        const [rssText, allCallsText, fireTruckText] = await Promise.all([
            fetchData(rssFeedUrl),
            fetchData(allCallsFileUrl),
            fetchData(fireTruckFileUrl)
        ]);

        const rssEntries = parseRSSFeed(rssText);
        const allCalls = parseDataFile(allCallsText);
        const fireTruck = parseDataFile(fireTruckText);

        const decodedEntries = decodeEntries(rssEntries, allCalls, fireTruck);
        displayData(decodedEntries);
    } catch (error) {
        console.error("Error processing RSS feed:", error);
        const output = document.getElementById("output");
        output.innerHTML = `<p>Error loading data: ${error.message}</p>`;
    }
}

// Periodically fetch updates
setInterval(processRSSFeed, 5000);
processRSSFeed();