const AI_LIST = [
  {
    name: "Grok / xAI", //Yes
    url: "https://grok.com/",
    icon: "/assets/images/ai/grok.svg",
  },
  {
    name: "Microsoft Copilot", //Yes
    url: "https://copilot.microsoft.com/",
    icon: "/assets/images/ai/copilot.svg",
  },
  {
    name: "ChatGPT", //Yes
    url: "https://chat.openai.com/",
    icon: "/assets/images/ai/chatgpt.svg",
  },
  {
    name: "Google Gemini", //No
    url: "https://gemini.google.com/app",
    icon: "/assets/images/ai/gemini.svg",
  },
  {
    name: "Google (AI mode)",
    url: "https://www.google.com/search?udm=50&q=",
    icon: "/assets/images/ai/google.svg",
  },
  {
    name: "Meta AI", //Not really
    url: "https://www.meta.ai/",
    icon: "/assets/images/ai/meta.svg",
  },
  {
    name: "HuggingChat", //No
    url: "https://huggingface.co/chat/",
    icon: "/assets/images/ai/hug.svg",
  },
  {
    name: "Anthropic Claude", //Not really
    url: "https://claude.ai/new",
    icon: "/assets/images/ai/claude.svg",
  },
  {
    name: "Mistral AI", //Yes
    url: "https://chat.mistral.ai/chat",
    icon: "/assets/images/ai/mistral.svg",
  },
  {
    name: "DeepSeek", //No
    url: "https://chat.deepseek.com",
    icon: "/assets/images/ai/deepseek.svg",
  },
  {
    name: "Perplexity AI", //No
    url: "https://www.perplexity.ai/",
    icon: "/assets/images/ai/perplexity.svg",
  },
];

const SEARCH_ENGINES = [
  {
    name: "Google",
    url: "https://www.google.com/search?q=",
    image: "/assets/images/search/google.svg",
    queryParam: "q",
  },
  {
    name: "DuckDuckGo",
    url: "https://duckduckgo.com/?q=",
    image: "/assets/images/search/duckduckgo.svg",
    queryParam: "q",
  },
  {
    name: "Bing",
    url: "https://www.bing.com/search?q=",
    image: "/assets/images/search/bing.svg",
    queryParam: "q",
  },
  {
    name: "Yahoo",
    url: "https://search.yahoo.com/search?p=",
    image: "/assets/images/search/yahoo.svg",
    queryParam: "p",
  },
  {
    name: "Wikipedia",
    url: "https://en.wikipedia.org/w/index.php?search=",
    image: "/assets/images/search/wikipedia.svg",
    queryParam: "search",
  },
  {
    name: "Amazon",
    url: "https://www.amazon.com/s?k=",
    image: "/assets/images/search/amazon.svg",
    queryParam: "k",
  },
  // AI search engines
  {
    name: "Grok",
    url: "https://grok.com/?q=",
    image: "/assets/images/ai/grok.svg",
    queryParam: "q",
    isAI: true,
  },
  {
    name: "Copilot",
    url: "https://copilot.microsoft.com/?q=",
    image: "/assets/images/ai/copilot.svg",
    queryParam: "q",
    isAI: true,
  },
  {
    name: "ChatGPT",
    url: "https://chatgpt.com/?q=",
    image: "/assets/images/ai/chatgpt.svg",
    queryParam: "q",
    isAI: true,
  },
  {
    name: "Mistral",
    url: "https://chat.mistral.ai/chat?q=",
    image: "/assets/images/ai/mistral.svg",
    queryParam: "q",
    isAI: true,
  },
  {
    name: "Google (AI mode)",
    url: "https://www.google.com/search?udm=50&q=",
    image: "/assets/images/ai/google.svg",
    queryParam: "q",
    isAI: true,
  },
  {
    name: "Claude", //Not really
    url: "https://claude.ai/new?q=",
    image: "/assets/images/ai/claude.svg",
    queryParam: "q",
    isAI: true,
  },
  {
    name: "Meta", //Not really
    url: "https://www.meta.ai/?q=",
    image: "/assets/images/ai/meta.svg",
    queryParam: "q",
    isAI: true,
  },
];

let settingDef = false;
// Local storage functions
function getPinnedItems() {
  return JSON.parse(localStorage.getItem("pinnedItems")) || [];
}

function savePinnedItems(pinnedItems) {
  localStorage.setItem("pinnedItems", JSON.stringify(pinnedItems));
}

