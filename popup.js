const toggles = ["hideStories", "hideFeed", "hideSuggested", "quotesMode"];

// =========================
// LOAD INITIAL STATE
// =========================

chrome.storage.sync.get(toggles, (result) => {
  toggles.forEach((key) => {
    const el = document.getElementById(key);
    if (!el) return;

    el.checked = result[key] ?? false;
  });
});

// =========================
// HANDLE TOGGLE CHANGES
// =========================

toggles.forEach((key) => {
  const el = document.getElementById(key);
  if (!el) return;

  el.addEventListener("change", async () => {
    const value = el.checked;

    // Save to storage
    chrome.storage.sync.set({
      [key]: value,
    });
    // Notify content script
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) return;
    chrome.tabs.sendMessage(tab.id, {
      type: "UPDATE_SETTINGS",
    });
  });
});
