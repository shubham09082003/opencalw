#!/usr/bin/env node

/**
 * SerpAPI Search Tool for OpenClaw
 * 
 * Usage:
 *   node serpapi.js search "query" [--location "India"] [--gl "in"] [--hl "en"]
 *   node serpapi.js shopping "product name" [--location "India"] [--gl "in"]
 * 
 * Environment:
 *   SERPAPI_KEY - Your SerpAPI API key (required)
 */

const https = require('https');
const { URL } = require('url');

// Get API key from environment
const SERPAPI_KEY = process.env.SERPAPI_KEY;

if (!SERPAPI_KEY) {
  console.error('Error: SERPAPI_KEY environment variable not set');
  console.error('Get your API key from https://serpapi.com');
  process.exit(1);
}

/**
 * Make HTTP GET request to SerpAPI
 */
function serpApiRequest(params) {
  return new Promise((resolve, reject) => {
    params.api_key = SERPAPI_KEY;
    params.source = 'openclaw';
    
    const queryString = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    const url = `https://serpapi.com/search?${queryString}`;
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    }).on('error', (e) => {
      reject(new Error(`Request failed: ${e.message}`));
    });
  });
}

/**
 * Format shopping results for readable output
 */
function formatShoppingResults(results) {
  if (!results.shopping_results || results.shopping_results.length === 0) {
    return 'No shopping results found.';
  }
  
  const items = results.shopping_results.slice(0, 10).map((item, i) => {
    const parts = [
      `${i + 1}. **${item.title || 'Unknown Product'}**`,
      item.price ? `   💰 Price: ${item.price}` : '',
      item.extracted_price ? `   📊 Extracted: ${item.extracted_price} ${item.currency || ''}` : '',
      item.source ? `   🏪 Store: ${item.source}` : '',
      item.link ? `   🔗 Link: ${item.link}` : '',
      item.rating ? `   ⭐ Rating: ${item.rating}` : '',
      item.reviews ? `   📝 Reviews: ${item.reviews}` : '',
      item.delivery ? `   🚚 Delivery: ${item.delivery}` : '',
    ].filter(Boolean);
    
    return parts.join('\n');
  });
  
  return `## Shopping Results\n\n${items.join('\n\n')}`;
}

/**
 * Format web search results for readable output
 */
function formatSearchResults(results) {
  const output = [];
  
  // Organic results
  if (results.organic_results && results.organic_results.length > 0) {
    const items = results.organic_results.slice(0, 8).map((item, i) => {
      const parts = [
        `${i + 1}. **${item.title || 'No Title'}**`,
        item.snippet ? `   ${item.snippet}` : '',
        item.link ? `   🔗 ${item.link}` : '',
      ].filter(Boolean);
      return parts.join('\n');
    });
    output.push(`## Web Results\n\n${items.join('\n\n')}`);
  }
  
  // Knowledge graph (if present)
  if (results.knowledge_graph) {
    const kg = results.knowledge_graph;
    const parts = [];
    if (kg.title) parts.push(`**${kg.title}**`);
    if (kg.type) parts.push(`Type: ${kg.type}`);
    if (kg.description) parts.push(kg.description);
    output.push(`## Knowledge Graph\n\n${parts.join('\n')}`);
  }
  
  // Answer box (if present)
  if (results.answer_box) {
    const ab = results.answer_box;
    if (ab.answer) {
      output.push(`## Quick Answer\n\n${ab.answer}`);
    } else if (ab.snippet) {
      output.push(`## Quick Answer\n\n${ab.snippet}`);
    }
  }
  
  if (output.length === 0) {
    return 'No results found.';
  }
  
  return output.join('\n\n');
}

/**
 * Main CLI
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
SerpAPI Search Tool

Usage:
  node serpapi.js search "query" [options]
  node serpapi.js shopping "product" [options]

Commands:
  search    General web search
  shopping  Shopping/price search

Options:
  --location "Location"  Location for localized results (e.g., "India")
  --gl "code"           Country code (e.g., "in" for India, "us" for USA)
  --hl "code"           Language code (e.g., "en", "hi")
  --num N               Number of results (default: 10)

Examples:
  node serpapi.js shopping "iPhone 16" --location "India" --gl "in"
  node serpapi.js search "best laptops 2024" --gl "us"
`);
    process.exit(0);
  }
  
  const command = args[0];
  let query = args[1];
  
  // Parse options
  const options = {};
  for (let i = 2; i < args.length; i += 2) {
    if (args[i].startsWith('--')) {
      options[args[i].slice(2)] = args[i + 1];
    }
  }
  
  // Build API params
  const params = {
    q: query,
  };
  
  if (options.location) params.location = options.location;
  if (options.gl) params.gl = options.gl;
  if (options.hl) params.hl = options.hl;
  if (options.num) params.num = parseInt(options.num, 10);
  
  try {
    let results;
    let output;
    
    if (command === 'shopping') {
      params.tbm = 'shop'; // Shopping search
      results = await serpApiRequest(params);
      output = formatShoppingResults(results);
    } else {
      results = await serpApiRequest(params);
      output = formatSearchResults(results);
    }
    
    console.log(output);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();