function getSelectedSearchEngine() {
  let obj = localStorage.getItem("selectedSearchEngine");
  if (obj) {
    return JSON.parse(obj);
  }
  return SEARCH_ENGINES[0];
}

function saveSelectedSearchEngine(engine) {
  localStorage.setItem("selectedSearchEngine", JSON.stringify(engine));
}

function isValidUrl(string) {
  // First, check if it already has a protocol
  try {
    const url = new URL(string);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }
    // Check if hostname exists and has at least one dot (for a TLD)
    return url.hostname.includes(".") && url.hostname.length > 2;
  } catch (_) {
    // If it fails, try adding https:// and revalidate
    try {
      const urlWithProtocol = new URL(`https://${string}`);
      // Check if hostname exists and has at least one dot (for a TLD)
      return (
        urlWithProtocol.hostname.includes(".") &&
        urlWithProtocol.hostname.length > 2
      );
    } catch (_) {
      return false;
    }
  }
}

// Add new storage and caching functions
function getCachedImage(url) {
  return localStorage.getItem(`imageCache_${url}`);
}

function saveCachedImage(url, base64Data) {
  try {
    localStorage.setItem(`imageCache_${url}`, base64Data);
  } catch (e) {
    console.error("Failed to save image to localStorage (possibly full):", e);
  }
}

