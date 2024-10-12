document.addEventListener('DOMContentLoaded', function() {
  const summarizeButton = document.getElementById('summarize');
  if (summarizeButton) {
    summarizeButton.addEventListener('click', function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "summarize"}, function(response) {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            updateSummary("Error: " + chrome.runtime.lastError.message);
          } else if (response && response.content) {
            fetchSummary(response.content);
          } else if (response && response.error) {
            console.error("Content script error:", response.error);
            updateSummary("Error: " + response.error);
          } else {
            console.error("Unexpected response:", response);
            updateSummary("Error: Unexpected response from content script");
          }
        });
      });
    });
  } else {
    console.error("Summarize button not found");
  }
});

function fetchSummary(content) {
  const apiKey = 'apikey';
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: "You are a helpful assistant that summarizes web content."},
        {role: "user", content: `Summarize the following webpage content: ${content}`}
      ]
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (data.choices && data.choices[0] && data.choices[0].message) {
      updateSummary(data.choices[0].message.content);
    } else {
      console.error("Unexpected API response structure:", data);
      updateSummary("Error: Unexpected API response");
    }
  })
  .catch(error => {
    console.error('Fetch error:', error);
    updateSummary(`Error fetching summary: ${error.message}`);
  });
}

function updateSummary(text) {
  const summaryElement = document.getElementById('summary');
  if (summaryElement) {
    summaryElement.textContent = text;
  } else {
    console.error("Summary element not found");
  }
}