// Get the full URL of sidebar.html inside the extension
const sidebarUrl = browser.runtime.getURL("sidebar.html");
console.log("Background script loaded, Sidebar URL:", sidebarUrl);

// Reusable function to handle context menu creation errors
function handleContextMenuError() {
  void browser.runtime.lastError;
}

// Context menu: Open Link in Sidebar
browser.contextMenus.create(
  {
    id: "OpenLinkInSidebar",
    title: "Open Link",
    contexts: ["link"],
  },
  handleContextMenuError
);

// Context menu: reset Sidebar
browser.contextMenus.create(
  {
    id: "ResetSidebar",
    title: "Reset Sidebar",
    contexts: ["all"],
  },
  () => void browser.runtime.lastError
);

browser.contextMenus.create(
  {
    id: "goBack",
    title: "Go back",
    contexts: ["all"],
  },
  () => void browser.runtime.lastError
);
// Context menu: Open Link in Sidebar
browser.contextMenus.create(
  {
    id: "OpenPageInSidebar",
    title: "Open Page",
    contexts: ["page"],
  },
  () => void browser.runtime.lastError
);

// Page action: Show on HTTP/HTTPS pages and open in sidebar
browser.tabs.onUpdated.addListener((tabId, { url }, tab) => {
  if (url && url.includes("http")) {
    browser.pageAction.show(tabId);
  }
});

browser.pageAction.onClicked.addListener(async (tab) => {
  if (tab.url) {
    // Ensure the sidebar is open first
    await browser.sidebarAction.open();
    browser.sidebarAction.setPanel({ panel: tab.url });
  }
});

// Track the previous state
let wasOpen = false;
// Function to check and update sidebar state
async function monitorSidebarState() {
  try {
    const isOpen = await browser.sidebarAction.isOpen({}); // No windowId means current window
    if (wasOpen && !isOpen) {
      // Sidebar just closed
      console.log("Sidebar closed, resetting panel...");
      // Optionally store the state in localStorage
      localStorage.setItem("sidebarState", "closed");
      // Reset panel (will apply when reopened)
      browser.sidebarAction.setPanel({ panel: sidebarUrl });
    } else if (!wasOpen && isOpen) {
      // Sidebar just opened
      console.log("Sidebar opened");
      localStorage.setItem("sidebarState", "open");
    }
    wasOpen = isOpen; // Update the previous state
  } catch (error) {
    console.error("Error checking sidebar state:", error);
  }
}

// Poll every 500ms (adjust as needed)
setInterval(monitorSidebarState, 500);

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  await browser.sidebarAction.open();
  browser.sidebarAction.setPanel({ panel: sidebarUrl });
  if (info.menuItemId === "OpenPageInSidebar" && tab.url) {
    browser.sidebarAction.setPanel({ panel: tab.url });
  } else if (info.menuItemId === "OpenLinkInSidebar" && info.linkUrl) {
    browser.sidebarAction.setPanel({ panel: info.linkUrl });
  } else if (info.menuItemId === "ResetSidebar") {
    localStorage.removeItem("defaultURL");
    browser.sidebarAction.setPanel({ panel: sidebarUrl });
  } else if (info.menuItemId === "goBack") {
    browser.sidebarAction.setPanel({ panel: "" });
  } else if (info.parentMenuItemId === "quick-access") {
    // Validate that menuItemId is a URL
    if (info.menuItemId.startsWith("http")) {
      browser.sidebarAction.setPanel({ panel: info.menuItemId });
    } else {
      browser.sidebarAction.setPanel({ panel: sidebarUrl }); // Fallback
    }
  } else if (info.menuItemId === "search") {
    // Regular search engines
    let query = getSearchEngine().name;
    if (info.selectionText) {
      query = encodeURIComponent(info.selectionText);
    } else if (info.linkUrl) {
      query = encodeURIComponent(info.linkUrl);
    } else {
      query = encodeURIComponent(tab.url);
    }
    browser.sidebarAction.setPanel({
      panel: `${getSearchEngine().url}${query}`,
    });
  } else if (info.parentMenuItemId === "search") {
    // AI searches
    let query;
    if (info.selectionText) {
      query = encodeURIComponent(info.menuItemId + " " + info.selectionText);
    } else if (info.linkUrl) {
      query = encodeURIComponent(info.menuItemId + " " + info.linkUrl);
    } else {
      query = encodeURIComponent(info.menuItemId + " " + tab.url);
    }
    browser.sidebarAction.setPanel({
      panel: `${getSearchEngine().url}${query}`,
    });
  }
});

function getPinnedItems() {
  return JSON.parse(localStorage.getItem("pinnedItems")) || [];
}

