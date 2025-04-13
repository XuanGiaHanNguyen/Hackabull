// Add this to your background.js
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
});