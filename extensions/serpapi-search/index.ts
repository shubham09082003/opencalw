/**
 * SerpAPI Search Plugin for OpenClaw
 * 
 * Provides tools for:
 * - serpapi_shopping: Search for product prices and shopping results
 * - serpapi_search: General web search with structured results
 * 
 * Setup:
 * 1. Get API key from https://serpapi.com (free tier: 100 searches/month)
 * 2. Set SERPAPI_KEY environment variable OR configure in openclaw.json:
 *    "plugins": { "entries": { "serpapi-search": { "enabled": true, "config": { "apiKey": "your-key" } } } }
 */

const SERPAPI_BASE_URL = "https://serpapi.com/search";
const TIMEOUT_MS = 15_000;

interface SerpApiConfig {
  apiKey?: string;
  defaultGl?: string;
  defaultLocation?: string;
  maxResults?: number;
}

interface ShoppingResult {
  position: number;
  title: string;
  link?: string;
  product_link?: string;
  source?: string;
  price?: string;
  extracted_price?: number;
  currency?: string;
  thumbnail?: string;
  image?: string;
  rating?: number;
  reviews?: number;
  delivery?: string;
}

interface OrganicResult {
  position: number;
  title: string;
  link: string;
  snippet?: string;
  displayed_link?: string;
}

interface KnowledgeGraph {
  title?: string;
  type?: string;
  description?: string;
  source?: { name: string; link: string };
}

interface AnswerBox {
  type?: string;
  answer?: string;
  snippet?: string;
  title?: string;
}

interface SerpApiSearchResponse {
  shopping_results?: ShoppingResult[];
  organic_results?: OrganicResult[];
  knowledge_graph?: KnowledgeGraph;
  answer_box?: AnswerBox;
  error?: string;
}

function getApiKey(config: SerpApiConfig): string {
  // Check plugin config first, then environment variable
  const key = config?.apiKey || process.env.SERPAPI_KEY;
  if (!key) {
    throw new Error(
      "SerpAPI key required. Set SERPAPI_KEY environment variable or configure apiKey in plugin config."
    );
  }
  return key;
}

