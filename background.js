// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "getDefinition",
      title: "Get definition of '%s'",
      contexts: ["selection"]
    });
  });
  
// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "getDefinition") {
    const selectedText = info.selectionText;
    fetchDefinition(selectedText, tab.id);
  }
});
  
function fetchDefinition(word, tabId) {
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(response => response.json())
    .then(data => {
      let definition;
      if (data && data[0] && data[0].meanings && data[0].meanings[0] && data[0].meanings[0].definitions) {
        definition = data[0].meanings[0].definitions[0].definition;
      } else {
        definition = "Definition not found.";
      }
      chrome.tabs.sendMessage(tabId, {action: "showDefinition", definition: definition, word: word});
    })
    .catch(error => {
      console.error('Error:', error);
      chrome.tabs.sendMessage(tabId, {action: "showDefinition", definition: "An error occurred while fetching the definition.", word: word});
    });
}