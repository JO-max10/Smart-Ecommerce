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

    // 1. Category Detection across all domains
    let category = 'all';
    let targetItem = 'all products';

    if (/dress|dresses|fashion|kurta|anarkali|ethnic|clothing|saree|outfit|wear|libas/i.test(query)) {
      category = 'fashion';
      targetItem = 'ethnic dress & kurta set';
      reasoning.push("Detected category 'fashion' (dresses & ethnic wear).");
    } else if (/decor|decoration|vase|vases|curtain|curtains|living\s*room|aesthetic|interior|nestasia/i.test(query)) {
      category = 'home_decor';
      targetItem = 'modern home decor & ceramic vases';
      reasoning.push("Detected category 'home_decor' (vases & aesthetic living room items).");
    } else if (/kitchen|home\s*product|air\s*fryer|fryer|cooking|cooktop|appliance|appliances|vacuum|philips/i.test(query)) {
      category = 'home_kitchen';
      targetItem = 'home appliances & digital air fryer';
      reasoning.push("Detected category 'home_kitchen' (appliances & kitchen essentials).");
    } else if (/phone|phones|smartphone|smartphones|mobile|iphone|samsung|galaxy/i.test(query)) {
      category = 'smartphones';
      targetItem = 'flagship 5G smartphone';
      reasoning.push("Detected category 'smartphones' (flagship mobile devices).");
    } else if (/watch|watches|smartwatch|smartwatches|apple\s*watch/i.test(query)) {
      category = 'smartwatches';
      targetItem = 'smartwatch with health sensors';
      reasoning.push("Detected category 'smartwatches' (fitness & health tracking).");
    } else if (/headphone|headphones|earbuds|anc|audio|sound|sony/i.test(query)) {
      category = 'headphones';
      targetItem = 'noise cancelling headphones';
      reasoning.push("Detected category 'headphones' (ANC audio).");
    } else if (/monitor|monitors|display|screen|4k|ultrawide|panel|dell/i.test(query)) {
      category = 'monitors';
      targetItem = '4K productivity monitor';
      reasoning.push("Detected category 'monitors' (4K display & USB-C hub).");
    } else if (/laptop|laptops|ultrabook|notebook|macbook|thinkpad|zenbook|computer/i.test(query)) {
      category = 'laptops';
      targetItem = 'ultrabook laptop';
      reasoning.push("Detected category 'laptops' (portable computing).");
    } else {
      category = 'all';
      targetItem = 'all products';
      reasoning.push("Catalog-wide multi-category search enabled across Fashion, Home Decor, Kitchen, and Electronics.");
    }

    // 2. INR Budget Extraction (₹, Rs, INR, k, or standard numbers)
    let budgetMax = null;
    let budgetMin = null;

    const parseNum = (str, isK) => {
      let n = parseFloat(str.replace(/,/g, ''));
      if (isK) n *= 1000;
      return n;
    };

    const rangeMatch = query.match(/(?:₹|rs\.?|inr|\$)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k)?\s*(?:-|to|–)\s*(?:₹|rs\.?|inr|\$)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k)?/i);
    if (rangeMatch) {
      budgetMin = parseNum(rangeMatch[1], !!rangeMatch[2]);
      budgetMax = parseNum(rangeMatch[3], !!rangeMatch[4]);
      reasoning.push(`Extracted price range: ₹${budgetMin.toLocaleString('en-IN')} - ₹${budgetMax.toLocaleString('en-IN')}.`);
    } else {
      const underMatch = query.match(/(?:under|below|less\s+than|<|max(?:imum)?\s+of)\s*(?:₹|rs\.?|inr|\$)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|lakh)?/i);
      if (underMatch) {
        let val = parseFloat(underMatch[1].replace(/,/g, ''));
        const unit = (underMatch[2] || '').toLowerCase();
        if (unit === 'k') val *= 1000;
        if (unit === 'lakh') val *= 100000;
        budgetMax = val;
        reasoning.push(`Identified target budget ceiling: ₹${budgetMax.toLocaleString('en-IN')}.`);
      } else {
        const inrMatch = query.match(/(?:₹|rs\.?|inr)\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(k|lakh)?/i);
        if (inrMatch) {
          let val = parseFloat(inrMatch[1].replace(/,/g, ''));
          const unit = (inrMatch[2] || '').toLowerCase();
          if (unit === 'k') val *= 1000;
          if (unit === 'lakh') val *= 100000;
          budgetMax = val;
          reasoning.push(`Inferred target budget: ₹${budgetMax.toLocaleString('en-IN')}.`);
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
      constraints.min_ram_gb = 16;
      reasoning.push("Flagged 'Coding/Dev': Enforced minimum 16GB RAM for containers/IDEs.");
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

    if (/wedding|festive|party|ethnic|traditional/i.test(query)) {
      useCases.push('festive_wear');
      priorities.aesthetic = 'CRITICAL';
      reasoning.push("Prioritizing festive embroidery, premium fabric blend and complete ethnic set.");
    }

    if (/minimal|scandinavian|nordic|aesthetic|living\s*room/i.test(query)) {
      useCases.push('home_aesthetic');
      priorities.decor = 'HIGH';
      reasoning.push("Prioritizing Scandinavian minimalist ceramic decor for home living.");
    }

    if (/healthy|oil\s*free|crispy|family/i.test(query)) {
      useCases.push('healthy_cooking');
      priorities.capacity = 'HIGH';
      reasoning.push("Prioritizing Rapid Air 90% less oil healthy cooking appliances.");
    }

    // 4. Generate targeted keywords for Indian stores (Flipkart, Amazon, Meesho, Croma, Myntra)
    const searchKeywords = [];
    if (category === 'fashion') {
      searchKeywords.push('libas women embroidered anarkali kurta set meesho flipkart');
      if (budgetMax) searchKeywords.push(`women dress under ₹${budgetMax}`);
    } else if (category === 'home_decor') {
      searchKeywords.push('nestasia ceramic minimalist donut vase set home decor meesho amazon');
      if (budgetMax) searchKeywords.push(`home decor vase under ₹${budgetMax}`);
    } else if (category === 'home_kitchen') {
      searchKeywords.push('philips digital air fryer rapid air technology flipkart amazon');
      if (budgetMax) searchKeywords.push(`kitchen air fryer under ₹${budgetMax}`);
    } else if (category === 'smartphones') {
      searchKeywords.push('apple iphone 16 pro 256gb desert titanium flipkart amazon meesho');
      searchKeywords.push('samsung galaxy s25 ultra 512gb smallest price');
    } else if (category === 'smartwatches') {
      searchKeywords.push('apple watch series 10 46mm gps flipkart amazon');
    } else if (category === 'headphones') {
      searchKeywords.push('sony wh 1000xm5 wireless anc headphones flipkart amazon');
    } else if (category === 'monitors') {
      searchKeywords.push('dell ultrasharp 27 4k usb c hub monitor u2723qe');
    } else if (category === 'laptops') {
      searchKeywords.push('apple macbook air m3 16gb 512gb flipkart amazon');
      searchKeywords.push('lenovo thinkpad x1 carbon gen 12 32gb');
      searchKeywords.push('asus zenbook 14 oled ultra 7');
    } else {
      searchKeywords.push('smallest price deals across flipkart amazon meesho croma myntra');
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
