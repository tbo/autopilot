const {tabs, commands} = chrome;
const {executeScript, get, query, update, onActivated} = tabs;

const selectActiveTab = callback => query({active: true, currentWindow: true}, ([activeTab]) => callback(activeTab));

const switchTab = distance => selectActiveTab(activeTabs => {
    query({currentWindow: true}, tabs => {
        const targetIndex = (activeTabs.index + distance) % tabs.length;
        chrome.tabs.highlight({tabs: targetIndex >= 0 ? targetIndex : tabs.length - 1});
    });
});

const rearrangeTab = tabId => () => tabs.move(tabId, {index: -1});

const executeCode = code => selectActiveTab(({tabId}) => executeScript(tabId, {code})); 

let rearrangeReference = null;

onActivated.addListener(({tabId}) => {
    get(tabId, ({pinned}) => {
        clearTimeout(rearrangeReference);
        if (!pinned) {
            rearrangeReference = setTimeout(rearrangeTab(tabId), 1000);
        }
    })
});

commands.onCommand.addListener(command => {
    switch(command) {
        case "switch-to-next-tab": switchTab(1); break;
        case "switch-to-previous-tab": switchTab(-1); break;
        case "history-back": executeCode('history.back();'); break;
        case "history-forward": executeCode('history.forward();'); break;
    }
});
