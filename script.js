
// API Keys
const TAVILY_API_KEY = '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';
const GEMINI_API_KEY = 'AIzaSyB-CXqCqmdcxv-WiaoNKa5mQpHw0n_A_aE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent';

// DOM Elements
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const webSearchToggle = document.getElementById('webSearchToggle');
const toastContainer = document.getElementById('toastContainer');

// Initialize chat with welcome message
function initChat() {
  addMessage(
    "Hi! I'm your AI financial advisor. Ask me anything about finance, investments, or money management.",
    true
  );

  // Auto-resize textarea as user types
  messageInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    
    // Enable/disable button based on input
    if (this.value.trim()) {
      sendButton.removeAttribute('disabled');
    } else {
      sendButton.setAttribute('disabled', true);
    }
  });
  
  // Send message on button click
  sendButton.addEventListener('click', handleSendMessage);
  
  // Send message on Enter key (but allow Shift+Enter for new line)
  messageInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (this.value.trim()) {
        handleSendMessage();
      }
    }
  });
}

// Handle sending a message
async function handleSendMessage() {
  const message = messageInput.value.trim();
  const useWebSearch = webSearchToggle.checked;
  
  if (!message) return;
  
  // Add user message to chat
  addMessage(message, false);
  
  // Clear input and reset height
  messageInput.value = '';
  messageInput.style.height = 'auto';
  sendButton.setAttribute('disabled', true);
  
  // Add loading indicator
  const loadingElement = addLoadingIndicator();
  
  try {
    // If web search is enabled, show a toast
    if (useWebSearch) {
      showToast('Searching the web for relevant information...', 'info');
    }
    
    // Get AI response
    const response = await generateFinancialAdvice(message, useWebSearch);
    
    // Remove loading indicator
    loadingElement.remove();
    
    // Add AI response to chat
    addMessage(response, true);
    
    // Scroll to bottom
    scrollToBottom();
  } catch (error) {
    console.error('Failed to get AI response:', error);
    loadingElement.remove();
    showToast('Failed to get response. Please try again.', 'error');
  }
}

// Add a message to the chat
function addMessage(text, isAi) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isAi ? 'ai' : 'user'}`;
  
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  
  if (isAi) {
    // Convert markdown to HTML for AI messages
    messageContent.innerHTML = `<div class="markdown">${renderMarkdown(text)}</div>`;
  } else {
    messageContent.textContent = text;
  }
  
  messageDiv.appendChild(messageContent);
  chatContainer.appendChild(messageDiv);
  
  scrollToBottom();
}

// Add loading indicator
function addLoadingIndicator() {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message ai';
  
  const loadingContent = document.createElement('div');
  loadingContent.className = 'message-content';
  
  const dots = document.createElement('div');
  dots.className = 'loading-dots';
  
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dots.appendChild(dot);
  }
  
  loadingContent.appendChild(dots);
  loadingDiv.appendChild(loadingContent);
  chatContainer.appendChild(loadingDiv);
  
  scrollToBottom();
  return loadingDiv;
}

// Search the web using Tavily API
async function searchWeb(query) {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TAVILY_API_KEY}`
      },
      body: JSON.stringify({
        query: query,
        search_depth: "basic",
        include_domains: [],
        exclude_domains: [],
        max_results: 3
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Tavily API Error:', errorData);
      throw new Error(`API error: ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Format search results to be more readable
    let formattedResults = `### Web Search Results for: "${data.query}"\n\n`;
    
    data.results.forEach((result, index) => {
      formattedResults += `**${index + 1}. [${result.title}](${result.url})**\n`;
      formattedResults += `${result.content.substring(0, 150)}...\n\n`;
    });

    return formattedResults;
  } catch (error) {
    console.error('Error searching the web:', error);
    showToast('Failed to search the web. Please try again.', 'error');
    throw error;
  }
}

// Generate financial advice using Gemini API
async function generateFinancialAdvice(prompt, useWebSearch = false) {
  try {
    let webSearchResults = "";
    
    // If web search is enabled, perform a web search first
    if (useWebSearch && prompt.trim().length > 0) {
      try {
        webSearchResults = await searchWeb(prompt);
      } catch (error) {
        console.error("Web search failed:", error);
        webSearchResults = "Web search failed, but I'll still try to answer based on my knowledge.";
      }
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a financial advisor assistant. Provide helpful, accurate, and concise information about personal finance, investments, and money management. Format your responses using Markdown for better readability. Use **bold** for emphasis, headings for organization, and bullet points for lists.
                
                ${webSearchResults ? `Recent web search results on this topic:\n${webSearchResults}\n\nPlease incorporate these results in your response when relevant.` : ''}
                
                User query: ${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    // Check if the response was blocked for safety reasons
    if (data.promptFeedback?.blockReason) {
      return `I cannot provide information on that topic. ${data.promptFeedback.blockReason}`;
    }

    // Extract the response text
    if (data.candidates && data.candidates.length > 0) {
      const text = data.candidates[0].content.parts[0].text;
      return text;
    } else {
      throw new Error('No response generated');
    }
  } catch (error) {
    console.error('Error generating financial advice:', error);
    showToast('Failed to get response. Please try again.', 'error');
    throw error;
  }
}

// Simple markdown renderer
function renderMarkdown(text) {
  // Handle headings
  text = text.replace(/### (.*)/g, '<h3>$1</h3>');
  text = text.replace(/## (.*)/g, '<h2>$1</h2>');
  text = text.replace(/# (.*)/g, '<h1>$1</h1>');
  
  // Handle bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Handle italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Handle links
  text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
  
  // Handle unordered lists
  text = text.replace(/^\s*[\-\*]\s+(.*?)$/gm, '<li>$1</li>');
  text = text.replace(/<li>(.*?)<\/li>(\s*<li>)/g, '<li>$1</li><ul>$2');
  text = text.replace(/(<\/li>\s*)(?!<li>|<ul>)/g, '$1</ul>');
  
  // Handle paragraphs - split by newline and wrap in <p> if not already a block element
  const paragraphs = text.split('\n\n');
  text = paragraphs.map(p => {
    if (p.trim() === '') return '';
    if (p.match(/^<(h[1-6]|ul|ol|li|blockquote)/)) return p;
    return `<p>${p}</p>`;
  }).join('');
  
  return text;
}

// Show a toast notification
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  // Make the toast visible after a small delay (for animation)
  setTimeout(() => {
    toast.classList.add('visible');
  }, 10);
  
  // Remove the toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Scroll to the bottom of the chat
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Initialize the chat when the page loads
document.addEventListener('DOMContentLoaded', initChat);