async function fetchAndCacheImage(url) {
  const cached = getCachedImage(url);
  if (cached) return cached;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch image");
    const blob = await response.blob();
    const base64 = await blobToBase64(blob);
    saveCachedImage(url, base64);
    return base64;
  } catch (e) {
    console.error(`Error fetching image ${url}:`, e);
    return "/assets/images/webpage.svg";
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Add preload function
async function preloadIcons() {
  const allIcons = [
    ...AI_LIST.map((item) => item.icon),
    ...SEARCH_ENGINES.map((engine) => engine.image),
    "/assets/images/pin.svg",
    "/assets/images/webpage.svg",
  ];
  await Promise.all(allIcons.map((url) => fetchAndCacheImage(url)));
}

// Render the main list (AI or tabs), only showing unpinned items
function renderSidebar(element, list) {
  renderList(element, list);
}

// New function to render quick-access independently
function renderQuickAccess() {
  const quickAccessList = DOM.quickAccess();
  quickAccessList.innerHTML = ""; // Clear the quick-access list
  const pinnedItems = getPinnedItems();
  if (pinnedItems.length == 0) {
    quickAccessList.textContent = "No pinned items yet.";
    return;
  }
  // Render pinned items
  pinnedItems.forEach((pinned) => {
    const listItem = createListItem(pinned, true);
    quickAccessList.appendChild(listItem);
  });
}

function createListItem(item, isPinned) {
  const fragment = document.createDocumentFragment();
  const listItem = document.createElement("li");
  if (/^(about|file):/i.test(item.url)) {
    return fragment;
  }
  listItem.className = "ai-item";
  listItem.id = `ai-item-${encodeURIComponent(item.url)}`;

  const link = document.createElement("a");
  link.href = item.url;
  link.target = "_self";
  link.rel = "noopener noreferrer";

  const icon = document.createElement("img");
  const cachedIcon = getCachedImage(item.icon) || item.icon;
  let itemDomain;
  try {
    itemDomain = new URL(item.url).hostname;
  } catch (e) {
    itemDomain = "";
  }
  icon.src =
    cachedIcon ||
    `https://s2.googleusercontent.com/s2/favicons?domain=${itemDomain}` ||
    getCachedImage("/assets/images/webpage.svg");
  icon.alt = `${item.name} icon`;
  icon.className = "ai-icon";

  // Handle icon loading errors and cache fallback
  icon.onerror = function () {
    const fallbackIcon = getCachedImage("/assets/images/webpage.svg");
    icon.src = fallbackIcon;
    icon.onerror = null;
  };

  // Fetch and cache if not already cached
  if (!cachedIcon && item.icon) {
    fetchAndCacheImage(item.icon).then((base64) => {
      icon.src = base64;
    });
  }

  const name = document.createElement("span");
  name.className = "ai-name";
  name.textContent = item.name;

  link.appendChild(icon);
  link.appendChild(name);
  listItem.appendChild(link);

  const pin = document.createElement("button");
  pin.className = "pin";
  pin.title = isPinned ? "Unpin" : "Pin";

  const pinIcon = document.createElement("img");
  pinIcon.src = "/assets/images/pin.svg";
  pinIcon.alt = "Pin icon";
  pinIcon.className = `pin-icon ${isPinned ? "pinned" : ""}`;

  listItem.addEventListener("click", (e) => {
    if (settingDef) {
      e.preventDefault();
      const pop = document.getElementById("set-url-popup");
      pop.innerHTML = "";
      const p = document.createElement("p");
      if (item.url == window_url) {
        // unset
        localStorage.removeItem("defaultURL");
        p.innerText = "Default page removed.";
      } else {
        // set
        localStorage.setItem("defaultURL", item.url);
        p.innerText = `${item.name} is now the default page. Right click and choose Reset the Sidebar to undo.`;
      }
      settingDef = !settingDef;
      pop.appendChild(p);
      pop.classList.add("active");

      setTimeout(() => {
        pop.classList.remove("active");
      }, 3000); // Show the popup for 3 seconds
    }
  });
  pin.addEventListener("click", (e) => {
    e.preventDefault();
    const pinnedItems = getPinnedItems();
    const itemIndex = pinnedItems.findIndex((i) => i.url === item.url);

    if (isPinned && itemIndex !== -1) {
      // Unpin: Remove from pinnedItems
      pinnedItems.splice(itemIndex, 1);
      pinIcon.classList.remove("pinned");
      pin.title = "Pin";
    } else if (!isPinned && itemIndex === -1) {
      // Pin: Add only if not already pinned
      pinnedItems.push({ name: item.name, url: item.url, icon: item.icon });
      pinIcon.classList.add("pinned");
      pin.title = "Unpin";
    } else {
      // Item is already pinned but marked unpinned in UI (edge case), do nothing
      return;
    }

    savePinnedItems(pinnedItems);
    renderSidebar(DOM.sections.ai(), AI_LIST);
    updateTabList();
    renderQuickAccess();
    renderMostVisited();
  });
  pin.appendChild(pinIcon);
  listItem.appendChild(pin);
  fragment.appendChild(listItem);
  return fragment;
}

function renderSearchEngineNavbar() {
  const navbar = document.getElementById("search-engine-navbar");

  // Create a DocumentFragment to build the content in memory
  const fragment = document.createDocumentFragment();

  // Add the "Search with:" text to the fragment
  const textNode = document.createTextNode("Search with: ");
  fragment.appendChild(textNode);

  const selectedEngine = getSelectedSearchEngine().name;

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
        saveSelectedSearchEngine(engine);
        DOM.search().focus();
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
    const engine = SEARCH_ENGINES.find(
      (engine) => urlObj.origin + urlObj.pathname === engine.url.split("?")[0]
    );

    if (engine) {
      const params = new URLSearchParams(urlObj.search);
      const queryParam = params.get(engine.queryParam);

      if (queryParam) {
        const decodedQuery = decodeURIComponent(queryParam);
        const selectedEngine =
          SEARCH_ENGINES.find(
            (e) => e.name === getSelectedSearchEngine().name
          ) || SEARCH_ENGINES[0];

        return {
          engine: engine.name,
          query: decodedQuery,
          newUrl: `${selectedEngine.url}${encodeURIComponent(decodedQuery)}`,
        };
      }
    }
    return null;
  } catch (e) {
    return null;
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
  const query = DOM.search().value.trim();
  const resultsContainer = DOM.container();
  const list = DOM.results();
  list.innerHTML = ""; // Clear the list initially

  if (query.length === 0) {
    // If we have an AI search engine, we can fill in some prompts
    const types = JSON.parse(localStorage.getItem("ai-prompts"));
    if (types.length > 0 && getSelectedSearchEngine().isAI) {
      const fragment = document.createDocumentFragment();
      types.forEach((type) => {
        const li = document.createElement("p");
        li.className = "search-item";
        const a = document.createElement("a");
        a.target = "_self";
        a.rel = "noopener noreferrer";
        a.className = "search-link";
        a.tabIndex = 0;
        a.textContent = type.prompt; // Display the prompt text
        a.href = `#${encodeURIComponent(type.prompt)}`; // Simple anchor link, could be customized
        a.dataset.promptId = type.id; // Store the ID for potential use
        li.appendChild(a);
        // We want to fill the input but not click the link
        a.addEventListener("click", (e) => {
          e.preventDefault();
          DOM.search().value = a.textContent; // the input
          DOM.search().focus();
          search(); // search again
        });
        fragment.appendChild(li);
      });
      list.appendChild(fragment);
      resultsContainer.classList.add("active"); // Show the container with suggestions
      renderSearchEngineNavbar();
    } else {
      resultsContainer.classList.add("active"); // Show the container with suggestions
      renderSearchEngineNavbar();
      // resultsContainer.classList.remove("active"); // Hide if no prompts available
    }

    return;
  }

  if (typeof browser !== "undefined" && browser.history) {
    browser.history
      .search({ text: query })
      .then((results) => {
        const LIMIT = 12;

        // Create a fake entry with a search engine query
        const fakeEntry = {
          url: `${
            SEARCH_ENGINES.find(
              (e) => e.name === getSelectedSearchEngine().name
            ).url
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
        results = results.slice(0, LIMIT - 5);
        // Deduplicate results based on N characters after the domain name
        const uniqueResults = [];
        const seenUrls = new Set();
        const N = 30; // Adjust this value as needed
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
        let spaceAvailable = LIMIT - results.length - 3; // Leave space for search engine entries
        if (consolidatedDomainEntries && consolidatedDomainEntries.length > 0)
          results = results.concat(
            consolidatedDomainEntries.slice(0, spaceAvailable)
          );

        spaceAvailable = LIMIT - results.length;
        if (searchEngineEntries && searchEngineEntries.length > 0)
          results = results.concat(
            searchEngineEntries.slice(0, spaceAvailable)
          );

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
          const queryRegex = new RegExp(`(${query})`, "gi");
          if (parsedSearch) {
            a.href = parsedSearch.newUrl;

            // Create a text node with the query and bold the matches
            a.textContent = ""; // Clear existing content

            // Split the query by regex and process matches
            const parts = parsedSearch.query.split(queryRegex);
            parts.forEach((part, index) => {
              if (index % 2 === 1) {
                // Matches from regex
                const bold = document.createElement("strong");
                bold.textContent = part;
                a.appendChild(bold);
              } else if (part) {
                // Non-matched text
                a.appendChild(document.createTextNode(part));
              }
            });

            a.dataset.originalQuery = parsedSearch.query;
          } else {
            a.href = history.url;

            // Clean URL and create underlined content
            const cleanedUrl = history.url.replace(/^https?:\/\//i, "");
            a.textContent = ""; // Clear existing content
            const underline = document.createElement("u");

            // Split the URL by regex and process matches
            const parts = cleanedUrl.split(queryRegex);
            parts.forEach((part, index) => {
              if (index % 2 === 1) {
                // Matches from regex
                const bold = document.createElement("strong");
                bold.textContent = part;
                underline.appendChild(bold);
              } else if (part) {
                // Non-matched text
                underline.appendChild(document.createTextNode(part));
              }
            });

            a.appendChild(underline);
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
        handleSearchNavigation(() => {});
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
  const searchInput = DOM.search();
  const list = DOM.results();
  const results = list.getElementsByClassName("search-item");
  const resultsArray = Array.from(results);
  if (
    !resultsArray.some((result) => result.classList.contains("active")) &&
    resultsArray.length > 0
  ) {
    results[0].classList.add("active");
  }
  if (!event) return;
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
        link.focus(); // Focus
        results[0].classList.add("active"); // Add "active" to the first result
        searchInput.value =
          link.dataset.originalQuery || link.href || link.textContent;
        window.location.href = link;
      }, 50);
    }
  }
}
let historyItems = [];

function renderMostVisited() {
  const mostVisitedList = DOM.sections.mostVisited();
  mostVisitedList.innerHTML = ""; // Clear the list

  if (typeof browser !== "undefined" && browser.history) {
    if (historyItems.length === 0) {
      // Query browser history for the last 30 days (only if not already fetched)
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      browser.history
        .search({
          text: "",
          startTime: thirtyDaysAgo,
          maxResults: 1000, // Fetch a large sample to analyze
        })
        .then((fetchedItems) => {
          historyItems = fetchedItems; // Cache the history items globally
          renderMostVisitedFromCache(); // Render after fetching
        })
        .catch((error) => {
          console.error("Error fetching history:", error);
          mostVisitedList.innerHTML =
            "<li>Error loading most visited sites</li>";
        });
    } else {
      // Use cached historyItems to render
      renderMostVisitedFromCache();
    }
  } else {
    mostVisitedList.innerHTML = "<li>History API not available</li>";
  }
}

// Helper function to render from cached historyItems
function renderMostVisitedFromCache() {
  const mostVisitedList = DOM.sections.mostVisited();
  mostVisitedList.innerHTML = ""; // Clear the list again for safety

  // Aggregate visit counts by domain
  const domainVisits = {};
  historyItems.forEach((item) => {
    try {
      const url = new URL(item.url);
      const domain = url.hostname;
      if (!domainVisits[domain]) {
        domainVisits[domain] = {
          url: `https://${domain}`,
          name: domain,
          icon: `https://${domain}/favicon.ico`, // Attempt to fetch favicon
          visitCount: 0,
        };
      }
      domainVisits[domain].visitCount += item.visitCount || 1;
    } catch (e) {
      console.error("Invalid URL in history:", item.url);
    }
  });

  // Convert to array and sort by visit count
  const mostVisited = Object.values(domainVisits)
    .sort((a, b) => b.visitCount - a.visitCount)
    .slice(0, 10); // Top 10 most visited

  // Render the list
  const pinnedItems = getPinnedItems();
  mostVisited.forEach((item) => {
    const isPinned = pinnedItems.some((pinned) => pinned.url === item.url);
    const listItem = createListItem(item, isPinned);
    mostVisitedList.appendChild(listItem);
  });
}

