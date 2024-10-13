let hoverDiv = null;
let previewDiv;
let iframe;
let hoverTimeout;
let isDragging = false;
let offsetX = 0, offsetY = 0;
let currentX;
let currentY;
let initialX;
let initialY;

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

document.addEventListener("mouseover", (event) => {
  const target = event.target;

  if (target.tagName === "A" && target.href) {
    // Set a delay before showing the preview
    hoverTimeout = setTimeout(() => {
      if (previewDiv) {
        previewDiv.remove();
      }

      // Create the preview div
      previewDiv = document.createElement("div");
      previewDiv.style.position = "absolute";
      previewDiv.style.border = "1px solid #ddd";
      previewDiv.style.backgroundColor = "#fff";
      previewDiv.style.width = "300px";
      previewDiv.style.height = "200px";
      previewDiv.style.overflow = "hidden";
      previewDiv.style.zIndex = "10000";
      previewDiv.style.boxShadow = "0px 0px 6px rgba(0,0,0,0.1)";
      previewDiv.style.borderRadius = "4px";
      previewDiv.style.resize = "both";
      previewDiv.style.padding = "20px 10px 10px 10px";
      previewDiv.style.boxSizing = "border-box";
      previewDiv.style.cursor = "move"; 

      // Position the preview div near the link
      const rect = target.getBoundingClientRect();
      previewDiv.style.top = `${window.scrollY + rect.bottom}px`;
      previewDiv.style.left = `${window.scrollX + rect.left}px`;

      // Create the iframe for the preview
      iframe = document.createElement("iframe");
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "none";
      iframe.src = target.href;

      // Closes the preview Window
      const closeButton = document.createElement("button");
      closeButton.innerText = "X";
      closeButton.style.position = "absolute";
      closeButton.style.top = "5px";
      closeButton.style.right = "5px";
      closeButton.style.background = "#f44336";
      closeButton.style.color = "#fff";
      closeButton.style.border = "none";
      closeButton.style.borderRadius = "3px";
      closeButton.style.padding = "2px 6px";
      closeButton.style.cursor = "pointer";
      closeButton.addEventListener("click", () => {
        if (previewDiv) {
          previewDiv.remove();
        }
      });

      const buttonContainer = document.createElement("div");
      buttonContainer.style.position = "absolute";
      buttonContainer.style.top = "5px";
      buttonContainer.style.left = "5px";
      buttonContainer.style.display = "flex";
      buttonContainer.style.gap = "5px"; // Adds space between buttons


      // Launches the website on the preview Window on a new tab
      const newTabButton = document.createElement("button");
      newTabButton.innerText = "Open in New Tab";
      newTabButton.style.position = "absolute";
      newTabButton.style.top = "5px";
      newTabButton.style.left = "5px";
      newTabButton.style.background = "#4CAF50";
      newTabButton.style.color = "#fff";
      newTabButton.style.border = "none";
      newTabButton.style.borderRadius = "3px";
      newTabButton.style.padding = "2px 6px";
      newTabButton.style.cursor = "pointer";
      newTabButton.addEventListener("click", () => {
        window.open(target.href, "_blank");
      });

        // For dragging the previewDiv over the website
      const moveButton = document.createElement("button");
      moveButton.innerText = "Move Preview Container";
      moveButton.style.top = "5px";
      moveButton.style.background = "#2196F3";
      moveButton.style.color = "#fff";
      moveButton.style.border = "none";
      moveButton.style.borderRadius = "3px";
      moveButton.style.padding = "2px 6px";
      moveButton.style.cursor = "move";
      

      buttonContainer.appendChild(moveButton);
      buttonContainer.appendChild(newTabButton);

      // Append the buttons and iframe to the preview div
      previewDiv.appendChild(buttonContainer);
      previewDiv.appendChild(closeButton);
      previewDiv.appendChild(newTabButton);
      previewDiv.appendChild(moveButton);
      previewDiv.appendChild(iframe);
      document.body.appendChild(previewDiv);

    moveButton.addEventListener("mousedown", dragStart)
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);

    function dragStart(e) {
        if (e.target === moveButton) {
            initialX = e.clientX - offsetX;
            initialY = e.clientY - offsetY;
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            offsetX = currentX;
            offsetY = currentY;
            setTranslate(currentX, currentY, previewDiv);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
    }

    function setTranslate(xPos, yPos, previewDiv) {
        previewDiv.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    }, 500); // 500ms delay before showing the preview
  }
});

document.addEventListener("mouseout", (event) => {
  clearTimeout(hoverTimeout);
});

function moveDiv(e) {
  if (isDragging) {
    previewDiv.style.left = `${e.clientX - offsetX}px`;
    previewDiv.style.top = `${e.clientY - offsetY}px`;
  }
}

function stopDrag() {
  isDragging = false;
  document.removeEventListener("mousemove", moveDiv);
  document.removeEventListener("mouseup", stopDrag);
}