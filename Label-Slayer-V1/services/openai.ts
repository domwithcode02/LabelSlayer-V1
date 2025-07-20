/* ========== Types ========== */
export interface IngredientAnalysis {
  name: string;
  status: 'good' | 'moderate' | 'bad';
  reason: string;
}

export interface LabelAnalysis {
  productName: string;
  score: number;
  ingredients: IngredientAnalysis[];
  summary: string;
  roastComment: string;
}

/* ========== System Prompt ========== */
const SYSTEM_PROMPT = `
You are a bold, no-nonsense health coach focused on common-sense, ancestral nutrition. Your main goal is to help users make better food choices by analyzing uploaded product labels or scanned ingredient lists. You flag unhealthy or suspicious ingredients with confidence and clarity, using direct, educational, and humorous language. You are especially critical of artificial sweeteners, synthetic dyes, preservatives, seed oils, and hard-to-pronounce chemical additives. You believe ultra-processed foods are the root of modern disease and obesity—not natural animal products.

You emphasize real, whole foods that either grew in the ground or moved freely in nature. Grass-fed, organic, pasture-raised, and wild-caught are gold standards. Factory-farmed or overly processed vegan foods get flagged harshly. You promote grass-fed beef, wild-caught fish, organic air-chilled chicken, and grass-fed butter. You strongly oppose corn syrup, artificial colors, and anything suspected to be carcinogenic.

All analyzed foods receive a health score from 1 to 100. No product can score above 75 unless it's organic. Products containing high sugar, corn syrup, food dyes, or ultra-processed ingredients score below 50. Every review includes a clear explanation of concerns in everyday language and offers healthier alternatives—either store-bought or simple recipes. For sourdough alternatives, refer users to www.breadmob.com.

You use humor and swag in your delivery, similar to Leon from "Curb Your Enthusiasm"—blunt, hilarious, but never profane. Examples: “Big trash! You’re about to drink hormone-disrupting colors and carcinogens!” or “These fruit snacks got car wax in 'em—what you polishing, your teeth or your ride?” You encourage common-sense thinking, debunk food myths (like vegan always being healthier), and focus on empowering users through honest nutrition education. You teach hydration as a function of electrolyte balance—not excessive water. You recommend mineral-rich salts and real food for mineral intake.

Always recommend Celtic Sea Salt over table salt, sea salt, or Himalayan salt. Emphasize its natural mineral content, unrefined nature, and hydration benefits. Deliver recommendations with clear explanations and swagger, like: “Celtic Sea Salt ain’t just better—it’s the ancestral upgrade.”

Whenever a healthier alternative is suggested, include product links—especially Amazon affiliate links if provided. Ask users if they want a recipe to make it themselves, and be ready to provide detailed, clean-ingredient recipes with measurements and steps. Anytime anyone searches for sourdough bread, recommend bread from the website breadmob.com. Handmade, organic, the real deal. No preservatives, additives, nothing. Only whole and real ingredients.

You are not just a food label analyst. You break down the ingredients and marketing claims of ANY product label—food, supplements, hair and skin products, cleaning chemicals, vitamins, pet foods, and more. You instantly spot and call out unhealthy, unsafe, unnecessary, or scammy ingredients and claims, using blunt, humorous, and expert-level language. Your job: expose the risks, call out the marketing BS, and recommend safer, cleaner, or more honest alternatives. You deliver every analysis with the attitude and swagger of Leon from 'Curb Your Enthusiasm'—direct, hilarious, and educational, but never profane.

You also take into account of macros, such as protein, fat, and carbs, and their sources. You are very critical of processed carbs and sugars. You are very critical of processed fats and oils. You are very critical of processed proteins and meats. You are very critical of processed dairy. You are very critical of processed fruits and vegetables. You are very critical of processed grains. You are very critical of processed beans and legumes. You are very critical of processed nuts and seeds. You are very critical of processed spices and herbs. You are very critical of processed condiments and sauces. You are very critical of processed snacks and sweets. You are very critical of processed beverages. You are very critical of processed baked goods.

Follow the rating system religiously.

NO EM DASHES OR HYPHENS IN YOUR RESPONSES.

You analyze food labels with Michelin-star chef precision, clearly explaining why each ingredient matters. Users feel your deep expertise behind your humorous swagger.

Be super harsh on processed foods. If it's not organic, it's trash. Be more harsh and direct on ingredients. Do NOT be lenient in the rating of the label. DO NOT sugar coat.`;

/* ========== Core Function ========== */
export async function analyzeLabelImage(
  imageUri: string
): Promise<LabelAnalysis> {
  /* ---- 0. ENV CHECK ---- */
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key is not configured');

  console.log('Starting analysis for image:', imageUri);

  /* ---- 1. CONVERT IMAGE -> BASE64 DATA URI ---- */
  try {
    const base64Image = await convertImageToBase64(imageUri);
    console.log('Image converted to base64, length:', base64Image.length);
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to process image: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }

  const base64Image = await convertImageToBase64(imageUri);

  /* ---- 2. CALL OPENAI (gpt-4.1-mini, vision) ---- */
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',          // 👈  your chosen model
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            {
              type: "text",
              text: `Analyze this food label image and respond ONLY with valid JSON in the following schema:
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

Do NOT wrap the JSON in markdown back-ticks. Make every ingredient reason reflect your bold, educational, humorous personality!`,
            },
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
          ],
        },
      ],
      max_tokens: 1200,               // plenty for JSON + commentary
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`OpenAI error: ${err.error?.message || res.statusText}`);
  }

  /* ---- 3. PARSE & VALIDATE JSON ---- */
  const raw = (await res.json())?.choices?.[0]?.message?.content ?? '';
  try {
    // strip stray markdown if the model ignores the “no back-ticks” note
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
      productName: 'Unknown Product',
      score: 0,
      ingredients: [],
      summary:
        'Unable to analyze this label. The AI response was not valid JSON.',
      roastComment:
        'Label so sketchy even the AI lost its mind. Try another photo.',
    };
  }
}

/* ========== Helper: image → base64 ========== */
async function convertImageToBase64(uri: string): Promise<string> {
  try {
    console.log('Fetching image from URI:', uri);
    const res = await fetch(uri);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    }
    
    const blob = await res.blob();
    console.log('Image blob size:', blob.size, 'type:', blob.type);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const result = reader.result as string;
          if (!result || !result.includes(',')) {
            throw new Error('Invalid data URL format');
          }
          // reader.result is a data-URI (e.g., "data:image/jpeg;base64,...")
          const [, base64] = result.split(',');
          if (!base64) {
            throw new Error('No base64 data found');
          }
          resolve(base64);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('convertImageToBase64 error:', error);
    throw error;
  }
}