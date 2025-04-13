// background.js - Handles messaging between content script and popup/JSX components

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "TAKE_SCREENSHOT" && sender.tab) {
    console.log("Taking screenshot for tab:", sender.tab.id, "position:", message.data.scrollPosition);

    // Take the actual screenshot
    chrome.tabs.captureVisibleTab(
      null, // current window
      { format: "jpeg", quality: 85 },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error(`Error capturing screenshot: ${chrome.runtime.lastError.message}`);
          return;
        }

        // Create screenshot object with the data URL
        const screenshot = {
          dataUrl: dataUrl,
          captureNumber: message.data.captureNumber,
          scrollPosition: message.data.scrollPosition,
          timestamp: message.data.timestamp
        };

        // Download the screenshot
        downloadScreenshot(screenshot);
      }
    );
    return true;
  }

  // NEW: Handle carbon footprint data requests from content script
  if (message.action === "GET_CARBON_FOOTPRINT") {
    console.log("Getting carbon footprint data for:", message.data.productId);

    // This will communicate with your JSX components/popup
    getCarbonFootprintFromJSX(message.data, (footprintData) => {
      sendResponse({
        success: true,
        data: footprintData
      });
    });

    return true; // Keep the message channel open for the async response
  }
});

// Function to download a screenshot
function downloadScreenshot(screenshot) {
  const filename = `screenshot_${screenshot.captureNumber}_${new Date().getTime()}.jpg`;

  // Create a download
  chrome.downloads.download({
    url: screenshot.dataUrl,
    filename: filename,
    saveAs: false
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      console.error(`Error saving screenshot: ${chrome.runtime.lastError.message}`);
    } else {
      console.log(`Screenshot ${screenshot.captureNumber} downloaded successfully with ID: ${downloadId}`);
    }
  });
}
// Function to get carbon footprint data from JSX components
function getCarbonFootprintFromJSX(productData, callback) {
  // In a real extension, this might involve communicating with a popup or background page
  // that contains your React/JSX components

  // For this example, we'll simulate the JSX response
  console.log("Requesting carbon footprint data from JSX components");

  // Simulate async communication with JSX components
  setTimeout(() => {
    // This simulates the response from your JSX component
    // In a real extension, this data would come from your React components
    const mockJSXResponse = {
      level: 'high', // This would come from your JSX component
      confidence: 0.95,
      source: 'carbon-api'
    };

    // Pass the data back to the content script
    callback(mockJSXResponse);

    // Also notify any open popups about this data
    chrome.runtime.sendMessage({
      action: "CARBON_DATA_UPDATED",
      data: {
        productId: productData.productId,
        footprint: mockJSXResponse
      }
    });
  }, 300);
}