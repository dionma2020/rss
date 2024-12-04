const rssFeedUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/feed.xml";
const allCallsFileUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/allcalls.dat";
const fireTruckFileUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/FireTruckStatus.dat";

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

        const decodedData = decodeRSSFeed(rssText, allCallsData, fireTruckData);

        displayData(decodedData);
    } catch (error) {
        console.error("Error processing RSS feed:", error);
    }
}

function decodeCallInfo(selcall, allCallsLines) {
    selcall = selcall.trim(); // Normalize selcall
    console.log(`Looking for selcall: "${selcall}" in allCalls.dat`);

    for (const line of allCallsLines) {
        const [fileSelcall, callInfo] = line.split(",");
        if (!fileSelcall) continue;

        if (fileSelcall.trim() === selcall) {
            console.log(`Match found for selcall "${selcall}" in allCalls.dat: "${callInfo.trim()}"`);
            return callInfo.trim() || "Unknown call info";
        }
    }

    console.log(`No match found for selcall "${selcall}" in allCalls.dat`);
    return "No match found in allCalls.dat";
}

function decodeFireTruckStatus(selcall, fireTruckLines) {
    selcall = selcall.trim(); // Normalize selcall
    console.log(`Looking for selcall: "${selcall}" in FireTruckStatus.dat`);

    for (const line of fireTruckLines) {
        const [fileSelcall, truckStatus] = line.split(",");
        if (!fileSelcall) continue;

        if (fileSelcall.trim() === selcall) {
            console.log(`Match found for selcall "${selcall}" in FireTruckStatus.dat: "${truckStatus.trim()}"`);
            return truckStatus.trim() || "Unknown truck status";
        }
    }

    console.log(`No match found for selcall "${selcall}" in FireTruckStatus.dat`);
    return "No match found in FireTruckStatus.dat";
}

function decodeRSSFeed(rssText, allCallsData, fireTruckData) {
    const items = [];
    const allCallsMap = new Map();
    const fireTruckMap = new Map();

    // Parse `allcalls.dat` into a Map
    allCallsData.split("\n").forEach((line) => {
        const [code, description] = line.split(",");
        if (code && description) {
            allCallsMap.set(code.trim(), description.trim());
        }
    });

    // Parse `firetruckstatus.dat` into a Map
    fireTruckData.split("\n").forEach((line) => {
        const [code, description] = line.split(",");
        if (code && description) {
            fireTruckMap.set(code.trim(), description.trim());
        }
    });

    // Parse RSS feed
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rssText, "text/xml");
    const rawEntries = xmlDoc.documentElement.textContent.trim().split("\n");

    rawEntries.forEach((entry) => {
        const [code, timestamp] = entry.split(",");
        if (code && timestamp) {
            const callDesc = allCallsMap.get(code.trim()) || "Unknown Call";
            const truckStatus = fireTruckMap.get(code.trim()) || "Unknown Status";

            items.push({
                code: code.trim(),
                timestamp: timestamp.trim(),
                callDescription: callDesc,
                truckStatus: truckStatus
            });
        }
    });

    return items;
}

function displayData(decodedData) {
    const output = document.getElementById("output");
    output.innerHTML = ""; // Clear existing content

    decodedData.forEach((item) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <strong>Code:</strong> ${item.code}<br>
            <strong>Timestamp:</strong> ${item.timestamp}<br>
            <strong>Call Description:</strong> ${item.callDescription}<br>
            <strong>Truck Status:</strong> ${item.truckStatus}<br>
            <hr>
        `;
        output.appendChild(div);
    });
}

setInterval(processRSSFeed, 5000); // Refresh every 5 seconds
processRSSFeed(); // Initial load