let settings = {
  hideStories: false,
  hideFeed: false,
  hideSuggested: false,
  quotesMode: false,
};

const quotesBank = [
  {
    quote: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius"
  },
  {
    quote: "We suffer more often in imagination than in reality.",
    author: "Seneca"
  },
  {
    quote: "No man is free who is not master of himself.",
    author: "Epictetus"
  },
  {
    quote: "He who has a why to live can bear almost any how.",
    author: "Friedrich Nietzsche"
  },
  {
    quote: "Attention is the rarest and purest form of generosity.",
    author: "Simone Weil"
  },
  {
    quote: "The energy of the mind is the essence of life.",
    author: "Aristotle"
  },
  {
    quote: "Beware the barrenness of a busy life.",
    author: "Socrates"
  },
  {
    quote: "Life is available only in the present moment.",
    author: "Thich Nhat Hanh"
  },
  {
    quote: "To be aware of a single shortcoming in oneself is more useful than to be aware of a thousand in someone else.",
    author: "Dalai Lama"
  },
  {
    quote: "Waste no more time arguing about what a good man should be. Be one.",
    author: "Marcus Aurelius"
  },
  {
    quote: "The soul becomes dyed with the color of its thoughts.",
    author: "Marcus Aurelius"
  },
  {
    quote: "It is not that we have a short time to live, but that we waste a lot of it.",
    author: "Seneca"
  },
  {
    quote: "An unexamined life is not worth living.",
    author: "Socrates"
  },
  {
    quote: "The mind is everything. What you think you become.",
    author: "Buddha"
  },
  {
    quote: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Will Durant"
  }
];

let currentQuote = null;
let previousQuotesMode = false;

function getRandomQuote() {
  const index = Math.floor(Math.random() * quotesBank.length);
  return quotesBank[index];
}

function refreshQuote() {
  currentQuote = getRandomQuote();
}

function isHomePage() {
  return window.location.pathname === "/";
}

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
  const turnedQuotesOn = settings.quotesMode && !previousQuotesMode;

  if (turnedQuotesOn || currentQuote === null) {
    refreshQuote();
  }

  previousQuotesMode = settings.quotesMode;

  // Only run features on homepage
  if (!isHomePage()) {
    showStories();
    showFeed();
    showStoryArrows();
    showSuggested();
    removeQuotesContainer();
    return;
  }

  if (settings.hideStories) {
    hideStories();
    hideStoryArrows();
    hideStoryMenuItems();
  } else {
    showStories();
    showStoryArrows();
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
    showQuotesInFeed();
  } else {
    removeQuotesContainer();
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

function showStoryArrows() {
  const leftBtn = document.querySelector('button[aria-label="Go back"]');
  const rightBtn = document.querySelector('button[aria-label="Next"]');

  if (leftBtn) leftBtn.style.display = "";
  if (rightBtn) rightBtn.style.display = "";
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
  if (document.getElementById("clarity-hide-feed")) return;

  const style = document.createElement("style");
  style.id = "clarity-hide-feed";
  style.innerHTML = `
    article {
      display: none !important;
    }

    [role="progressbar"] {
      display: none !important;
    }
  `;

  document.head.appendChild(style);
}

function showFeed() {
  const style = document.getElementById("clarity-hide-feed");
  if (style) {
    style.remove();
  }
}

// =========================
// SUGGESTED POSTS
// =========================

function hideSuggested() {
  const spans = document.querySelectorAll("span");

  spans.forEach((span) => {
    if (span.textContent.trim() === "Suggested for you") {
      let container = span.closest("div");

      for (let i = 0; i < 2; i++) {
        if (!container) break;
        container = container.parentElement;
      }

      if (container) {
        container.style.display = "none";
      }
    }
  });
}

function showSuggested() {
  const spans = document.querySelectorAll("span");

  spans.forEach((span) => {
    if (span.textContent.trim() === "Suggested for you") {
      let container = span.closest("div");

      for (let i = 0; i < 2; i++) {
        if (!container) break;
        container = container.parentElement;
      }

      if (container) {
        container.style.display = "";
      }
    }
  });
}

// =========================
// QUOTES MODE (IN FEED)
// =========================

function getFeedParent() {
  const firstArticle = document.querySelector("article");
  if (firstArticle && firstArticle.parentElement) {
    return firstArticle.parentElement;
  }
  const main = document.querySelector("main");
  if (main) return main;
  return document.body;
}

function showQuotesInFeed() {
  if (!currentQuote) {
    refreshQuote();
  }

  let container = document.getElementById("ig-quotes-feed-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "ig-quotes-feed-container";

    Object.assign(container.style, {
      margin: "24px auto",
      padding: "32px 24px",
      maxWidth: "470px",
      width: "100%",
      boxSizing: "border-box",
      backgroundColor: "var(--ig-secondary-background, #121212)",
      border: "1px solid var(--ig-elevated-separator, #262626)",
      borderRadius: "12px",
      textAlign: "center",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    });

    const quoteEl = document.createElement("p");
    quoteEl.id = "ig-quote-text";
    Object.assign(quoteEl.style, {
      margin: "0 0 16px 0",
      fontSize: "18px",
      lineHeight: "1.6",
      fontWeight: "400",
      fontStyle: "italic",
      color: "var(--ig-primary-text, #f5f5f5)",
    });

    const authorEl = document.createElement("p");
    authorEl.id = "ig-quote-author";
    Object.assign(authorEl.style, {
      margin: "0",
      fontSize: "14px",
      fontWeight: "600",
      letterSpacing: "0.5px",
      color: "var(--ig-secondary-text, #a8a8a8)",
    });

    container.appendChild(quoteEl);
    container.appendChild(authorEl);

    const targetParent = getFeedParent();
    targetParent.prepend(container);
  }

  const quoteEl = document.getElementById("ig-quote-text");
  const authorEl = document.getElementById("ig-quote-author");

  if (quoteEl) quoteEl.innerText = `"${currentQuote.quote}"`;
  if (authorEl) authorEl.innerText = `~ ${currentQuote.author}`;
}

function removeQuotesContainer() {
  const el = document.getElementById("ig-quotes-feed-container");
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

let lastUrl = location.href;

const urlObserver = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    scheduleApply();
  }
});

urlObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});