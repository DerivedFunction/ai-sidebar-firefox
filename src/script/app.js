const AI_LIST = [
  {
    name: "Grok / xAI",
    url: "https://grok.com/",
    icon: "/assets/images/ai/grok.svg",
  },
  {
    name: "Microsoft Copilot",
    url: "https://copilot.microsoft.com/",
    icon: "/assets/images/ai/copilot.svg",
  },
  {
    name: "ChatGPT",
    url: "https://chat.openai.com/",
    icon: "/assets/images/ai/chatgpt.svg",
  },
  {
    name: "Google Gemini",
    url: "https://gemini.google.com/app",
    icon: "/assets/images/ai/gemini.svg",
  },
  {
    name: "Meta AI",
    url: "https://www.meta.ai/",
    icon: "/assets/images/ai/meta.svg",
  },
  {
    name: "HuggingChat",
    url: "https://huggingface.co/chat/",
    icon: "/assets/images/ai/hug.svg",
  },
  {
    name: "Anthropic Claude",
    url: "https://claude.ai/new",
    icon: "/assets/images/ai/claude.svg",
  },
  {
    name: "Mistral AI",
    url: "https://chat.mistral.ai/chat",
    icon: "/assets/images/ai/mistral.svg",
  },
  {
    name: "DeepSeek",
    url: "https://chat.deepseek.com",
    icon: "/assets/images/ai/deepseek.svg",
  },
  {
    name: "Perplexity AI",
    url: "https://www.perplexity.ai/",
    icon: "/assets/images/ai/perplexity.svg",
  },
];

