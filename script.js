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

        const decodedData = decodeRSSFeed(rssText, allCallsData, fireTruckData);
        displayData(decodedData);
    } catch (error) {
        console.error("Error processing RSS feed:", error.message);
    }
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
        const timestamp = entry.querySelector("updated")?.textContent || "Unknown";

        const truckCode = title.substring(0, 6);
        const statusCode = title.substring(6);

        const truckMatch = allCallsLines.find(line => line.startsWith(truckCode));
        const statusMatch = fireTruckLines.find(line => line.startsWith(statusCode));

        if (truckMatch && statusMatch) {
            const truckName = truckMatch.split(",")[1];
            const status = statusMatch.split(",")[1];

            items.push({ truck: truckName, status, timestamp });
        }
    });

    return items;
}

function displayData(decodedData) {
    const container = document.getElementById("outputContainer");
    container.innerHTML = ''; // Clear previous output

    decodedData.forEach(decodedLine => {
        const element = document.createElement('div');
        element.textContent = `${decodedLine.truck} - ${decodedLine.status} - ${decodedLine.timestamp}`;

        // Set background color based on status
        if (decodedLine.status === 'Priority') {
            element.style.backgroundColor = 'red';
        } else if (decodedLine.status === 'Routine') {
            element.style.backgroundColor = 'green';
        } else {
            element.style.backgroundColor = 'yellow';
        }

        container.appendChild(element);
    });
}

// Periodically fetch updates
setInterval(processRSSFeed, 2000); // Check for updates every 5 seconds
processRSSFeed(); // Initial fetch