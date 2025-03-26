const AI_LIST = [
  {
    name: "Grok / xAI",
    url: "https://grok.com/",
    icon: "/assets/images/grok.svg",
  },
  {
    name: "Microsoft Copilot",
    url: "https://copilot.microsoft.com/",
    icon: "/assets/images/copilot.svg",
  },
  {
    name: "ChatGPT",
    url: "https://chat.openai.com/",
    icon: "/assets/images/chatgpt.svg",
  },
  {
    name: "Google Gemini",
    url: "https://gemini.google.com/app",
    icon: "/assets/images/gemini.svg",
  },
  {
    name: "Meta AI",
    url: "https://www.meta.ai/",
    icon: "/assets/images/meta.svg",
  },
  {
    name: "HuggingChat",
    url: "https://huggingface.co/chat/",
    icon: "/assets/images/hug.svg",
  },
  {
    name: "Anthropic Claude",
    url: "https://claude.ai/new",
    icon: "/assets/images/claude.svg",
  },
  {
    name: "Mistral AI",
    url: "https://chat.mistral.ai/chat",
    icon: "/assets/images/mistral.svg",
  },
  {
    name: "DeepSeek",
    url: "https://chat.deepseek.com",
    icon: "/assets/images/deepseek.svg",
  },
];

const SEARCH_ENGINES = [
  {
    name: "Google",
    url: "https://www.google.com/search?q=",
    image: "/assets/images/google.svg",
  },
  {
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
    image: "/assets/images/duckduckgo.svg",
  },
  {
    name: "Bing",
    url: "https://www.bing.com/search?q=",
    image: "/assets/images/bing.svg",
  },
  {
    name: "Yahoo",
    url: "https://search.yahoo.com/search?p=",
    image: "/assets/images/yahoo.svg",
  },
  {
    name: "Wikipedia",
    url: "https://en.wikipedia.org/w/index.php?search=",
    image: "/assets/images/wikipedia.svg",
  },
  {
    name: "Amazon",
    url: "https://www.amazon.com/s?k=",
    image: "/assets/images/amazon.svg",
  },
];

// Local storage functions
function getPinnedItems() {
  return JSON.parse(localStorage.getItem("pinnedItems")) || [];
}

function savePinnedItems(pinnedItems) {
  localStorage.setItem("pinnedItems", JSON.stringify(pinnedItems));
}

function getSelectedSearchEngine() {
  return localStorage.getItem("selectedSearchEngine") || "Google";
}

function saveSelectedSearchEngine(engineName) {
  localStorage.setItem("selectedSearchEngine", engineName);
}

// URL validation function
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    try {
      const urlWithProtocol = new URL(`https://${string}`);
      return urlWithProtocol.protocol === "https:";
    } catch (_) {
      return false;
    }
  }
}

function renderSidebar() {
  const aiList = document.getElementById("ai-elements");
  const quickAccessList = document.getElementById("quick-access");
  aiList.innerHTML = "";
  quickAccessList.innerHTML = "";

  const pinnedItems = getPinnedItems();

  pinnedItems.forEach((pinned) => {
    const ai = AI_LIST.find((item) => item.url === pinned.url);
    if (ai) quickAccessList.appendChild(createListItem(ai, true));
  });

  AI_LIST.forEach((ai) => {
    const isPinned = pinnedItems.some((pinned) => pinned.url === ai.url);
    aiList.appendChild(createListItem(ai, isPinned));
  });

  if (typeof browser !== "undefined") {
    browser.sidebarAction.setPanel({ panel: "sidebar.html" });
  }

  renderSearchEngineNavbar();
}

function createListItem(ai, isPinned) {
  const listItem = document.createElement("li");
  listItem.className = "ai-item";
  listItem.id = `ai-item-${AI_LIST.findIndex((item) => item.url === ai.url)}`;

  const link = document.createElement("a");
  link.href = ai.url;
  link.target = "_self";
  link.rel = "noopener noreferrer";

  const icon = document.createElement("img");
  icon.src = ai.icon;
  icon.alt = `${ai.name} icon`;
  icon.className = "ai-icon";

  const name = document.createElement("span");
  name.className = "ai-name";
  name.textContent = ai.name;

  const pin = document.createElement("button");
  pin.className = "pin";
  pin.title = isPinned ? "Unpin" : "Pin";
  const pinIcon = document.createElement("img");
  pinIcon.src = "/assets/images/pin.svg";
  pinIcon.alt = "Pin icon";
  pinIcon.className = `pin-icon ${isPinned ? "pinned" : ""}`;

  link.appendChild(icon);
  link.appendChild(name);
  listItem.appendChild(link);
  pin.appendChild(pinIcon);
  listItem.appendChild(pin);

  pin.addEventListener("click", () => {
    const pinnedItems = getPinnedItems();
    if (isPinned) {
      savePinnedItems(pinnedItems.filter((item) => item.url !== ai.url));
    } else {
      pinnedItems.push({ name: ai.name, url: ai.url, icon: ai.icon });
      savePinnedItems(pinnedItems);
    }
    renderSidebar();
  });

  return listItem;
}

