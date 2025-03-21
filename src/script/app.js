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
    icon: "https://huggingface.co/chat/huggingchat/logo.svg",
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
  list.innerHTML = AI_LIST.map(
    (ai) => `
    <li class="ai-item">
      <a href="${ai.url}" target="_self" rel="noopener noreferrer">
        <img src="${ai.icon}" alt="${ai.name} icon" class="ai-icon" />
        <span class="ai-name">${ai.name}</span>
      </a>
    </li>
  `
  ).join("");

  // Add sidebar panel
  if (typeof browser !== "undefined") {
    browser.sidebarAction.setPanel({ panel: "sidebar.html" });
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", renderSidebar);
