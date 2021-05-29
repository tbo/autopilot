const { tabs, commands, tabGroups } = chrome;
const { executeScript, get, update, onActivated, query } = tabs;

const selectActiveTab = () => query({ active: true, currentWindow: true });

const switchTab = async (distance) => {
  const tabs = await query({ currentWindow: true });
  const [activeTab] = tabs.filter(({ active }) => active);
  const groupCache = {};
  const getGroup = async (id) =>
    groupCache[id] || (groupCache[id] = await tabGroups.get(targetTab.groupId));
  let targetTab;
  let step = 0;
  do {
    step += distance > 0 ? 1 : -1;
    const targetIndex = (activeTab.index + step) % tabs.length;
    const index = targetIndex >= 0 ? targetIndex : tabs.length - 1;
    targetTab = tabs[index];
  } while (
    targetTab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE &&
    (await getGroup(targetTab.groupId)).collapsed
  );
  chrome.tabs.highlight({
    tabs: targetTab.index,
  });
};

const executeCode = async (code) => {
  const { tabId } = await selectActiveTab();
  executeScript(tabId, { code });
};

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
