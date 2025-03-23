// app.js
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

function renderSidebar() {
  const list = document.getElementById("ai-elements");
  list.innerHTML = "";
  AI_LIST.forEach((ai, i) => {
    const listItem = document.createElement("li");
    listItem.className = "ai-item";
    listItem.id = `ai-item-${i}`;
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

    link.appendChild(icon);
    link.appendChild(name);
    listItem.appendChild(link);
    list.appendChild(listItem);
  });

  // Add sidebar panel
  if (typeof browser !== "undefined") {
    browser.sidebarAction.setPanel({ panel: "sidebar.html" });
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", renderSidebar);
