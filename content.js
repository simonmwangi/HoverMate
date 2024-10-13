let hoverDiv = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showDefinition") {
    showDefinition(request.word, request.definition);
  }
});

function showDefinition(word, definition) {
  if (!hoverDiv) {
    hoverDiv = document.createElement('div');
    hoverDiv.style.cssText = `
      position: fixed;
      background-color: white;
      border: 1px solid black;
      padding: 10px;
      z-index: 1000;
      max-width: 300px;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(hoverDiv);
  }
  
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  hoverDiv.innerHTML = `<strong>${word}</strong>: ${definition}`;
  hoverDiv.style.left = `${rect.left + window.scrollX}px`;
  hoverDiv.style.top = `${rect.bottom + window.scrollY}px`;
  hoverDiv.style.display = 'block';
}

document.addEventListener('mousedown', (e) => {
  if (hoverDiv && e.target !== hoverDiv && !hoverDiv.contains(e.target)) {
    hoverDiv.style.display = 'none';
  }
});