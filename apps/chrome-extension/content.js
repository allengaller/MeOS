// MeOS Chrome Extension Content Script

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_MEOS') {
    chrome.runtime.sendMessage({ type: 'GET_EXTENSION_ID' }, (response) => {
      if (response && response.extensionId) {
        chrome.tabs.create({
          url: chrome.runtime.getURL('index.html'),
        });
      }
    });
  }
  return true;
});
