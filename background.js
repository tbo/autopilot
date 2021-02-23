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

const prependTab = (activeTab) => {
  if (!activeTab.pinned) {
    chrome.tabs.move(activeTab.id, { index: 0 });
  }
  isStatefulNavigationActive = false;
};

const prependActiveTab = () => selectActiveTab(prependTab);

const prependTabById = (id) =>
  !isStatefulNavigationActive && chrome.tabs.get(id, prependTab);

const executeCode = (code) =>
  selectActiveTab(({ tabId }) => executeScript(tabId, { code }));

// chrome.tabs.onHighlighted.addListener(({ tabIds }) =>
//   setTimeout(() => prependTabById(tabIds[0]), 350)
// );

// chrome.tabs.onActivated.addListener(({ tabId }) => prependTabById(tabId));

chrome.tabs.onCreated.addListener(({ id }) => prependTabById(id));

commands.onCommand.addListener((command) => {
  switch (command) {
    case "switch-to-next-tab":
      switchTab(1);
      break;
    case "switch-to-previous-tab":
      switchTab(-1);
      break;
    case "prepend-active-tab":
      prependActiveTab();
      break;
    case "history-back":
      executeCode("history.back();");
      break;
    case "history-forward":
      executeCode("history.forward();");
      break;
  }
});
