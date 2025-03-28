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
      const types = [
        "Fix what is wrong with the following: ",
        "Summarize briefly and concisely, with bullet points on key terms: ", // Existing: Condense the selected text
        "Explain throughly and include easy to understand examples: ", // Existing: Clarify the selected text
        "Research and compare, give the best explanation or idea for this topic: ", // Existing: Dig deeper into the topic
        "Translate the following text: ", // New: Convert text to another language
        "Analyze the following", // New: Break down components or sentiment
        "Generate related content given: ", // New: Create related content
        "Fact-Check this claim. Explain supporting or opposing arguments: ", // New: Verify accuracy of information
        "Define the term:", // New: Provide definitions for terms
        "Code or fix the solution for the following. Explain each step with comments: ", // New: Interpret or generate code snippets
      ];
      types.forEach((type) => {
        browser.contextMenus.create(
          {
            id: type.split(" ")[0],
            title: type,
            parentId: "search",
            contexts: ["selection", "link", "page"],
          },
          () => void browser.runtime.lastError
        );
      });
    }
  }
}
// Initial menu setup
let defaultURL;
updateQuickAccessMenu();
updateSearchEngine();
updateURL();

// Listen for changes in localStorage and update menus accordingly
window.addEventListener("storage", (event) => {
  if (event.key === "pinnedItems") {
    updateQuickAccessMenu();
  } else if (event.key === "selectedSearchEngine") {
    updateSearchEngine();
  } else if (event.key === "defaultURL") {
    updateURL();
  }
});

function updateURL() {
  defaultURL = localStorage.getItem("defaultURL");
}
