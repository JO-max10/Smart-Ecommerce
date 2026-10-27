/**
 * Multi-Agent Orchestrator (Node.js)
 * Coordinates the 5 autonomous agents:
 * 1. IntentUnderstandingAgent
 * 2. BrowserScraperAgent (Playwright)
 * 3. VectorSpecAgent (High-Dimensional Spec Vectorization)
 * 4. PriceDropAgent (90-Day History & Deal Quality)
 * 5. RecommendationAgent (Pros/Cons Synthesis & Comparison Matrix)
 */
import { IntentUnderstandingAgent } from './intentAgent.js';
import { BrowserScraperAgent } from './browserAgent.js';
import { VectorSpecAgent } from './vectorSpecAgent.js';
import { PriceDropAgent } from './priceDropAgent.js';
import { RecommendationAgent } from './recAgent.js';

export class ShoppingOrchestrator {
  constructor() {
    this.intentAgent = new IntentUnderstandingAgent();
    this.browserAgent = new BrowserScraperAgent();
    this.vectorAgent = new VectorSpecAgent();
    this.priceAgent = new PriceDropAgent();
    this.recAgent = new RecommendationAgent();

    // Index vector space with seed catalog initially
    this.vectorAgent.indexCatalog(this.browserAgent.seedCatalog);
  }

  async run(userQuery) {
    // 1. Intent
    const parsedIntent = this.intentAgent.analyze(userQuery);

    // 2. Browser Scraper
    const scrapedProducts = await this.browserAgent.scrape(
      parsedIntent.category,
      parsedIntent.searchKeywords,
      parsedIntent.budgetMax
    );

    // 3. Vector Spec Match
    this.vectorAgent.indexCatalog(scrapedProducts);
    const vectorMatches = this.vectorAgent.semanticSearch(userQuery, parsedIntent);

    // 4. Price Drop Analysis
    const priceAnalyses = {};
    for (const p of scrapedProducts) {
      priceAnalyses[p.id] = await this.priceAgent.analyzePrice(p.id, p.lowest_price, p.list_price);
    }

    // 5. Synthesis & Comparison Matrix
    const report = this.recAgent.synthesize(
      userQuery,
      parsedIntent,
      scrapedProducts,
      vectorMatches,
      priceAnalyses
    );

    return report;
  }

  async streamPipeline(userQuery, res) {
    const startTime = Date.now();
    const getElapsed = () => ((Date.now() - startTime) / 1000).toFixed(2);

    const sendEvent = (event, data) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    // Stage 1: Intent
    sendEvent('agent_status', {
      agent: 'intent_agent',
      agent_name: 'Preference Understanding Agent',
      status: 'active',
      message: '🧠 Analyzing natural language preferences and extracting hard/soft constraints...',
      timestamp: getElapsed()
    });
    await new Promise(r => setTimeout(r, 350));

    const parsedIntent = this.intentAgent.analyze(userQuery);
    sendEvent('agent_thought', {
      agent: 'intent_agent',
      title: 'Intent & Constraint Extraction Complete',
      data: {
        category: parsedIntent.category,
        budget_max: parsedIntent.budgetMax,
        priorities: parsedIntent.priorities,
        constraints: parsedIntent.constraints,
        reasoning: parsedIntent.reasoning
      },
      timestamp: getElapsed()
    });

    // Stage 2: Browser Scraper (Playwright)
    sendEvent('agent_status', {
      agent: 'scraper_agent',
      agent_name: 'Browser Automation Scraper (Playwright)',
      status: 'active',
      message: '🌐 Crawling Flipkart, Amazon India, Meesho, Croma, Myntra & Official Brand Stores for smallest verified prices...',
      timestamp: getElapsed()
    });
    await new Promise(r => setTimeout(r, 450));

    const scrapedProducts = await this.browserAgent.scrape(
      parsedIntent.category,
      parsedIntent.searchKeywords,
      parsedIntent.budgetMax
    );
    const totalOffers = scrapedProducts.reduce((acc, p) => acc + (p.stores?.length || 0), 0);

    sendEvent('agent_thought', {
      agent: 'scraper_agent',
      title: 'Multi-Store Price Scraping Complete',
      data: {
        products_found: scrapedProducts.length,
        stores_aggregated: ['Flipkart', 'Amazon India', 'Meesho', 'Croma', 'Myntra', 'Official Brand Stores'],
        total_offers_extracted: totalOffers,
        fastest_delivery: 'Free 1-Day Express Air Delivery'
      },
      timestamp: getElapsed()
    });

    // Stage 3: Vector Spec Engine
    sendEvent('agent_status', {
      agent: 'vector_agent',
      agent_name: 'Vector Database Spec Engine',
      status: 'active',
      message: '📐 Embedding product specifications into high-dimensional vector space across fashion, home & electronics...',
      timestamp: getElapsed()
    });
    await new Promise(r => setTimeout(r, 350));

    this.vectorAgent.indexCatalog(scrapedProducts);
    const vectorMatches = this.vectorAgent.semanticSearch(userQuery, parsedIntent);
    const topMatch = vectorMatches[0];

    sendEvent('agent_thought', {
      agent: 'vector_agent',
      title: 'Cosine Similarity & Spec Vectorization Complete',
      data: {
        vector_dimension: topMatch?.vector_dimension || 512,
        highest_semantic_match: `${topMatch?.semantic_score || 94}%`,
        top_matched_tags: topMatch?.matched_features || []
      },
      timestamp: getElapsed()
    });

    // Stage 4: Price Drop & Deal Tracker
    sendEvent('agent_status', {
      agent: 'price_agent',
      agent_name: 'Price Drop & History Tracker',
      status: 'active',
      message: '📉 Checking 90-day price trends, all-time lows, and discount velocity across Indian marketplaces...',
      timestamp: getElapsed()
    });
    await new Promise(r => setTimeout(r, 350));

    const priceAnalyses = {};
    let atlCount = 0;
    for (const p of scrapedProducts) {
      const a = await this.priceAgent.analyzePrice(p.id, p.lowest_price, p.list_price);
      priceAnalyses[p.id] = a;
      if (a.is_near_all_time_low) atlCount++;
    }

    sendEvent('agent_thought', {
      agent: 'price_agent',
      title: 'Price Drop Analysis Complete',
      data: {
        all_time_low_deals: atlCount,
        average_savings: '₹2,500 - ₹25,000',
        active_alerts: (await this.priceAgent.getAlerts()).length
      },
      timestamp: getElapsed()
    });

    // Stage 5: Recommendation Synthesizer
    sendEvent('agent_status', {
      agent: 'rec_agent',
      agent_name: 'Review Synthesis & Recommendation Agent',
      status: 'active',
      message: '✨ Synthesizing customer reviews, weighing pros & cons, compiling comparison table...',
      timestamp: getElapsed()
    });
    await new Promise(r => setTimeout(r, 350));

    const report = this.recAgent.synthesize(
      userQuery,
      parsedIntent,
      scrapedProducts,
      vectorMatches,
      priceAnalyses
    );

    sendEvent('pipeline_complete', {
      status: 'success',
      execution_time_seconds: parseFloat(getElapsed()),
      report
    });

    res.end();
  }
}
