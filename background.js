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

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  await browser.sidebarAction.open();
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
    browser.contextMenus.create({
      id: "quick-access",
      title: "Open/Set URL from Quick Access",
      contexts: ["all"],
    });
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

// Initial menu setup
updateQuickAccessMenu();
