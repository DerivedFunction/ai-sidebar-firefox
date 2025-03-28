// Get the full URL of sidebar.html inside the extension
const sidebarUrl = browser.runtime.getURL("sidebar.html");
console.log("Background script loaded, Sidebar URL:", sidebarUrl);

// Context menu: Open Link in Sidebar
browser.contextMenus.create(
  {
    id: "OpenLinkInSidebar",
    title: "Open Link in Sidebar",
    contexts: ["link"],
  },
  () => void browser.runtime.lastError
);

// Context menu: Open Link in Sidebar
browser.contextMenus.create(
  {
    id: "ResetSidebar",
    title: "Clear Sidebar",
    contexts: ["page", "link"],
  },
  () => void browser.runtime.lastError
);
// Context menu: Open Link in Sidebar
browser.contextMenus.create(
  {
    id: "OpenPageInSidebar",
    title: "Open Page in Sidebar",
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
    browser.sidebarAction.setPanel({ panel: sidebarUrl });
  }
});
