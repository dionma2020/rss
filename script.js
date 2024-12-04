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

        logDebug("Fetched RSS Feed:\n" );
        logDebug("All Calls Data:\n" );
        logDebug("Fire Truck Data:\n" );

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

function decodeRSSFeed(rssText, allCallsData, fireTruckData) {
    const items = [];

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rssText, "text/xml");

    const allCallsLines = allCallsData.split("\n");
    const fireTruckLines = fireTruckData.split("\n");

    const entries = xmlDoc.querySelectorAll("entry");
    entries.forEach((entry) => {
        const title = entry.querySelector("title")?.textContent || "Unknown";
        const description = entry.querySelector("description")?.textContent || "Unknown";

        const callInfo = decodeCallInfo(description, allCallsLines);
        const fireTruckStatus = decodeFireTruckStatus(description, fireTruckLines);

        items.push({ title, callInfo, fireTruckStatus });
    });

    return items;
}

function decodeCallInfo(line, allCallsLines) {
    const startIndex = line.indexOf("C");
    if (startIndex !== -1) {
        const endIndex = line.indexOf("F", startIndex);
        if (endIndex !== -1) {
            const callNumber = line.substring(startIndex, endIndex + 1);
            for (const callLine of allCallsLines) {
                if (callLine.includes(callNumber)) {
                    return callLine.split(",")[1].trim();
                }
            }
        }
    }
    return "Unknown Call Info";
}

function decodeFireTruckStatus(line, fireTruckLines) {
    const startIndex = line.indexOf("F");
    if (startIndex !== -1) {
        const endIndex = line.indexOf("C", startIndex);
        if (endIndex !== -1) {
            const truckNumber = line.substring(startIndex + 1, endIndex + 1);
            for (const truckLine of fireTruckLines) {
                if (truckLine.includes(truckNumber)) {
                    return truckLine.split(",")[1].trim();
                }
            }
        }
    }
    return "Unknown Truck Status";
}

function displayData(data) {
    const outputDiv = document.getElementById("output");
    if (!data || data.length === 0) {
        outputDiv.innerHTML = "<p>No data to display</p>";
        return;
    }

    outputDiv.innerHTML = data
        .map(
            (item) => `
            <div>
                <h3>${item.title}</h3>
                <p><strong>Call Info:</strong> ${item.callInfo}</p>
                <p><strong>Firetruck Status:</strong> ${item.fireTruckStatus}</p>
            </div>
        `
        )
        .join("<hr>");
}

// Periodically fetch updates
setInterval(processRSSFeed, 10000); // Check for updates every 10 seconds
processRSSFeed(); // Initial fetch