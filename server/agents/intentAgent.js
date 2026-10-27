/**
 * Agent 1: Preference Understanding & Intent Parser (Node.js)
 * Understands nuanced natural language criteria and converts them into
 * structured constraints and multi-store search queries.
 */

export class IntentUnderstandingAgent {
  constructor() {
    this.name = 'Preference Understanding Agent';
    this.role = 'Semantic Intent & Constraint Parser';
  }

  analyze(rawQuery) {
    const query = (rawQuery || '').toLowerCase().trim();
    const reasoning = [];

    // 1. Category Detection
    let category = 'laptops';
    let targetItem = 'laptop';

    if (/headphone|headphones|earbuds|anc|audio|sound/i.test(query)) {
      category = 'headphones';
      targetItem = 'noise cancelling headphones';
      reasoning.push("Detected category 'headphones' from query terms.");
    } else if (/monitor|display|screen|4k|ultrawide|panel/i.test(query)) {
      category = 'monitors';
      targetItem = '4K productivity monitor';
      reasoning.push("Detected category 'monitors' from query terms.");
    } else if (/laptop|ultrabook|notebook|macbook|thinkpad|computer/i.test(query)) {
      category = 'laptops';
      targetItem = 'lightweight ultrabook laptop';
      reasoning.push("Detected category 'laptops' from query terms.");
    } else {
      reasoning.push("Defaulted to 'laptops' based on specification query context.");
    }

    // 2. Budget Extraction
    let budgetMax = null;
    let budgetMin = null;

    const rangeMatch = query.match(/\$?(\d+)\s*(?:-|to|–)\s*\$?(\d+)/i);
    if (rangeMatch) {
      budgetMin = parseFloat(rangeMatch[1]);
      budgetMax = parseFloat(rangeMatch[2]);
      reasoning.push(`Extracted price range: $${budgetMin} - $${budgetMax}.`);
    } else {
      const underMatch = query.match(/(?:under|below|less\s+than|<|max(?:imum)?\s+of)\s*\$?(\d+(?:\.\d+)?)/i);
      if (underMatch) {
        budgetMax = parseFloat(underMatch[1]);
        reasoning.push(`Identified strict budget ceiling: $${budgetMax.toFixed(2)}.`);
      } else {
        const priceMatch = query.match(/\$(\d+(?:\.\d+)?)/);
        if (priceMatch) {
          budgetMax = parseFloat(priceMatch[1]);
          reasoning.push(`Inferred target budget: $${budgetMax.toFixed(2)}.`);
        }
      }
    }

    // 3. Nuances & Use-Cases
    const useCases = [];
    const priorities = {};
    const constraints = {};

    if (/code|coding|developer|programming|docker|python|software|terminal/i.test(query)) {
      useCases.push('software_engineering');
      priorities.ram = 'CRITICAL';
      priorities.cpu = 'HIGH';
      priorities.keyboard = 'HIGH';
      constraints.min_ram_gb = 16;
      constraints.recommended_cpus = ['M3', 'Core Ultra 7', 'Ryzen 7 PRO', 'Core Ultra 5'];
      reasoning.push("Flagged 'Coding/Dev' use-case: Enforced minimum 16GB RAM for containers/IDEs.");
    }

    if (/light|lightweight|portable|travel|commute|slim|thin/i.test(query)) {
      useCases.push('portability');
      priorities.weight = 'CRITICAL';
      constraints.max_weight_lbs = 3.2;
      reasoning.push("Detected 'Lightweight' requirement: Sub-3.2 lbs weight constraint enforced.");
    }

    if (/battery|all-day|long battery|runtime|hours/i.test(query)) {
      useCases.push('all_day_battery');
      priorities.battery = 'CRITICAL';
      constraints.min_battery_hours = 12.0;
      reasoning.push("Detected 'Great Battery Life': Requiring >= 12 hours tested runtime.");
    }

    if (/oled|screen|display|resolution|4k|color|retina/i.test(query)) {
      useCases.push('display_clarity');
      priorities.display = 'HIGH';
      reasoning.push('Prioritizing high resolution & eye-comfort panel for extended screen time.');
    }

    if (/noise|cancelling|anc|quiet|flight|plane|travel/i.test(query)) {
      useCases.push('anc_commute');
      priorities.anc = 'CRITICAL';
      reasoning.push('Prioritizing class-leading active noise cancellation for quiet focus.');
    }

    // 4. Generate targeted keywords
    const searchKeywords = [];
    if (category === 'laptops') {
      const base = 'lightweight ultrabook 16gb ram';
      if (budgetMax) searchKeywords.push(`${base} under ${Math.round(budgetMax)}`);
      searchKeywords.push('laptop long battery life coding');
      searchKeywords.push('portable developer laptop');
    } else if (category === 'headphones') {
      searchKeywords.push('wireless noise cancelling headphones anc');
      if (budgetMax) searchKeywords.push(`best anc headphones under ${Math.round(budgetMax)}`);
    } else if (category === 'monitors') {
      searchKeywords.push('4k uhd usb-c ips monitor coding');
      if (budgetMax) searchKeywords.push(`4k monitor under ${Math.round(budgetMax)}`);
    }

    return {
      rawQuery,
      category,
      targetItem,
      budgetMax,
      budgetMin,
      priorities,
      useCases,
      constraints,
      searchKeywords,
      confidenceScore: 0.96,
      reasoning
    };
  }
}
