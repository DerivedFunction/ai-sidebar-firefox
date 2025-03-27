// Get the full URL of sidebar.html inside the extension
const sidebarUrl = browser.runtime.getURL("sidebar.html");
console.log("Background script loaded, Sidebar URL:", sidebarUrl);

// Persistent state for sidebar visibility
let sidebarVisible = false;

console.log("Setting up browser.action.onClicked listener");
browser.action.onClicked.addListener((tab) => {
  console.log("Browser action clicked, resetting to:", sidebarUrl);
  browser.sidebarAction.setPanel({ panel: sidebarUrl }); // Reset to sidebar.html
  browser.sidebarAction.open(); // Ensure sidebar is open
  sidebarVisible = true;
  // Send message to sidebar to ensure it reloads sidebar.html
  browser.runtime.sendMessage({ action: "resetSidebar" }).catch((err) => {
    console.log("No sidebar listener yet:", err);
  });
});

// Context menu: Open Link in Sidebar
browser.contextMenus.create(
  {
    id: "OpenLinkInSidebar",
    title: "Open Link in Sidebar",
    contexts: ["link"],
  },
  () => void browser.runtime.lastError
);

browser.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "OpenLinkInSidebar" && info.linkUrl) {
    browser.sidebarAction.open();
    sidebarVisible = true;
    browser.runtime.sendMessage({ action: "openUrl", url: info.linkUrl });
  }
});

// Page action: Show on HTTP/HTTPS pages and open in sidebar
browser.tabs.onUpdated.addListener((tabId, { url }, tab) => {
  if (url && url.includes("http")) {
    console.log("Tab updated with URL:", url);
    browser.pageAction.show(tabId);
  }
});

browser.pageAction.onClicked.addListener((tab) => {
  if (tab.url) {
    browser.sidebarAction.open();
    sidebarVisible = true;
    browser.runtime.sendMessage({ action: "openUrl", url: tab.url });
  }
});

// Context menu: Open Page in Sidebar
browser.contextMenus.create(
  {
    id: "OpenPageInSidebar",
    title: "Open Page in Sidebar",
    contexts: ["page"],
  },
  () => void browser.runtime.lastError
);

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "OpenPageInSidebar" && tab.url) {
    browser.sidebarAction.open();
    sidebarVisible = true;
    browser.runtime.sendMessage({ action: "openUrl", url: tab.url });
  }
});
