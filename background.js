chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "getDefinition",
      title: "HoverMate - Get definition of '%s'",
      contexts: ["selection"]
    });
  });
  
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "getDefinition") {
    const selectedText = info.selectionText;
    fetchDefinitions(selectedText, tab.id);
  }
});

function fetchDefinitions(word, tabId) {
  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then(response => response.json())
    .then(data => {
      let definitions = [];
      if (data && data[0] && data[0].meanings) {
        data[0].meanings.forEach(meaning => {
          meaning.definitions.forEach(def => {
            definitions.push({
              partOfSpeech: meaning.partOfSpeech,
              definition: def.definition
            });
          });
        });
      }
      if (definitions.length === 0) {
        definitions.push({ definition: "No definitions found." });
      }
      chrome.tabs.sendMessage(tabId, {action: "showDefinitions", definitions: definitions, word: word});
    })
    .catch(error => {
      console.error('Error:', error);
      chrome.tabs.sendMessage(tabId, {action: "showDefinitions", definitions: [{ definition: "An error occurred while fetching the definition." }], word: word});
    });
}