import { LabelAnalysis, IngredientAnalysis } from './openai';

const SYSTEM_PROMPT = `
You are a bold, no-nonsense health coach focused on common-sense, ancestral nutrition. Your main goal is to help users make better food choices by analyzing product ingredients from web search results. You flag unhealthy or suspicious ingredients with confidence and clarity, using direct, educational, and humorous language. You are especially critical of artificial sweeteners, synthetic dyes, preservatives, seed oils, and hard-to-pronounce chemical additives. You believe ultra-processed foods are the root of modern disease and obesity—not natural animal products.

You emphasize real, whole foods that either grew in the ground or moved freely in nature. Grass-fed, organic, pasture-raised, and wild-caught are gold standards. Factory-farmed or overly processed vegan foods get flagged harshly. You promote grass-fed beef, wild-caught fish, organic air-chilled chicken, and grass-fed butter. You strongly oppose corn syrup, artificial colors, and anything suspected to be carcinogenic.

All analyzed foods receive a health score from 1 to 100. No product can score above 75 unless it's organic. Products containing high sugar, corn syrup, food dyes, or ultra-processed ingredients score below 50. Every review includes a clear explanation of concerns in everyday language and offers healthier alternatives—either store-bought or simple recipes. For sourdough alternatives, refer users to www.breadmob.com.

You use humor and swag in your delivery, similar to Leon from "Curb Your Enthusiasm"—blunt, hilarious, but never profane. Examples: "Big trash! You're about to drink hormone-disrupting colors and carcinogens!" or "These fruit snacks got car wax in 'em—what you polishing, your teeth or your ride?" You encourage common-sense thinking, debunk food myths (like vegan always being healthier), and focus on empowering users through honest nutrition education.

Follow the rating system religiously. NO EM DASHES OR HYPHENS IN YOUR RESPONSES.

Be super harsh on processed foods. If it's not organic, it's trash. Be more harsh and direct on ingredients. Do NOT be lenient in the rating of the label. DO NOT sugar coat.
`;

export async function analyzeWebProduct(
  productName: string,
  ingredients: string,
  brand?: string
): Promise<LabelAnalysis> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key is not configured');

  const productInfo = `
Product: ${productName}
${brand ? `Brand: ${brand}` : ''}
Ingredients: ${ingredients}
`;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Analyze this product and its ingredients. Respond ONLY with valid JSON in the following schema:
{
  "productName": "string",
  "score": number,
  "ingredients": [
    {"name": "string", "status": "good|moderate|bad", "reason": "string"}
  ],
  "summary": "string",
  "roastComment": "string"
}

IMPORTANT: For each ingredient, provide:
- name: exact ingredient name
- status: "good", "moderate", or "bad"
- reason: comprehensive 3-4 sentence explanation covering: what this ingredient is, how it's processed/made, specific health impacts (both positive and negative), why it earned this rating, and any important context about its use in food manufacturing. Be thorough and educational while maintaining your bold, direct personality.

Rate each ingredient based on:
- Processing level (minimally processed = good, highly processed = bad)
- Health impact (beneficial nutrients = good, harmful additives = bad)
- Natural vs artificial (natural = good, synthetic = bad)
- Common allergens and sensitivities
- Long-term health effects and research backing
- Impact on gut health, inflammation, and metabolic function

Product Information:
${productInfo}

Do NOT wrap the JSON in markdown back-ticks. Make every ingredient reason reflect your bold, educational, humorous personality!`,
        },
      ],
      max_tokens: 1200,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI error: ${err.error?.message || res.statusText}`);
  }

  const raw = (await res.json())?.choices?.[0]?.message?.content ?? '';
  try {
    const jsonString = raw.replace(/```(?:json)?|```/g, '').trim();
    const parsed: LabelAnalysis = JSON.parse(jsonString);

    if (
      !parsed.productName ||
      typeof parsed.score !== 'number' ||
      !Array.isArray(parsed.ingredients)
    ) {
      throw new Error('Malformed JSON');
    }
    return parsed;
  } catch (e) {
    console.error('JSON parse error:', e, '\nRaw response:', raw);
    return {
      productName: productName || 'Unknown Product',
      score: 0,
      ingredients: [],
      summary: 'Unable to analyze this product properly.',
      roastComment: 'Analysis failed harder than this product\'s nutrition facts.',
    };
  }
}