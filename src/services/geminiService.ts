
import { toast } from 'sonner';
import { searchWeb } from './tavilyService';

const GEMINI_API_KEY = 'AIzaSyB-CXqCqmdcxv-WiaoNKa5mQpHw0n_A_aE';
// Updated API URL to use the Gemini 2.0 Flash-Lite model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-lite:generateContent';

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
}

export const generateFinancialAdvice = async (prompt: string, useWebSearch: boolean = false): Promise<string> => {
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

    const data: GeminiResponse = await response.json();
    
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
    toast.error('Failed to get response. Please try again.');
    throw error;
  }
};
