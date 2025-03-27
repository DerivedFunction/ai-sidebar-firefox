browser.action.onClicked.addListener(() => {
  browser.sidebarAction.toggle();
});

browser.contextMenus.create(
  {
    id: "OpenLinkInSidebar",
    title: "Open Link in Sidebar",
    contexts: ["link"],
  },
  // See https://extensionworkshop.com/documentation/develop/manifest-v3-migration-guide/#event-pages-and-backward-compatibility
  // for information on the purpose of this error capture.
  () => void browser.runtime.lastError
);

// Listener for context menu item clicks. Handles the "Open Link in Sidebar" action.
browser.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "OpenLinkInSidebar") {
    browser.sidebarAction.setPanel({ panel: info.linkUrl });
    browser.sidebarAction.open();
  }
});

// Open the link in sidebar
browser.tabs.onUpdated.addListener((tabId, { url }, tab) => {
  if (url && url.includes("http")) {
    console.log(url);
    // Show only on certain domains
    browser.pageAction.show(tabId);
  }
});

// Listener for page action clicks
browser.pageAction.onClicked.addListener((tab) => {
  browser.sidebarAction.setPanel({ panel: tab.url });
  browser.sidebarAction.open();
});

// Add a context menu item for opening the current page in the sidebar
browser.contextMenus.create(
  {
    id: "OpenPageInSidebar",
    title: "Open Page in Sidebar",
    contexts: ["page"],
  },
  () => void browser.runtime.lastError
);

// Listener for the "Open Page in Sidebar" context menu item
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "OpenPageInSidebar" && tab.url) {
    browser.sidebarAction.setPanel({ panel: tab.url });
    browser.sidebarAction.open();
  }
});