// Update context menus dynamically
async function updateQuickAccessMenu() {
  // Remove existing quick-access menu
  await browser.contextMenus.remove("quick-access").catch(() => {});

  const pinnedItems = getPinnedItems();
  if (pinnedItems.length > 0) {
    browser.contextMenus.create(
      {
        id: "quick-access",
        title: "Open/Set URL from Quick Access",
        contexts: ["all"],
      },
      () => void browser.runtime.lastError
    );
    pinnedItems.forEach((item) => {
      browser.contextMenus.create({
        id: item.url,
        title: item.name,
        parentId: "quick-access",
        contexts: ["all"],
      });
    });
  }
}

function getSearchEngine() {
  return (
    JSON.parse(localStorage.getItem("selectedSearchEngine")) || {
      name: "Google",
      url: "https://www.google.com/search?q=",
      image: "/assets/images/search/google.svg",
    }
  );
}

// Update context menus dynamically
async function updateSearchEngine() {
  // Remove existing quick-access menu
  await browser.contextMenus.remove("search").catch(() => {});

  const search = getSearchEngine();
  console.log(search.name);
  if (search) {
    browser.contextMenus.create(
      {
        id: "search",
        title: (search.isAI ? "Ask " : "Search with ") + `${search.name}`,
        contexts: ["selection", "link", "page"],
      },
      () => void browser.runtime.lastError
    );
    if (search.isAI != null) {
      types.forEach((type) => {
        browser.contextMenus.create(
          {
            id: type.prompt,
            title: type.id,
            parentId: "search",
            contexts: type.context,
          },
          () => void browser.runtime.lastError
        );
      });
    }
  }
}
// Initial menu setup
let defaultURL;
let types;
updateQuickAccessMenu();
updateSearchEngine();
updateURL();
getPrompts();
function getPrompts() {
  types = JSON.parse(localStorage.getItem("ai-prompts")) || [
    {
      id: "Fix",
      prompt: "Fix what is wrong with the following: ",
      context: ["selection"],
    },
    {
      id: "Solve",
      prompt: "Solve the following problem and give step-by-step logic: ",
      context: ["selection"],
    },
    {
      id: "Summarize",
      prompt:
        "Summarize briefly and concisely, with bullet points on key terms: ",
      context: ["selection", "page"],
    },
    {
      id: "Explain",
      prompt: "Explain thoroughly and include easy-to-understand examples: ",
      context: ["selection"],
    },
    {
      id: "Research",
      prompt:
        "Research and compare, give the best explanation or idea for this topic: ",
      context: ["selection", "link", "page"],
    },
    {
      id: "Paraphrase",
      prompt: "Paraphrase the following text: ",
      context: ["selection"],
    },
    {
      id: "Fill and Complete",
      prompt: "Fill in the blank and complete the following text: ",
      context: ["selection"],
    },
    {
      id: "Translate",
      prompt: "Translate the following text. What does it mean? : ",
      context: ["selection"],
    },
    {
      id: "Analyze",
      prompt: "Analyze the following: ",
      context: ["selection", "page"],
    },
    {
      id: "Generate",
      prompt: "Generate related content given: ",
      context: ["selection"],
    },
    {
      id: "Fact Check",
      prompt:
        "Fact-check this claim. Explain supporting or opposing arguments: ",
      context: ["selection", "link"],
    },
    {
      id: "Define",
      prompt: "Define the term: ",
      context: ["selection"],
    },
    {
      id: "Code",
      prompt:
        "Code and/or solve the solution for the following. Explain each step with comments: ",
      context: ["selection"],
    },
    {
      id: "Evaluate",
      prompt: "Evaluate the strengths and weaknesses of: ",
      context: ["selection", "page"],
    },
    {
      id: "Predict",
      prompt: "Predict the outcome of the following scenario: ",
      context: ["selection"],
    },
    {
      id: "Create a Plan",
      prompt: "Create a step-by-step plan to achieve: ",
      context: ["selection"],
    },
    {
      id: "Identify Themes",
      prompt: "Identify the main themes or ideas in: ",
      context: ["selection", "page"],
    },
    {
      id: "Compare/Contrast",
      prompt: "Compare and contrast the following: ",
      context: ["selection"],
    },
    {
      id: "Find Context",
      prompt: "Provide historical context for: ",
      context: ["selection", "page"],
    },
    {
      id: "Suggest improvements",
      prompt: "Suggest improvements for the following: ",
      context: ["selection", "page"],
    },
  ];
  if (!localStorage.getItem("ai-prompts")) {
    localStorage.setItem("ai-prompts", JSON.stringify(types));
  }
}
// Listen for changes in localStorage and update menus accordingly
window.addEventListener("storage", (event) => {
  if (event.key === "pinnedItems") {
    updateQuickAccessMenu();
  } else if (event.key === "selectedSearchEngine") {
    updateSearchEngine();
  } else if (event.key === "defaultURL") {
    updateURL();
  } else if (event.key === "ai-prompts") {
    getPrompts();
  }
});

function updateURL() {
  defaultURL = localStorage.getItem("defaultURL");
}
