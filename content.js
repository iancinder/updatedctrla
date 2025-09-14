function injectAndSelectArticle() {
  const existing = document.getElementById("smart-ctrl-a-article");
  if (existing) {
    selectAndScrollTo(existing);
    return;
  }

  const doc = new Readability(document.cloneNode(true)).parse();
  if (!doc || !doc.content) {
    alert("Could not extract article content.");
    return;
  }

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = doc.content;

  // Remove unwanted elements
  const blacklistSelectors = [
    ".byline", ".author", ".date", ".tags", "figure", "time",
    "header", "footer", "aside", "nav", ".video", ".embed", ".media"
  ];
  blacklistSelectors.forEach(sel => {
    tempDiv.querySelectorAll(sel).forEach(el => el.remove());
  });

  // Remove paragraphs at the end that look like bios, tags, or unrelated extras
  const paragraphs = Array.from(tempDiv.querySelectorAll("p"));
  for (let i = paragraphs.length - 1; i >= 0; i--) {
    const p = paragraphs[i];
    const text = p.innerText.trim();
    if (
      text.length < 30 ||
      /^(By|Updated on|In:|Copyright|©)/i.test(text) ||
      /Melissa Quinn/i.test(text) ||
      /CBS News/i.test(text) ||
      /All Rights Reserved/i.test(text) ||
      text.split(" ").length < 6
    ) {
      p.remove();
    } else {
      break;
    }
  }

  // Remove generic junk phrases
  const garbagePatterns = [
    /Press (shift|enter) .* to .*/i,
    /Volume \d+%/i,
    /^0 seconds of/i,
    /^Read More$/i,
    /^Updated \d{1,2}:\d{2} (AM|PM)/i,
    /keyboard shortcuts/i,
    /\(AP (photo|video):/i,
    /This video is playing/i,
    /^(Watch|Listen|Play)\b/i
  ];

  tempDiv.querySelectorAll("p, div, span, h2").forEach(el => {
    const text = el.innerText.trim();
    if (garbagePatterns.some(pattern => pattern.test(text))) {
      el.remove();
    }
  });

  const container = document.createElement("div");
  container.id = "smart-ctrl-a-article";
  container.appendChild(tempDiv);

  container.style.position = "relative";
  container.style.padding = "1em";
  container.style.background = "#fdf7d4";
  container.style.border = "1px solid #ccc";
  container.style.margin = "2em auto";
  container.style.maxWidth = "700px";
  container.style.zIndex = 999999;
  container.style.boxShadow = "0 0 10px rgba(0,0,0,0.1)";

  document.body.appendChild(container);
  selectAndScrollTo(container);
}


chrome.runtime.onMessage.addListener((msg) => {
  console.log("Content script received:", msg); // ✅ This should follow immediately
});


function selectAndScrollTo(el) {
  const range = document.createRange();
  range.selectNodeContents(el);

  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  el.scrollIntoView({ behavior: "smooth", block: "center" });
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "select-article-readability") {
    injectAndSelectArticle();
  }
});
