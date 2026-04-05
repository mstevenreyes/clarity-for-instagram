let enabled = true;

// Load initial state
chrome.storage.sync.get(["enabled"], (result) => {
  enabled = result.enabled ?? true;
  scheduleApply();
});

// Listen for storage changes (live sync across tabs)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) {
    enabled = changes.enabled.newValue;
    scheduleApply();
  }
});

// Listen for popup toggle messages
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "TOGGLE") {
    enabled = msg.enabled;
    scheduleApply();
  }
});

// Get main story container
function getStoryContainer() {
  return document.querySelector("div[role='presentation']");
}



// Main logic handler
function applyState() {
  const container = getStoryContainer();

  // Hide / show story modal
  if (container) {
    container.style.display = enabled ? "none" : "";
  }

  // Hide / show navigation arrows (IG uses buttons with SVG icons)
  document.querySelectorAll("button").forEach((btn) => {
    const svg = btn.querySelector("svg");
    if (!svg) return;

    const rect = btn.getBoundingClientRect();

    const isSmallCircle =
      rect.width <= 60 &&
      rect.height <= 60;

    if (isSmallCircle) {
      btn.style.display = enabled ? "none" : "";
    }
  });

  // Hide "Hide story", "Mute", etc. menu items
   hideStoryArrows();      // ✅ clean + stable
  hideStoryMenuItems();   // keep your existing function
}

// Handles menu items inside story UI
function hideStoryMenuItems() {
  const elements = document.querySelectorAll("div, span, button");

  elements.forEach((el) => {
    const text = (el.innerText || "").toLowerCase();

    if (!text) return;

    if (
      text.includes("hide story") ||
      text.includes("mute") ||
      text.includes("report") ||
      text.includes("snooze")
    ) {
      el.style.display = enabled ? "none" : "";
    }
  });
}

function hideStoryArrows() {
  const leftBtn = document.querySelector('button[aria-label="Go back"]');
  const rightBtn = document.querySelector('button[aria-label="Next"]');

  if (leftBtn) {
    leftBtn.style.display = enabled ? "none" : "";
  }

  if (rightBtn) {
    rightBtn.style.display = enabled ? "none" : "";
  }
}

// Throttle applyState to avoid excessive re-renders
let scheduled = false;

function scheduleApply() {
  if (scheduled) return;

  scheduled = true;

  requestAnimationFrame(() => {
    applyState();
    scheduled = false;
  });
}

// Watch Instagram DOM changes
const observer = new MutationObserver(() => {
  scheduleApply();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});