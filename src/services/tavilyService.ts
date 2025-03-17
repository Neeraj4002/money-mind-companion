
import { toast } from 'sonner';

// This is your actual Tavily API key
const TAVILY_API_KEY = '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';

interface TavilySearchResponse {
  results: Array<{
    title: string;
    url: string;
    content: string;
  }>;
  query: string;
}

export const searchWeb = async (query: string): Promise<string> => {
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

    const data: TavilySearchResponse = await response.json();
    
    // Format search results to be more readable
    let formattedResults = `### Web Search Results for: "${data.query}"\n\n`;
    
    data.results.forEach((result, index) => {
      formattedResults += `**${index + 1}. [${result.title}](${result.url})**\n`;
      formattedResults += `${result.content.substring(0, 150)}...\n\n`;
    });

    return formattedResults;
  } catch (error) {
    console.error('Error searching the web:', error);
    toast.error('Failed to search the web. Please try again.');
    throw error;
  }
};
