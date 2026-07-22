'use strict';

/**
 * Estimate tokens for a string using a lightweight heuristic specifically
 * tuned to simulate OpenAI (tiktoken) and Claude tokenization without dependencies.
 *
 * @param {string} text
 * @returns {number} estimated token count
 */
function estimateTokens(text) {
  if (!text || typeof text !== 'string') return 0;
  if (text.length === 0) return 0;

  // Tokenization heuristic matching word tokens, indentation, punctuation, and newlines
  const pattern = /[a-zA-Z0-9_-]+|[^\s\w]|\r?\n|\s{1,4}/g;
  const matches = text.match(pattern);

  if (!matches) {
    return Math.ceil(text.length / 4);
  }

  let tokens = 0;
  for (let i = 0; i < matches.length; i++) {
    const tokenStr = matches[i];
    if (tokenStr.length > 8 && /^[a-zA-Z0-9_-]+$/.test(tokenStr)) {
      // Long identifiers/words (>8 chars) split every ~4 chars
      tokens += Math.ceil(tokenStr.length / 4);
    } else {
      tokens += 1;
    }
  }

  return tokens;
}

/**
 * Calculate cost for estimated tokens.
 * Default pricing: GPT-4o input ($2.50 per 1,000,000 tokens = $0.0000025 / token).
 *
 * @param {number} tokens
 * @param {number} [pricePerMillion=2.50]
 * @returns {number} cost in USD
 */
function calculateCost(tokens, pricePerMillion = 2.50) {
  if (!tokens || tokens <= 0) return 0;
  return (tokens / 1000000) * pricePerMillion;
}

/**
 * Format a human-readable token and cost summary string.
 *
 * @param {number} tokens
 * @param {string} [modelName='GPT-4o']
 * @returns {string}
 */
function formatTokenSummary(tokens, modelName = 'GPT-4o') {
  const countStr = tokens.toLocaleString('en-US');
  const cost = calculateCost(tokens);
  let costStr;

  if (cost === 0) {
    costStr = '$0.00';
  } else if (cost < 0.0001) {
    costStr = '<$0.0001';
  } else {
    costStr = `$${cost.toFixed(4)}`;
  }

  return `Estimated Context Tokens: ${countStr} tokens (~${costStr} cost for ${modelName} input).`;
}

module.exports = {
  estimateTokens,
  calculateCost,
  formatTokenSummary,
};