const SEARCH_ENGINES = [
  {
    name: "Google",
    url: "https://www.google.com/search?q=",
    image: "/assets/images/search/google.svg",
  },
  {
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
    image: "/assets/images/search/duckduckgo.svg",
  },
  {
    name: "Bing",
    url: "https://www.bing.com/search?q=",
    image: "/assets/images/search/bing.svg",
  },
  {
    name: "Yahoo",
    url: "https://search.yahoo.com/search?p=",
    image: "/assets/images/search/yahoo.svg",
  },
  {
    name: "Wikipedia",
    url: "https://en.wikipedia.org/w/index.php?search=",
    image: "/assets/images/search/wikipedia.svg",
  },
  {
    name: "Amazon",
    url: "https://www.amazon.com/s?k=",
    image: "/assets/images/search/amazon.svg",
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

  // Create a DocumentFragment to build the content in memory
  const fragment = document.createDocumentFragment();

  // Add the "Search with:" text to the fragment
  const textNode = document.createTextNode("Search with: ");
  fragment.appendChild(textNode);

  const selectedEngine = getSelectedSearchEngine();

  // Build all buttons within the fragment
  SEARCH_ENGINES.forEach((engine) => {
    const button = document.createElement("button");
    button.className = `search-engine-btn ${
      engine.name === selectedEngine ? "active" : ""
    }`;
    const img = document.createElement("img");
    img.src = engine.image || "/assets/images/search/search.svg";
    img.alt = `${engine.name} icon`;
    img.className = "search-engine-icon";
    button.appendChild(img);
    button.addEventListener(
      "click",
      debounce((e) => {
        e.preventDefault();
        saveSelectedSearchEngine(engine.name);
        document.getElementById("search").focus();
        search();
      }, 100)
    );
    fragment.appendChild(button);
  });

  // Clear the navbar and append the complete fragment at once
  navbar.innerHTML = "";
  navbar.appendChild(fragment);
}

function parseSearchEngineQuery(url) {
  try {
    const urlObj = new URL(url);
    for (const engine of SEARCH_ENGINES) {
      // Check if the URL starts with the engine's base URL up to the parameter
      const baseUrlWithoutParams = engine.url.split("?")[0];
      if (urlObj.origin + urlObj.pathname === baseUrlWithoutParams) {
        const params = new URLSearchParams(urlObj.search);
        let queryParam;
        switch (engine.name) {
          case "Google":
          case "DuckDuckGo":
          case "Bing":
            queryParam = params.get("q");
            break;
          case "Yahoo":
            queryParam = params.get("p");
            break;
          case "Wikipedia":
            queryParam = params.get("search");
            break;
          case "Amazon":
            queryParam = params.get("k");
            break;
          default:
            queryParam = null;
        }
        if (queryParam) {
          const decodedQuery = decodeURIComponent(queryParam);
          const selectedEngineName = getSelectedSearchEngine();
          const selectedEngine =
            SEARCH_ENGINES.find((e) => e.name === selectedEngineName) ||
            SEARCH_ENGINES[0];

          // Append only the encoded query value to the pre-parameterized URL
          const newUrl = `${selectedEngine.url}${encodeURIComponent(
            decodedQuery
          )}`;

          // Optional: Preserve additional parameters from the original URL
          // Uncomment the following block if you want to keep params like "client"
          /*
          const newParams = new URLSearchParams();
          params.forEach((value, key) => {
            if (key !== "q" && key !== "p" && key !== "search" && key !== "k") {
              newParams.set(key, value);
            }
          });
          const extraParams = newParams.toString();
          const newUrlWithExtras = extraParams
            ? `${newUrl}&${extraParams}`
            : newUrl;
          */

          return {
            engine: engine.name, // Original engine for display
            query: decodedQuery,
            newUrl: newUrl, // New URL with current engine
            // newUrl: newUrlWithExtras, // Uncomment if preserving extra params
          };
        }
      }
    }
    return null; // Not a recognized search engine URL
  } catch (e) {
    return null; // Invalid URL
  }
}

function consolidateHighlyRelevantDomains(results, query) {
  const domainStats = {};
  const queryLower = query.toLowerCase();

  // Step 1: Group and consolidate all domains
  results.forEach((item) => {
    const urlObj = new URL(item.url);
    const hostname = urlObj.hostname.toLowerCase();
    const domainParts = hostname.split(".").filter((part) => part.length > 0);
    const mainDomain =
      domainParts.length >= 2
        ? domainParts.slice(-2).join(".") // e.g., "x.com"
        : hostname;

    if (!domainStats[mainDomain]) {
      domainStats[mainDomain] = {
        urls: [],
        totalVisitCount: 0,
        latestVisitTime: 0,
        fullHostname: hostname,
        domainParts: domainParts,
      };
    }

    domainStats[mainDomain].urls.push(item.url);
    domainStats[mainDomain].totalVisitCount += item.visitCount || 1;
    domainStats[mainDomain].latestVisitTime = Math.max(
      domainStats[mainDomain].latestVisitTime,
      item.lastVisitTime || 0
    );
  });

  // Step 2: Filter consolidated domains where domain contains the query
  let consolidatedList = [];
  for (const mainDomain in domainStats) {
    const stats = domainStats[mainDomain];

    // Check if query starts any domain part or the main domain itself
    const startsWithQuery =
      stats.domainParts.some((part) => part.startsWith(queryLower)) ||
      mainDomain.startsWith(queryLower);

    if (startsWithQuery) {
      const consolidatedDomainEntry = {
        url: `https://${mainDomain}`,
        title: mainDomain,
        lastVisitTime: stats.latestVisitTime,
        visitCount: stats.totalVisitCount,
      };
      consolidatedList.push(consolidatedDomainEntry);
    }
  }

  // Step 3: Sort the list - main domains starting with query come first
  consolidatedList.sort((a, b) => {
    const aMainDomain = a.title.toLowerCase(); // e.g., "x.com"
    const bMainDomain = b.title.toLowerCase();
    const aStartsWithQuery = aMainDomain.startsWith(queryLower);
    const bStartsWithQuery = bMainDomain.startsWith(queryLower);

    if (aStartsWithQuery && !bStartsWithQuery) return -1; // a first
    if (!aStartsWithQuery && bStartsWithQuery) return 1; // b first
    // If both or neither start with query, maintain original order
    return 0;
  });

  return consolidatedList;
}
function getSearchEngineQueries(results, query) {
  const queryLower = query.toLowerCase();
  const searchEngineEntries = [];

  results.forEach((item) => {
    const parsedSearch = parseSearchEngineQuery(item.url);
    if (parsedSearch) {
      const searchTerm = parsedSearch.query.toLowerCase();
      // Only include if the search term contains the query
      if (searchTerm.includes(queryLower)) {
        const searchEntry = {
          url: parsedSearch.newUrl, // The constructed search URL
          title: parsedSearch.query, // The search term as the title
          lastVisitTime: item.lastVisitTime || Date.now(),
          visitCount: item.visitCount || 1,
          originalUrl: item.url, // Optional: Keep original URL for reference
        };
        searchEngineEntries.push(searchEntry);
      }
    }
  });

  // Sort by relevance (optional, based on your existing logic)
  searchEngineEntries.sort((a, b) => {
    const aRelevance = calculateRelevance(query, a);
    const bRelevance = calculateRelevance(query, b);
    return bRelevance - aRelevance; // Higher relevance first
  });

  return searchEngineEntries;
}

function search() {
  const query = document.getElementById("search").value.trim();
  const resultsContainer = document.querySelector(".search-results");
  const list = document.getElementById("search-results");
  list.innerHTML = ""; // Clear the list initially

  if (query.length === 0) {
    resultsContainer.classList.remove("active");
    return;
  }

  if (typeof browser !== "undefined" && browser.history) {
    browser.history
      .search({ text: query })
      .then((results) => {
        const LIMIT = 8;

        // Create a fake entry with a search engine query
        const fakeEntry = {
          url: `${
            SEARCH_ENGINES.find((e) => e.name === getSelectedSearchEngine()).url
          }${encodeURIComponent(query)}`,
          title: query,
          lastVisitTime: Date.now(),
          visitCount: 1,
        };

        // Get a consolidated domain entry (if any)
        const consolidatedDomainEntries = consolidateHighlyRelevantDomains(
          results,
          query
        );
        // Get all search engine queries
        const searchEngineEntries = getSearchEngineQueries(results, query);
        // Take top LIMIT results
        results = results.slice(0, LIMIT);
        // Deduplicate results based on N characters after the domain name
        const uniqueResults = [];
        const seenUrls = new Set();
        const N = 20; // Adjust this value as needed
        results.forEach((item) => {
          const urlObj = new URL(item.url);
          const hostname = urlObj.hostname.toLowerCase();
          const afterDomain = (urlObj.pathname + urlObj.search).toLowerCase();
          const normalizedUrl = hostname + afterDomain.slice(0, N); // Domain + N chars after

          if (
            !seenUrls.has(normalizedUrl) &&
            !parseSearchEngineQuery(item.url)
          ) {
            seenUrls.add(normalizedUrl);
            uniqueResults.push(item);
          }
        });
        results = uniqueResults;
        // Append consolidated domain entries up to LIMIT
        if (consolidatedDomainEntries && consolidatedDomainEntries.length > 0) {
          let spaceAvailable = LIMIT - results.length;
          results = results.concat(
            consolidatedDomainEntries.slice(0, spaceAvailable / 2)
          );
          spaceAvailable = LIMIT - results.length;
          results = results.concat(
            searchEngineEntries.slice(0, spaceAvailable)
          );
        }

        results.push(fakeEntry);

        // Sort all entries by relevance
        results.sort((a, b) => {
          const relevanceScoreA = calculateRelevance(query, a);
          const relevanceScoreB = calculateRelevance(query, b);
          return relevanceScoreB - relevanceScoreA;
        });

        // Build results in a DocumentFragment
        const fragment = document.createDocumentFragment();
        const seenHrefs = new Set(); // Track duplicates within the fragment

        results.forEach((history) => {
          const li = document.createElement("p");
          li.className = "search-item";
          const a = document.createElement("a");
          a.target = "_self";
          a.rel = "noopener noreferrer";
          a.className = "search-link";
          a.tabIndex = 0;

          const parsedSearch = parseSearchEngineQuery(history.url);
          if (parsedSearch) {
            a.href = parsedSearch.newUrl;
            a.textContent = parsedSearch.query;
            a.dataset.originalQuery = parsedSearch.query;
          } else {
            a.href = history.url;
            a.textContent = history.url.replace(/^https?:\/\//i, "");
          }

          // Skip if text doesn’t include query
          if (!a.textContent.toLowerCase().includes(query.toLowerCase())) {
            return;
          }

          // Normalize URL for duplicate check
          const normalizedHref = a.href
            .replace(/^https?:\/\//i, "")
            .replace(/\/$/, "");

          // Only add if not a duplicate
          if (!seenHrefs.has(normalizedHref)) {
            seenHrefs.add(normalizedHref);
            li.appendChild(a);
            fragment.appendChild(li);
          }
        });

        // Append the complete fragment to the list at once
        list.appendChild(fragment);
        renderSearchEngineNavbar();
        resultsContainer.classList.add("active");
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

function calculateRelevance(query, historyItem) {
  const queryLower = query.toLowerCase();
  const title = (historyItem.title || "").toLowerCase();
  let score = 0;

  const commonTlds = [
    "com",
    "edu",
    "org",
    "net",
    "gov",
    "io",
    "co",
    "uk",
    "ca",
    "de",
  ];
  const urlObj = new URL(historyItem.url);
  const hostname = urlObj.hostname.toLowerCase();
  const domainParts = hostname.split(".").filter((part) => part.length > 0);
  const path = urlObj.pathname.toLowerCase();
  const pathSegments = path.split("/").filter((segment) => segment.length > 0);
  const url = historyItem.url.toLowerCase();

  // Define regex patterns for common random-looking strings
  const patterns = [
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i, // UUID v4
    /\b[0-9a-f]{32,64}\b/i, // Long hex tokens (e.g., API keys)
    /\b[A-Za-z0-9_-]{16,}\b/, // Base64-like random tokens
    /\b\d{10,}\b/, // Long numeric strings (e.g., timestamps, order IDs)
    /\b[A-Fa-f0-9]{40}\b/, // SHA1-like hash
    /\b[A-Fa-f0-9]{64}\b/, // SHA256-like hash
  ];

  // Common keywords indicating authentication or security-related identifiers
  const suspiciousKeywords = [
    "auth",
    "token",
    "key",
    "session",
    "hash",
    "password",
    "verify",
    "id",
    "reset",
    "access",
    "secure",
    "code",
    "url",
    "https",
    "http",
    "redirect",
  ];

  const parsedSearch = parseSearchEngineQuery(historyItem.url);
  if (parsedSearch) {
    const searchTerm = parsedSearch.query.toLowerCase();
    if (searchTerm.includes(queryLower)) {
      score += 50;
      const searchTermPosition = searchTerm.indexOf(queryLower);
      score += Math.max(20 - Math.floor(searchTermPosition / 5), 0);
      if (searchTermPosition === 0) {
        score += 50; // First-letter bonus
      }
      let matchCount = 0;
      let pos = -1;
      while ((pos = searchTerm.indexOf(queryLower, pos + 1)) !== -1) {
        matchCount++;
        if (pos > 0) score += 10; // Additional matches beyond the first
      }
    }
    if (title.includes(queryLower)) {
      score += 30;
      const titlePosition = title.indexOf(queryLower);
      score += Math.max(10 - Math.floor(titlePosition / 5), 0);
      if (titlePosition === 0) {
        score += 50; // First-letter bonus
      }
      let matchCount = 0;
      let pos = -1;
      while ((pos = title.indexOf(queryLower, pos + 1)) !== -1) {
        matchCount++;
        if (pos > 0) score += 10; // Additional matches beyond the first
      }
    }
    score -= 40;
  } else {
    // Check for random patterns or suspicious keywords in path segments or query params
    const queryParams = Array.from(urlObj.searchParams.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join("&")
      .toLowerCase();
    const hasRandomOrSuspicious =
      pathSegments.some(
        (segment) =>
          patterns.some((pattern) => pattern.test(segment)) || // Matches random patterns
          suspiciousKeywords.some((keyword) => segment.includes(keyword))
      ) || suspiciousKeywords.some((keyword) => queryParams.includes(keyword));

    if (title.includes(queryLower)) {
      score += 50; // Base title match
      const titlePosition = title.indexOf(queryLower);
      score += Math.max(10 - Math.floor(titlePosition / 5), 0);
      if (titlePosition === 0) {
        score += 50; // First-letter bonus
      }
      let matchCount = 0;
      let pos = -1;
      while ((pos = title.indexOf(queryLower, pos + 1)) !== -1) {
        matchCount++;
        if (pos > 0) score += 10; // Additional matches beyond the first
      }
    }
    if (url.includes(queryLower) && !hasRandomOrSuspicious) {
      score += 30; // Base URL match
      const urlPosition = url.indexOf(queryLower);
      score += Math.max(15 - Math.floor(urlPosition / 10), 0);
      if (
        urlPosition === 0 ||
        url.indexOf(queryLower, "https://".length) === "https://".length
      ) {
        score += 50; // First-letter bonus
      }
      let matchCount = 0;
      let pos = -1;
      while ((pos = url.indexOf(queryLower, pos + 1)) !== -1) {
        matchCount++;
        if (pos > 0) score += 10; // Additional matches beyond the first
      }

      const meaningfulDomainParts = domainParts.filter(
        (part) => !commonTlds.includes(part)
      );
      const domainMatchCount = meaningfulDomainParts.filter((part) =>
        part.includes(queryLower)
      ).length;
      score += domainMatchCount * 20;
      if (domainMatchCount > 0) {
        const firstDomainMatchPosition = meaningfulDomainParts.findIndex(
          (part) => part.includes(queryLower)
        );
        score += Math.max(10 - firstDomainMatchPosition * 5, 0);
        if (meaningfulDomainParts.some((part) => part.startsWith(queryLower))) {
          score += 50; // First-letter bonus in domain
        }
      }
    } else if (url.includes(queryLower) && hasRandomOrSuspicious) {
      score += 30; // Base URL match only, no extra for multiple matches
      const urlPosition = url.indexOf(queryLower);
      score += Math.max(15 - Math.floor(urlPosition / 10), 0);
    }

    const hasUrlWithinUrl =
      /url=https?:\/\//i.test(url) ||
      /https?:\/\/[^/]+\/[^?]+https?:\/\//i.test(url);
    if (hasUrlWithinUrl) {
      score -= 50;
    }

    if (hasRandomOrSuspicious) {
      score -= 60; // Penalty for random or suspicious content
    } else {
      if (queryLower.length <= 2 && pathSegments.length <= 1) {
        score -= 30;
      } else {
        const pathMatchCount = pathSegments.filter((segment) =>
          segment.includes(queryLower)
        ).length;
        score += pathMatchCount * 15;
      }
      if (url.length > 100) {
        score -= pathSegments.length * 5; // Linear penalty, no cap
        score -= path.length * 0.5; // Linear penalty, no cap
      } else {
        score -= Math.min(pathSegments.length * 10, 50);
        score -= Math.min(path.length, 30);
      }
    }
  }

  const timeBonus =
    (Date.now() - historyItem.lastVisitTime) / (1000 * 60 * 60 * 24);
  score += Math.max(0, 20 - timeBonus);
  score += Math.min(historyItem.visitCount * 2, 20);

  return Math.max(score, -50);
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

    if (activeElement === searchInput && focusableLinks.length > 0) {
      focusableLinks[0].focus();
      searchInput.value =
        focusableLinks[0].dataset.originalQuery || focusableLinks[0].href;
      results[0].classList.add("active"); // Add "active" to the first result
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
        results[nextIndex].classList.add("active");
        if (currentIndex !== nextIndex) {
          results[currentIndex].classList.remove("active");
        }
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
      search(); // Populate results with parseSearchEngineQuery
      setTimeout(() => {
        const link = list.querySelector("a.search-link");
        if (link) {
          link.focus(); // Focus but don’t click
          results[0].classList.add("active"); // Add "active" to the first result
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
