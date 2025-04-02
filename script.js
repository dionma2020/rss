const rssFeedUrl = "https://raw.githubusercontent.com/dionma2020/rss/main/feed.xml";
const allCallsFileUrl = "https://raw.githubusercontent.com/dionma2020/rss/main/allcalls.dat";
const fireTruckFileUrl = "https://raw.githubusercontent.com/dionma2020/rss/main/FireTruckStatus.dat";

// Fetch file data with cache busting
async function fetchData(url) {
    const cacheBuster = `${url}?t=${new Date().getTime()}`; // Prevent caching
    const response = await fetch(cacheBuster);
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
        if (code && timestamp) {
            entries.push({ code: code.trim(), timestamp: timestamp.trim() });
        }
    }
    return entries;
}

// Parse data file
function parseDataFile(fileText) {
    const map = new Map();
    const lines = fileText.split("\n").filter(line => line.includes(","));
    for (const line of lines) {
        const [key, value] = line.split(",");
        if (key && value) {
            map.set(key.trim(), value.trim());
        }
    }
    return map;
}

// Find best match (exact or approximate)
function findBestMatch(target, map) {
    if (map.has(target)) {
        return map.get(target); // Exact match
    }

    // Find approximate match
    const closestMatches = [...map.keys()].filter(key => key.startsWith(target));
    if (closestMatches.length > 0) {
        const bestMatch = closestMatches[0];
        return map.get(bestMatch) + '*'; // Return match with '*' for approximation
    }

    return ""; // No match found
}

// Decode RSS entries
function decodeEntries(rssEntries, allCallsMap, fireTruckMap) {
    return rssEntries
        .map(entry => {
            let callDesc = findBestMatch(entry.code, allCallsMap);
            let truckDesc = findBestMatch(entry.code, fireTruckMap);

            if (callDesc && truckDesc) {
                return { ...entry, callDesc, truckDesc };
            }
            return null; // If no match found
        })
        .filter(entry => entry !== null); // Remove null entries
}

// Display decoded entries
function displayDecodedEntries(decodedEntries) {
    const output = document.getElementById("output");
    output.innerHTML = ""; // Clear previous content

    if (decodedEntries.length === 0) {
        output.innerHTML = "<p>No decoded entries found.</p>";
        return;
    }

    for (const entry of decodedEntries) {
        const p = document.createElement("p");
        p.textContent = `${entry.callDesc} - ${entry.truckDesc} (${entry.timestamp})`;
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
        output.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

// Refresh data every second
setInterval(processRSSFeed, 1000);
processRSSFeed();