// Event listeners
document.addEventListener("click", (e) => {
  const searchContainer = document.querySelector(".search-container");
  const resultsContainer = DOM.container();
  if (
    !searchContainer.contains(e.target) &&
    !resultsContainer.contains(e.target)
  ) {
    resultsContainer.classList.remove("active");
  }
});
// Debounced version of updateTabList to prevent rapid successive calls
const debouncedUpdateTabList = debounce(updateTabList, 1000);

// Event listeners for tab changes
browser.tabs.onCreated.addListener((tab) => {
  debouncedUpdateTabList();
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  debouncedUpdateTabList();
});

browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  debouncedUpdateTabList();
});

let tabElement = null;
let tabList = [];

// Main function to update tab list
function updateTabList() {
  tabList = [];
  browser.tabs
    .query({})
    .then((tabs) => {
      tabs.forEach((tab) => {
        let tabData = {
          name: tab.title,
          url: tab.url,
          icon: tab.favIconUrl,
        };
        tabList.push(tabData);
      });
      renderSidebar(tabElement, tabList);
    })
    .catch((error) => {
      console.error("Error querying tabs:", error);
    });
}

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
// Initial load and navbar setup
window_url = localStorage.getItem("defaultURL");
if (window_url) {
  window.location.href = window_url;
}
document.addEventListener("DOMContentLoaded", async () => {
  DOM = {
    search: () => document.getElementById("search"),
    results: () => document.getElementById("search-results"),
    container: () => document.querySelector(".search-results"),
    quickAccess: () => document.getElementById("quick-access"),
    sections: {
      ai: () => document.getElementById("ai-elements"),
      tabs: () => document.getElementById("tab-elements"),
      mostVisited: () => document.getElementById("most-visited-elements"),
    },
  };

  await preloadIcons(); // Add this line at the start
  tabElement = DOM.sections.tabs();
  updateTabList(); // Renders tabs initially
  renderSidebar(DOM.sections.ai(), AI_LIST); // Renders AI tools initially
  renderQuickAccess(); // Renders quick access initially
  renderMostVisited(); // Renders most visited initially
  setupEventListeners();
  // Set up navbar toggling
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const section = button.getAttribute("data-section");
      toggleSection(section);
    });
  });

  // Set initial active section
  toggleSection("quick-access");

  // Add Quick Access popup functionality
  const addQuickBtn = document.getElementById("add-quick");
  const popup = document.getElementById("add-quick-popup");
  const saveBtn = document.getElementById("quick-save");
  const cancelBtn = document.getElementById("quick-cancel");

  addQuickBtn.addEventListener("click", () => {
    popup.classList.add("active");
    document.getElementById("quick-title").focus(); // Focus the title input
  });

  saveBtn.addEventListener("click", popupAction);

  cancelBtn.addEventListener("click", () => {
    popup.classList.remove("active");
    // Clear inputs
    document.getElementById("quick-title").value = "";
    document.getElementById("quick-url").value = "";
    document.getElementById("quick-icon").value = "";
  });
  const defBtn = document.getElementById("set-url");
  defBtn.addEventListener(
    "click",
    debounce(() => {
      settingDef = !settingDef;
      localStorage.removeItem("defaultURL");
      const pop = document.getElementById("set-url-popup");
      pop.innerHTML = "";
      const p = document.createElement("p");
      if (settingDef) {
        p.innerText = `Click on a shortcut to set as default page`;
      } else {
        p.innerText = `User action complete`;
      }
      pop.appendChild(p);
      pop.classList.add("active");
      setTimeout(() => {
        pop.classList.remove("active");
      }, 3000); // Show the popup for 3 seconds
    }, 250)
  );
});

