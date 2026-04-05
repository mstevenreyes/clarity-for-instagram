const toggle = document.getElementById("toggleSwitch");

// Load state
chrome.storage.sync.get(["enabled"], (result) => {
  const isEnabled = result.enabled ?? true;
  toggle.checked = isEnabled;
});

// When user toggles
toggle.addEventListener("change", async () => {
  const newState = toggle.checked;

  chrome.storage.sync.set({ enabled: newState });

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  chrome.tabs.sendMessage(tab.id, {
    type: "TOGGLE",
    enabled: newState,
  });
});