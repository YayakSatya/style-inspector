chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    toggleInspector(tab.id);
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle_inspector') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        toggleInspector(tabs[0].id);
      }
    });
  }
});

function toggleInspector(tabId) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      if (window.__STYLE_INSPECTOR__) {
        window.__STYLE_INSPECTOR__.toggle();
      } else {
        return false;
      }
      return true;
    }
  }).then((results) => {
    const isLoaded = results && results[0] && results[0].result;
    if (!isLoaded) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['style-inspector.js']
      }).then(() => {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            if (window.__STYLE_INSPECTOR__) {
              window.__STYLE_INSPECTOR__.enable();
            }
          }
        });
      });
    }
  });
}