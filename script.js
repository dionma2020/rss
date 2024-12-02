const rssFeedUrl = "https://cdn.jsdelivr.net/gh/DIONMA2020/RSS/feed.xml";

async function fetchAndDisplayRSS() {
    try {
        const response = await fetch(rssFeedUrl);
        const rssText = await response.text();
        document.getElementById("output").textContent = rssText; // Display raw content
    } catch (error) {
        console.error("Error fetching RSS feed:", error);
        document.getElementById("output").textContent = "Failed to fetch RSS feed.";
    }
}

fetchAndDisplayRSS();
