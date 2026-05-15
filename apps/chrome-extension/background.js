// MeOS Chrome Extension Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('MeOS Extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_EXTENSION_ID') {
    sendResponse({ extensionId: chrome.runtime.id });
  }
  return true;
});
