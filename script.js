const rssFeedUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/feed.xml";
const allCallsFileUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/allcalls.dat";
const fireTruckFileUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/FireTruckStatus.dat";

// Periodically fetch updates
setInterval(processRSSFeed, 5000); // Check for updates every 5 seconds
processRSSFeed(); // Initial fetch

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

function decodeRSSFeed(rssText, allCallsData, fireTruckData) {
    const items = [];
    const allCallsLines = allCallsData.split("\n");
    const fireTruckLines = fireTruckData.split("\n");

    // Extract raw data lines from the channel content
    const rawLines = rssText.match(/<channel>([\s\S]*?)<\/channel>/)?.[1].trim().split("\n") || [];

    rawLines.forEach((line) => {
        const [selcall, timestamp] = line.split(",");
        if (selcall && timestamp) {
            const callInfo = decodeCallInfo(selcall, allCallsLines);
            const fireTruckStatus = decodeFireTruckStatus(selcall, fireTruckLines);

            items.push({
                selcall: selcall,
                timestamp: timestamp,
                callInfo: callInfo,
                fireTruckStatus: fireTruckStatus,
            });
        }
    });

    return items;
}

function decodeCallInfo(selcall, allCallsLines) {
    for (const line of allCallsLines) {
        if (line.startsWith(selcall)) {
            return line.split(",")[1]?.trim() || "Unknown call info";
        }
    }
    return "No match found in allCalls.dat";
}

function decodeFireTruckStatus(selcall, fireTruckLines) {
    for (const line of fireTruckLines) {
        if (line.startsWith(selcall)) {
            return line.split(",")[1]?.trim() || "Unknown truck status";
        }
    }
    return "No match found in FireTruckStatus.dat";
}

function displayData(decodedData) {
    const dataContainer = document.getElementById("dataContainer");
    dataContainer.innerHTML = ""; // Clear previous data

    decodedData.forEach((item) => {
        const div = document.createElement("div");
        div.textContent = `Selcall: ${item.selcall}, Timestamp: ${item.timestamp}, Call Info: ${item.callInfo}, Fire Truck Status: ${item.fireTruckStatus}`;
        dataContainer.appendChild(div);
    });
}