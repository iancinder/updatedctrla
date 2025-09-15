# CTRL-A — Smart Select for Articles

Select only the actual article on a page — not the nav, sidebars, comments, or ads.
CTRL-A is a Manifest V3 Chrome extension that finds the main content on a webpage and selects it in one shot. Copy clean text, export to Markdown, be able to paste easier, etc.


How It Works

On demand, a content script runs when you trigger the extension.
The script parses the DOM and extracts the main article (Readability-style).
CTRL-A highlights the detected article region and creates a clean, linearized text version.
You can copy the cleaned content or export as Markdown.
Nothing leaves your browser; settings are stored with chrome.storage.local

Installation:
Link to chrome extension: https://chromewebstore.google.com/detail/smart-ctrl-a/jbfkjhlmfipgbadckhkjoeehcnjkkcjl?authuser=0&hl=en
Ctrl+Shift+U — Smart-select the main article content.
Alt+Shift+W — Sentence/paragraph select (selects text your cursor is hovering over)

Development (example layout):
extension/
├─ manifest.json
├─ background.js            # MV3 service worker
├─ content.js               # on-demand DOM extraction & selection
├─ popup.html
├─ popup.js
├─ styles.css
├─ vendor/
│  └─ readability.js
└─ img/
   ├─ icon128.png
   └─ screenshot-ctrl-a.png

Optional scripts:
npm i
npm run dev     # watch/build (if bundling)
npm run lint    # code style
npm run format  # prettier


Notes:
Uses Manifest V3 service worker (no persistent background page).
Content scripts run only when you invoke the extension or a command.

Troubleshooting:
Nothing is selected.
Some pages aren’t article-like (homepages, dashboards). Try Selection-only mode or right-click → Select Article on a specific element.

Hotkeys don’t work.
Assign them at chrome://extensions/shortcuts and avoid conflicts with system/global shortcuts.

Weird selection on dynamic sites.
Pages that hydrate late can shift content. Trigger CTRL-A after the page settles or reload and try again.

Doesn’t work on PDFs / Chrome pages.
Chrome internal pages and PDFs are restricted. Save as HTML or open the source article page.
