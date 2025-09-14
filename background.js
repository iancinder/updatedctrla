chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab?.id) return;

    if (command === "select-article") {
      chrome.tabs.sendMessage(tab.id, { action: "select-article-readability" });
    } else if (command === "select-sentence") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: selectCurrentSentence
      });
    }
  });
});

// leave selectCurrentSentence() as-is here

chrome.commands.onCommand.addListener((command) => {
  console.log("COMMAND RECEIVED:", command); // ✅ This should always appear
});


function selectCurrentSentence() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const startNode = range.startContainer;

  // Find the nearest block container (e.g. <p>, <div>)
  let container = startNode;
  while (container && !/^(P|DIV|ARTICLE|SECTION)$/i.test(container.nodeName)) {
    container = container.parentNode;
  }
  if (!container) return;

  // Flatten all text nodes in the block
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
  const textNodes = [];
  let totalText = "";
  let offsetMap = [];

  let node;
  while ((node = walker.nextNode())) {
    offsetMap.push({ node, start: totalText.length });
    totalText += node.textContent;
    textNodes.push(node);
  }

  // Map cursor to combined offset
  let cursorOffset = null;
  for (const { node, start } of offsetMap) {
    if (node === range.startContainer) {
      cursorOffset = start + range.startOffset;
      break;
    }
  }
  if (cursorOffset == null) return;

  // Find sentence boundaries using regex
  const sentenceRegex = /(?<!\b(?:Mr|Mrs|Ms|Dr|U\.S|e\.g|i\.e|vs)\.)(?<=\.|\?|!)(?:\s+|$)/gi;
  let sentenceStart = 0;
  let sentenceEnd = totalText.length;
  let match;
  let lastEnd = 0;

  while ((match = sentenceRegex.exec(totalText)) !== null) {
    if (cursorOffset <= match.index + match[0].length) {
      sentenceEnd = match.index + match[0].length;
      break;
    }
    lastEnd = match.index + match[0].length;
  }
  sentenceStart = lastEnd;

  // Find corresponding DOM nodes and offsets
  const sentenceRange = document.createRange();
  let startSet = false;

  for (const { node, start } of offsetMap) {
    const end = start + node.textContent.length;

    if (!startSet && sentenceStart >= start && sentenceStart <= end) {
      sentenceRange.setStart(node, sentenceStart - start);
      startSet = true;
    }
    if (sentenceEnd >= start && sentenceEnd <= end) {
      sentenceRange.setEnd(node, sentenceEnd - start);
      break;
    }
  }

  if (startSet) {
    selection.removeAllRanges();
    selection.addRange(sentenceRange);
  }
}