function renderSearchEngineNavbar() {
  const navbar = document.getElementById("search-engine-navbar");
  navbar.innerHTML = "Search with: ";
  const selectedEngine = getSelectedSearchEngine();

  SEARCH_ENGINES.forEach((engine) => {
    const button = document.createElement("button");
    button.className = `search-engine-btn ${
      engine.name === selectedEngine ? "active" : ""
    }`;
    const img = document.createElement("img");
    img.src = engine.image || "/assets/images/search.svg";
    img.alt = `${engine.name} icon`;
    img.className = "search-engine-icon";
    button.appendChild(img);
    button.addEventListener(
      "click",
      debounce((e) => {
        e.preventDefault();
        saveSelectedSearchEngine(engine.name);
        renderSearchEngineNavbar();
        document.getElementById("search").focus();
        search();
      }, 100)
    );
    navbar.appendChild(button);
  });
}

function createSearchEngineLink(query, list, resultsContainer) {
  const selectedEngine = getSelectedSearchEngine();
  const engine =
    SEARCH_ENGINES.find((e) => e.name === selectedEngine) || SEARCH_ENGINES[0];
  const searchLi = document.createElement("p");
  searchLi.className = "search-item";
  const searchA = document.createElement("a");
  searchA.href = `${engine.url}${encodeURIComponent(query)}`;
  searchA.target = "_self";
  searchA.rel = "noopener noreferrer";
  searchA.className = "search-link";
  searchA.textContent = `Search for "${query}" on ${engine.name}`;
  searchA.tabIndex = 0;
  searchA.dataset.originalQuery = query; // Store original query for later use
  searchLi.appendChild(searchA);
  list.appendChild(searchLi);
  resultsContainer.classList.add("active");
}

function search() {
  const query = document.getElementById("search").value.trim();
  const resultsContainer = document.querySelector(".search-results");
  const list = document.getElementById("search-results");
  list.innerHTML = "";

  if (query.length === 0) {
    resultsContainer.classList.remove("active");
    return;
  }

  createSearchEngineLink(query, list, resultsContainer);

  if (typeof browser !== "undefined" && browser.history) {
    browser.history
      .search({ text: query })
      .then((results) => {
        if (results.length > 0) {
          const LIMIT = 7;
          results = results.slice(0, LIMIT);
          results.forEach((history) => {
            const li = document.createElement("p");
            li.className = "search-item";
            const a = document.createElement("a");
            a.href = history.url;
            a.target = "_self";
            a.rel = "noopener noreferrer";
            a.className = "search-link";
            a.textContent = history.url;
            a.tabIndex = 0;
            li.appendChild(a);
            list.appendChild(li);
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    const li = document.createElement("p");
    li.className = "search-item";
    li.textContent = "History search not available";
    li.style.padding = "8px 12px";
    li.style.color = "var(--text-color)";
    list.appendChild(li);
  }
}

function handleSearchNavigation(event) {
  const searchInput = document.getElementById("search");
  const list = document.getElementById("search-results");
  const results = list.getElementsByClassName("search-item");
  const resultsArray = Array.from(results);

  if (event.key === "Tab" && resultsArray.length > 0) {
    event.preventDefault();
    const activeElement = document.activeElement;
    const searchContainer = document.querySelector(".search-container");

    const focusableLinks = Array.from(list.querySelectorAll("a.search-link"));

    if (activeElement === searchInput) {
      const firstLink = focusableLinks[0];
      if (firstLink) {
        firstLink.focus();
        searchInput.value = firstLink.dataset.originalQuery || firstLink.href;
      }
    } else if (
      searchContainer.contains(activeElement) &&
      focusableLinks.includes(activeElement)
    ) {
      const currentIndex = focusableLinks.indexOf(activeElement);
      let nextIndex = event.shiftKey
        ? currentIndex === 0
          ? focusableLinks.length - 1
          : currentIndex - 1
        : currentIndex === focusableLinks.length - 1
        ? 0
        : currentIndex + 1;

      const nextLink = focusableLinks[nextIndex];
      if (nextLink) {
        nextLink.focus();
        searchInput.value = nextLink.dataset.originalQuery || nextLink.href;
      }
    }
  } else if (event.key === "Enter" && document.activeElement === searchInput) {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (query.length === 0) return;

    if (isValidUrl(query)) {
      const url = query.startsWith("http") ? query : `https://${query}`;
      window.location.href = url;
    } else {
      search();
      setTimeout(() => {
        const firstLink = list.querySelector("a.search-link");
        if (firstLink) {
          firstLink.focus();
          firstLink.click();
        }
      }, 50);
    }
  }
}

// Event listeners
document.addEventListener("keydown", handleSearchNavigation);
document
  .getElementById("search")
  .addEventListener("keyup", debounce(search, 300));
document.addEventListener("click", (e) => {
  const searchContainer = document.querySelector(".search-container");
  const resultsContainer = document.querySelector(".search-results");
  if (
    !searchContainer.contains(e.target) &&
    !resultsContainer.contains(e.target)
  ) {
    resultsContainer.classList.remove("active");
  }
});
document.addEventListener("DOMContentLoaded", renderSidebar);

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
