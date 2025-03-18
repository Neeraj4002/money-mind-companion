// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const searchButton = document.getElementById('searchButton');
const toastContainer = document.getElementById('toastContainer');

// State
let useWebSearch = false;

// API Keys - Replace with your actual keys in production
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Replace with your Gemini API key
const TAVILY_API_KEY = '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'; // Your Tavily API key

// Initialize the chat with a welcome message
document.addEventListener('DOMContentLoaded', () => {
  // Add initial AI message
  addMessage("Hi! I'm your AI financial advisor. Ask me anything about finance, investments, or money management.", true);
  
  // Setup event listeners
  messageInput.addEventListener('input', () => {
    sendButton.disabled = messageInput.value.trim() === '';
    adjustTextareaHeight();
  });
  
  messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendButton.disabled) {
        sendMessage();
      }
    }
  });
  
  sendButton.addEventListener('click', sendMessage);
  
  // Toggle web search functionality
  searchButton.addEventListener('click', () => {
    useWebSearch = !useWebSearch;
    searchButton.classList.toggle('active', useWebSearch);
    
    if (useWebSearch) {
      showToast('Web search enabled', 'info');
    } else {
      showToast('Web search disabled', 'info');
    }
  });
});

// Function to adjust textarea height
function adjustTextareaHeight() {
  messageInput.style.height = 'auto';
  messageInput.style.height = (messageInput.scrollHeight) + 'px';
}

// Function to send a message
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;
  
  // Add user message to chat
  addMessage(message, false);
  
  // Clear input and disable send button
  messageInput.value = '';
  messageInput.style.height = 'auto';
  sendButton.disabled = true;
  
  // Add loading indicator
  const loadingMessageElement = addLoadingMessage();
  
  try {
    // If web search is enabled, show a toast
    if (useWebSearch) {
      showToast('Searching the web for relevant information...', 'info');
    }
    
    // Get AI response
    const response = await getAIResponse(message, useWebSearch);
    
    // Remove loading indicator
    loadingMessageElement.remove();
    
    // Add AI response to chat
    addMessage(response, true);
  } catch (error) {
    console.error('Error getting AI response:', error);
    
    // Remove loading indicator
    loadingMessageElement.remove();
    
    // Add error message
    showToast('Failed to get a response. Please try again.', 'error');
    addMessage("I'm sorry, I couldn't process your request. Please try again later.", true);
  }
  
  // Scroll to the bottom of the chat
  scrollToBottom();
}

// Function to add a message to the chat
function addMessage(text, isAi) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${isAi ? 'ai' : 'user'}`;
  
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  
  if (isAi) {
    // For AI messages, use the Markdown renderer
    const markdownContainer = document.createElement('div');
    markdownContainer.className = 'markdown';
    markdownContainer.innerHTML = renderMarkdown(text);
    messageContent.appendChild(markdownContainer);
  } else {
    // For user messages, just use the text
    messageContent.textContent = text;
  }
  
  messageElement.appendChild(messageContent);
  chatContainer.appendChild(messageElement);
  
  // Scroll to the bottom of the chat
  scrollToBottom();
  
  return messageElement;
}

// Function to add a loading message
function addLoadingMessage() {
  const messageElement = document.createElement('div');
  messageElement.className = 'message ai';
  
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  
  const loadingDotsElement = document.createElement('div');
  loadingDotsElement.className = 'loading-dots';
  
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    loadingDotsElement.appendChild(dot);
  }
  
  messageContent.appendChild(loadingDotsElement);
  messageElement.appendChild(messageContent);
  chatContainer.appendChild(messageElement);
  
  // Scroll to the bottom of the chat
  scrollToBottom();
  
  return messageElement;
}

// Function to scroll to the bottom of the chat
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Function to show a toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  // Make the toast visible
  setTimeout(() => {
    toast.classList.add('visible');
  }, 10);
  
  // Remove the toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 3000);
}

// Function to get an AI response
async function getAIResponse(message, useWebSearch) {
  try {
    let contextInfo = "";
    
    // If web search is enabled, use Tavily API to get relevant information
    if (useWebSearch) {
      const searchResults = await searchWeb(message);
      contextInfo = `Web search results:\n${searchResults}\n\n`;
    }
    
    // Call the Gemini API with the user's message and context
    const response = await callGeminiAPI(contextInfo + message);
    return response;
  } catch (error) {
    console.error('Error in getAIResponse:', error);
    throw error;
  }
}

// Function to search the web using Tavily API
async function searchWeb(query) {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query: query,
        search_depth: "advanced",
        include_domains: [],
        exclude_domains: [],
        max_results: 3
      })
    });
    
    if (!response.ok) {
      throw new Error(`Tavily API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Format the search results
    let formattedResults = "";
    if (data.results && data.results.length > 0) {
      data.results.forEach((result, index) => {
        formattedResults += `[${index + 1}] ${result.title}\n`;
        formattedResults += `URL: ${result.url}\n`;
        formattedResults += `Content: ${result.content}\n\n`;
      });
    } else {
      formattedResults = "No relevant search results found.";
    }
    
    return formattedResults;
  } catch (error) {
    console.error('Error searching web:', error);
    return "Error searching the web. Proceeding without search results.";
  }
}

// Function to call the Gemini API
async function callGeminiAPI(message) {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a helpful and knowledgeable financial advisor. Please provide accurate and useful financial advice based on the following inquiry. 
                If you see web search results in the message, use that information to enhance your response and make it more accurate and up-to-date.
                
                User message: ${message}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract the response text
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('Unexpected Gemini API response structure:', data);
      return "I'm sorry, I couldn't generate a response at this time.";
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

// Simple Markdown renderer function (handles basic Markdown features)
function renderMarkdown(text) {
  // Handle bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Handle headers
  text = text.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  text = text.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  text = text.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  
  // Handle links
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Handle unordered lists
  text = text.replace(/^\* (.*?)$/gm, '<li>$1</li>');
  
  // Wrap list items in ul tags
  let inList = false;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<li>') && !inList) {
      lines[i] = '<ul>' + lines[i];
      inList = true;
    } else if (!lines[i].includes('<li>') && inList) {
      lines[i - 1] = lines[i - 1] + '</ul>';
      inList = false;
    }
  }
  if (inList) {
    lines[lines.length - 1] = lines[lines.length - 1] + '</ul>';
  }
  text = lines.join('\n');
  
  // Handle paragraphs and line breaks
  const paragraphs = text.split('\n\n');
  text = paragraphs.map(p => {
    if (p.trim() && !p.includes('<h') && !p.includes('<ul>')) {
      return `<p>${p}</p>`;
    }
    return p;
  }).join('\n');
  
  return text;
}
