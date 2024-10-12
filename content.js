chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "summarize") {
    try {
      const pageContent = document.body.innerText;
      if (pageContent && pageContent.trim().length > 0) {
        sendResponse({content: pageContent});
      } else {
        console.error("Page content is empty");
        sendResponse({error: "Page content is empty"});
      }
    } catch (error) {
      console.error("Error extracting page content:", error);
      sendResponse({error: "Error extracting page content"});
    }
  }
  return true;  
});

console.log("Content script loaded");