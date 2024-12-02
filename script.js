const rssFeedUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/feed.xml";
const allCallsFileUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/allcalls.dat";
const fireTruckFileUrl = "https://raw.githubusercontent.com/DIONMA2020/RSS/main/FireTruckStatus.dat";

// Fetch and process the RSS feed
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

        // Decode the data
        const decodedData = decodeRSSFeed(rssText, allCallsData, fireTruckData);

        // Display the decoded data
        displayData(decodedData);
    } catch (error) {
        console.error("Error processing RSS feed:", error);
    }
}

// Decode RSS feed entries
function decodeRSSFeed(rssText, allCallsData, fireTruckData) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(rssText, "text/xml");
    const entries = xmlDoc.querySelectorAll("entry");

    const allCallsLines = allCallsData.split("\n");
    const fireTruckLines = fireTruckData.split("\n");

    const decodedEntries = Array.from(entries).map((entry) => {
        const content = entry.querySelector("content").textContent;

        const callInfo = decodeCallInfo(content, allCallsLines);
        const fireTruckStatus = decodeFireTruckStatus(content, fireTruckLines);

        return { title: entry.querySelector("title").textContent, callInfo, fireTruckStatus };
    });

    return decodedEntries;
}

// Decode call information
function decodeCallInfo(line, allCallsLines) {
    const startIndex = line.indexOf("C");
    if (startIndex !== -1) {
        const endIndex = line.indexOf("F", startIndex);
        if (endIndex !== -1) {
            const callNumber = line.slice(startIndex, endIndex + 1);
            for (const callLine of allCallsLines) {
                if (callLine.includes(callNumber)) {
                    return callLine.split(",")[1]?.trim();
                }
            }
        }
    }
    return "Unknown Call Info";
}

// Decode firetruck status
function decodeFireTruckStatus(line, fireTruckLines) {
    const startIndex = line.indexOf("F");
    if (startIndex !== -1) {
        const endIndex = line.indexOf("C", startIndex);
        if (endIndex !== -1) {
            const truckNumber = line.slice(startIndex + 1, endIndex + 1);
            for (const truckLine of fireTruckLines) {
                if (truckLine.includes(truckNumber)) {
                    return truckLine.split(",")[1]?.trim();
                }
            }
        }
    }
    return "Unknown Firetruck Status";
}

// Display decoded data
function displayData(data) {
    const outputDiv = document.getElementById("output");
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

// Initialize the app
processRSSFeed();