const popupAction = () => {
  const title = document.getElementById("quick-title").value.trim();
  let url = document.getElementById("quick-url").value.trim();
  const iconInput = document.getElementById("quick-icon").value.trim();
  const popup = document.getElementById("add-quick-popup");
  // Normalize URL: Add https:// if no protocol is specified, ignore about: URLs
  if (url && !url.match(/^(http|https|about|file):/i)) {
    url = `https://${url}`;
  }
  if (!url || /^(about|file):/i.test(url)) {
    alert(
      "Please enter a valid URL (local files and about: URLs are not allowed)."
    );
    return;
  }

  // Validate URL
  if (title && isValidUrl(url)) {
    const pinnedItems = getPinnedItems();
    // Attempt to get favicon if no icon is provided
    let icon = iconInput;
    if (!icon) {
      try {
        const urlObj = new URL(url);
        icon = `https://s2.googleusercontent.com/s2/favicons?domain=${urlObj.hostname}`;
        // Note: We can't fetch the favicon here to verify it exists due to CORS/async limitations,
        // so we rely on the onerror handler in createListItem to fall back if it fails
      } catch (e) {
        icon = "/assets/images/webpage.svg";
      }
    }

    const newItem = { name: title, url: url, icon: icon };
    if (!pinnedItems.some((item) => item.url === url)) {
      pinnedItems.push(newItem);
      savePinnedItems(pinnedItems);
      renderQuickAccess();
    }
    popup.classList.remove("active");
    // Clear inputs
    document.getElementById("quick-title").value = "";
    document.getElementById("quick-url").value = "";
    document.getElementById("quick-icon").value = "";
  } else {
    alert("Please enter a valid title and URL.");
  }
};
// [Rest of the code remains unchanged]
// Function to toggle sections (unchanged, but included for clarity)
function toggleSection(sectionId) {
  const sections = document.querySelectorAll(".sidebar-section");
  const buttons = document.querySelectorAll(".nav-btn");

  // Update button states
  buttons.forEach((btn) => {
    if (btn.getAttribute("data-section") === sectionId) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Update section visibility
  sections.forEach((section) => {
    if (section.id === `${sectionId}-section`) {
      section.classList.add("active");
    } else {
      section.classList.remove("active");
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "a") {
    const searchInput = DOM.search();
    const resultsContainer = DOM.container();
    const activeElement = document.activeElement;

    // Check if the active element is within the search results
    if (resultsContainer && resultsContainer.contains(activeElement)) {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  }
});

let DOM;

const ImageCache = {
  async preload(urls) {
    return Promise.all(urls.map((url) => this.get(url) || this.fetch(url)));
  },

  get(url) {
    return localStorage.getItem(`imageCache_${url}`);
  },

  set(url, data) {
    try {
      localStorage.setItem(`imageCache_${url}`, data);
    } catch (e) {
      console.warn("Cache storage failed:", e);
    }
  },

  async fetch(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      const base64 = await this.blobToBase64(blob);
      this.set(url, base64);
      return base64;
    } catch {
      return "/assets/images/webpage.svg";
    }
  },
};

function renderList(container, items, options = {}) {
  const fragment = document.createDocumentFragment();
  const pinnedItems = getPinnedItems();

  items
    .filter(
      (item) => options.showAll || !pinnedItems.some((p) => p.url === item.url)
    )
    .forEach((item) => {
      const isPinned = pinnedItems.some((p) => p.url === item.url);
      fragment.appendChild(createListItem(item, isPinned));
    });

  container.innerHTML = "";
  container.appendChild(fragment);
}

function setupEventListeners() {
  const debounceTime = 300;

  document.addEventListener("keydown", handleSearchNavigation);
  DOM.search().addEventListener("keyup", debounce(search, debounceTime));

  // Use event delegation for document clicks
  document.addEventListener("click", (e) => {
    const searchContainer = DOM.container();
    if (!searchContainer?.contains(e.target)) {
      searchContainer?.classList.remove("active");
    }
  });

  // Tab management
  const tabEvents = ["onCreated", "onUpdated", "onRemoved"];
  tabEvents.forEach((event) => {
    browser.tabs[event].addListener(debounce(updateTabList, 1000));
  });
}
