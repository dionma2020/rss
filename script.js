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
    const allCallsLines = allCallsData.split("\n");
    const fireTruckLines = fireTruckData.split("\n");

    const rawLines = rssText.match(/<channel>([\s\S]*?)<\/channel>/)?.[1].trim().split("\n") || [];
    console.log("Raw RSS Lines:", rawLines);

    rawLines.forEach((line) => {
        const [selcall, timestamp] = line.split(",");
        if (selcall && timestamp) {
            console.log(`Processing selcall: "${selcall}" with timestamp: "${timestamp}"`);

            const callInfo = decodeCallInfo(selcall, allCallsLines);
            const fireTruckStatus = decodeFireTruckStatus(selcall, fireTruckLines);

            items.push({
                selcall: selcall.trim(),
                timestamp: timestamp.trim(),
                callInfo: callInfo,
                fireTruckStatus: fireTruckStatus,
            });
        }
    });

    return items;
}

function displayData(decodedData) {
    const output = document.getElementById("output");
    output.innerHTML = ""; // Clear previous data

    decodedData.forEach(({ selcall, timestamp, callInfo, fireTruckStatus }) => {
        const entry = document.createElement("div");
        entry.innerHTML = `
            <p><strong>Selcall:</strong> ${selcall}</p>
            <p><strong>Timestamp:</strong> ${timestamp}</p>
            <p><strong>Call Info:</strong> ${callInfo}</p>
            <p><strong>Fire Truck Status:</strong> ${fireTruckStatus}</p>
            <hr>
        `;
        output.appendChild(entry);
    });
}

setInterval(processRSSFeed, 5000); // Refresh every 5 seconds
processRSSFeed(); // Initial load