async function serpApiRequest(
  params: Record<string, string | number>,
  config: SerpApiConfig = {},
  signal?: AbortSignal
): Promise<SerpApiSearchResponse> {
  const apiKey = getApiKey(config);
  
  const url = new URL(SERPAPI_BASE_URL);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("source", "openclaw");
  
  // Apply defaults
  if (config?.defaultGl && !params.gl) {
    url.searchParams.set("gl", config.defaultGl);
  }
  if (config?.defaultLocation && !params.location) {
    url.searchParams.set("location", config.defaultLocation);
  }
  
  // Add params
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  if (signal) {
    signal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  
  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "GET",
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error(`SerpAPI request timed out after ${TIMEOUT_MS}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
  
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 401) {
      throw new Error("SerpAPI authentication failed. Check your API key.");
    }
    if (response.status === 429) {
      throw new Error("SerpAPI rate limit exceeded. Consider upgrading your plan.");
    }
    throw new Error(`SerpAPI error (${response.status}): ${body}`);
  }
  
  return response.json();
}

function formatShoppingResults(results: ShoppingResult[], maxResults: number): string {
  if (!results || results.length === 0) {
    return "No shopping results found.";
  }
  
  const items = results.slice(0, maxResults).map((item, i) => {
    const parts: string[] = [];
    
    parts.push(`${i + 1}. **${item.title || "Unknown Product"}**`);
    
    if (item.price) {
      let priceLine = `   💰 Price: ${item.price}`;
      if (item.extracted_price) {
        priceLine += ` (${item.extracted_price} ${item.currency || ""})`;
      }
      parts.push(priceLine);
    }
    
    if (item.source) {
      parts.push(`   🏪 Store: ${item.source}`);
    }
    
    if (item.rating) {
      const reviewCount = item.reviews ? ` (${item.reviews} reviews)` : "";
      parts.push(`   ⭐ Rating: ${item.rating}${reviewCount}`);
    }
    
    if (item.delivery) {
      parts.push(`   🚚 Delivery: ${item.delivery}`);
    }
    
    if (item.link || item.product_link) {
      parts.push(`   🔗 Link: ${item.link || item.product_link}`);
    }
    
    return parts.join("\n");
  });
  
  return `## 🛒 Shopping Results\n\n${items.join("\n\n")}`;
}

function formatSearchResults(
  organic: OrganicResult[] | undefined,
  kg: KnowledgeGraph | undefined,
  answer: AnswerBox | undefined,
  maxResults: number
): string {
  const output: string[] = [];
  
  // Answer box (quick answer)
  if (answer) {
    if (answer.answer) {
      output.push(`## 💡 Quick Answer\n\n${answer.answer}`);
      if (answer.title) {
        output[output.length - 1] += `\n\n_Source: ${answer.title}_`;
      }
    } else if (answer.snippet) {
      output.push(`## 💡 Quick Answer\n\n${answer.snippet}`);
    }
  }
  
  // Knowledge graph
  if (kg) {
    const kgParts: string[] = [];
    if (kg.title) {
      let title = `**${kg.title}**`;
      if (kg.type) title += ` (${kg.type})`;
      kgParts.push(title);
    }
    if (kg.description) {
      kgParts.push(kg.description);
    }
    if (kgParts.length > 0) {
      output.push(`## 📚 Knowledge Graph\n\n${kgParts.join("\n\n")}`);
    }
  }
  
  // Organic results
  if (organic && organic.length > 0) {
    const items = organic.slice(0, maxResults).map((item, i) => {
      const parts: string[] = [];
      parts.push(`${i + 1}. **${item.title || "No Title"}**`);
      if (item.snippet) {
        parts.push(`   ${item.snippet}`);
      }
      if (item.link) {
        parts.push(`   🔗 ${item.link}`);
      }
      return parts.join("\n");
    });
    output.push(`## 🔍 Web Results\n\n${items.join("\n\n")}`);
  }
  
  if (output.length === 0) {
    return "No results found.";
  }
  
  return output.join("\n\n");
}

/**
 * Shopping search tool
 */
async function executeShoppingSearch(
  _toolCallId: string,
  params: { query: string; location?: string; gl?: string; hl?: string; num?: number },
  config: SerpApiConfig = {},
  signal?: AbortSignal
) {
  const query = params.query?.trim();
  if (!query) {
    throw new Error("query parameter is required");
  }
  
  const maxResults = params.num || config?.maxResults || 10;
  
  const searchParams: Record<string, string | number> = {
    q: query,
    tbm: "shop", // Shopping search
  };
  
  if (params.location) searchParams.location = params.location;
  if (params.gl) searchParams.gl = params.gl;
  if (params.hl) searchParams.hl = params.hl;
  
  const results = await serpApiRequest(searchParams, config, signal);
  
  if (results.error) {
    throw new Error(`SerpAPI error: ${results.error}`);
  }
  
  const text = formatShoppingResults(results.shopping_results || [], maxResults);
  
  return { content: [{ type: "text" as const, text }] };
}

/**
 * Web search tool
 */
async function executeWebSearch(
  _toolCallId: string,
  params: { query: string; location?: string; gl?: string; hl?: string; num?: number },
  config: SerpApiConfig = {},
  signal?: AbortSignal
) {
  const query = params.query?.trim();
  if (!query) {
    throw new Error("query parameter is required");
  }
  
  const maxResults = params.num || config?.maxResults || 10;
  
  const searchParams: Record<string, string | number> = {
    q: query,
  };
  
  if (params.location) searchParams.location = params.location;
  if (params.gl) searchParams.gl = params.gl;
  if (params.hl) searchParams.hl = params.hl;
  
  const results = await serpApiRequest(searchParams, config, signal);
  
  if (results.error) {
    throw new Error(`SerpAPI error: ${results.error}`);
  }
  
  const text = formatSearchResults(
    results.organic_results,
    results.knowledge_graph,
    results.answer_box,
    maxResults
  );
  
  return { content: [{ type: "text" as const, text }] };
}

/**
 * Plugin registration
 */
const serpApiPlugin = {
  id: "serpapi-search",
  name: "SerpAPI Search",
  description: "Search Google with SerpAPI for prices, shopping results, and web search",
  configSchema: {
    parse: (v: unknown): SerpApiConfig => {
      if (typeof v === "object" && v !== null) {
        return v as SerpApiConfig;
      }
      return {};
    },
  },
  register(api: any, config: SerpApiConfig) {
    // Shopping search tool
    api.registerTool({
      name: "serpapi_shopping",
      label: "SerpAPI Shopping Search",
      description:
        "Search for product prices and shopping results using SerpAPI. " +
        "Use when the user asks about product prices, wants to compare prices, or is shopping online. " +
        "Returns structured shopping results with price, store, rating, and link. " +
        "Parameters: query (required), location (optional, e.g., 'India'), gl (optional, country code like 'in' or 'us'), " +
        "hl (optional, language code like 'en'), num (optional, max results, default 10).",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The product to search for (e.g., 'iPhone 16', 'Samsung Galaxy S24')"
          },
          location: {
            type: "string",
            description: "Location for localized results (e.g., 'India', 'New York')"
          },
          gl: {
            type: "string",
            description: "Country code for Google domain (e.g., 'in' for India, 'us' for USA)"
          },
          hl: {
            type: "string",
            description: "Language code (e.g., 'en' for English, 'hi' for Hindi)"
          },
          num: {
            type: "number",
            description: "Maximum number of results to return (default: 10)"
          }
        },
        required: ["query"],
      },
      execute: (toolCallId: string, params: any, signal?: AbortSignal) =>
        executeShoppingSearch(toolCallId, params, config, signal),
    });
    
    // Web search tool
    api.registerTool({
      name: "serpapi_search",
      label: "SerpAPI Web Search",
      description:
        "Search the web using SerpAPI with structured results. " +
        "Returns organic results, knowledge graph, and answer box when available. " +
        "Use for general web searches when you need current information. " +
        "Parameters: query (required), location (optional), gl (optional, country code), " +
        "hl (optional, language code), num (optional, max results, default 10).",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query"
          },
          location: {
            type: "string",
            description: "Location for localized results"
          },
          gl: {
            type: "string",
            description: "Country code for Google domain (e.g., 'in' for India, 'us' for USA)"
          },
          hl: {
            type: "string",
            description: "Language code (e.g., 'en' for English)"
          },
          num: {
            type: "number",
            description: "Maximum number of results to return (default: 10)"
          }
        },
        required: ["query"],
      },
      execute: (toolCallId: string, params: any, signal?: AbortSignal) =>
        executeWebSearch(toolCallId, params, config, signal),
    });
  },
};

export default serpApiPlugin;