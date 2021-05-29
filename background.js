const { tabs, commands } = chrome;
const { executeScript, get, query, update, onActivated } = tabs;

const selectActiveTab = (callback) =>
  query({ active: true, currentWindow: true }, ([activeTab]) =>
    callback(activeTab)
  );

let isStatefulNavigationActive = false;
const switchTab = (distance) =>
  query({ currentWindow: true }, (tabs) => {
    const [activeTab] = tabs.filter(({ active }) => active);
    const targetIndex = (activeTab.index + distance) % tabs.length;
    chrome.tabs.highlight({
      tabs: targetIndex >= 0 ? targetIndex : tabs.length - 1,
    });
    isStatefulNavigationActive = true;
  });

const executeCode = (code) =>
  selectActiveTab(({ tabId }) => executeScript(tabId, { code }));

commands.onCommand.addListener((command) => {
  switch (command) {
    case "switch-to-next-tab":
      switchTab(1);
      break;
    case "switch-to-previous-tab":
      switchTab(-1);
      break;
    case "history-back":
      executeCode("history.back();");
      break;
    case "history-forward":
      executeCode("history.forward();");
      break;
  }
});
