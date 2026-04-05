let settings = {
  hideStories: false,
  hideFeed: false,
  hideSuggested: false,
  quotesMode: false,
};

// Load initial state
chrome.storage.sync.get(Object.keys(settings), (result) => {
  settings = { ...settings, ...result };
  scheduleApply();
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
  let updated = false;

  for (let key in changes) {
    if (settings.hasOwnProperty(key)) {
      settings[key] = changes[key].newValue;
      updated = true;
    }
  }

  if (updated) scheduleApply();
});

// Listen for popup messages
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "UPDATE_SETTINGS") {
    chrome.storage.sync.get(Object.keys(settings), (result) => {
      settings = { ...settings, ...result };
      scheduleApply();
    });
  }
});

// =========================
// MAIN APPLY FUNCTION
// =========================

function applyState() {
  if (settings.hideStories) {
    hideStories();
    hideStoryArrows();
    hideStoryMenuItems();
  } else {
    showStories();
  }

  if (settings.hideFeed) {
    hideFeed();
  } else {
    showFeed();
  }

  if (settings.hideSuggested) {
    hideSuggested();
  } else {
    showSuggested();
  }

  if (settings.quotesMode) {
    showQuotesPlaceholder();
  } else {
    removeQuotesPlaceholder();
  }
}

// =========================
// STORIES
// =========================

function getStoryContainer() {
  return document.querySelector("div[role='presentation']");
}

function hideStories() {
  const container = getStoryContainer();
  if (container) container.style.display = "none";
}

function showStories() {
  const container = getStoryContainer();
  if (container) container.style.display = "";
}

function hideStoryArrows() {
  const leftBtn = document.querySelector('button[aria-label="Go back"]');
  const rightBtn = document.querySelector('button[aria-label="Next"]');

  if (leftBtn) leftBtn.style.display = "none";
  if (rightBtn) rightBtn.style.display = "none";
}

// =========================
// STORY MENU ITEMS
// =========================

function hideStoryMenuItems() {
  const elements = document.querySelectorAll("div, span, button");

  elements.forEach((el) => {
    const text = (el.innerText || "").toLowerCase();

    if (
      text.includes("hide story") ||
      text.includes("mute") ||
      text.includes("report") ||
      text.includes("snooze")
    ) {
      el.style.display = "none";
    }
  });
}

// =========================
// FEED
// =========================

function hideFeed() {
  const feed = document.querySelector("main");
  if (feed) feed.style.opacity = 0;
}

function showFeed() {
  const feed = document.querySelector("main");
  if (feed) feed.style.opacity = 1;
}

// =========================
// SUGGESTED POSTS
// =========================

function hideSuggested() {
  const posts = document.querySelectorAll("article");

  posts.forEach((post) => {
    const text = post.innerText.toLowerCase();

    if (text.includes("suggested for you")) {
      post.style.display = "none";
    }
  });
}

function showSuggested() {
  const posts = document.querySelectorAll("article");

  posts.forEach((post) => {
    const text = post.innerText.toLowerCase();

    if (text.includes("suggested for you")) {
      post.style.display = "";
    }
  });
}

// =========================
// QUOTES MODE (PLACEHOLDER)
// =========================

function showQuotesPlaceholder() {
  if (document.getElementById("ig-quotes")) return;

  const div = document.createElement("div");
  div.id = "ig-quotes";
  div.innerText = "Stay focused. Build something meaningful.";

  Object.assign(div.style, {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#222",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    zIndex: "999999",
  });

  document.body.appendChild(div);
}

function removeQuotesPlaceholder() {
  const el = document.getElementById("ig-quotes");
  if (el) el.remove();
}

// =========================
// PERFORMANCE
// =========================

let scheduled = false;

function scheduleApply() {
  if (scheduled) return;

  scheduled = true;

  requestAnimationFrame(() => {
    applyState();
    scheduled = false;
  });
}

// =========================
// OBSERVER
// =========================

const observer = new MutationObserver(() => {
  scheduleApply();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
