let hoverDiv = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "showDefinitions") {
    showDefinitions(request.word, request.definitions);
  }
});

function showDefinitions(word, definitions) {
  if (!hoverDiv) {
    hoverDiv = document.createElement('div');
    hoverDiv.style.cssText = `
      position: fixed;
      background-color: white;
      border: 1px solid black;
      padding: 10px;
      z-index: 1000;
      max-width: 300px;
      max-height: 300px;
      overflow-y: auto;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;
    document.body.appendChild(hoverDiv);
  }
  
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  let content = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                   <strong style="font-size: 1.2em;">${word}</strong>
                   <button id="closeDefDiv" style="background: none; border: none; font-size: 1.2em; cursor: pointer;">×</button>
                 </div>`;
  
  definitions.forEach((def, index) => {
    content += `<p${index > 0 ? ' style="border-top: 1px solid #ccc; padding-top: 10px;"' : ''}>`;
    if (def.partOfSpeech) {
      content += `<em>${def.partOfSpeech}</em>: `;
    }
    content += `${def.definition}</p>`;
  });
  
  hoverDiv.innerHTML = content;
  hoverDiv.style.left = `${rect.left + window.scrollX}px`;
  hoverDiv.style.top = `${rect.bottom + window.scrollY}px`;
  hoverDiv.style.display = 'block';
  
  document.getElementById('closeDefDiv').addEventListener('click', () => {
    hoverDiv.style.display = 'none';
  });
}

document.addEventListener('mousedown', (e) => {
  if (hoverDiv && e.target !== hoverDiv && !hoverDiv.contains(e.target)) {
    hoverDiv.style.display = 'none';
  }
});