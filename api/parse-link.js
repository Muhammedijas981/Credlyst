export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid URL' });
  }

  try {
    let hostname = 'Unknown';
    try {
      hostname = new URL(url).hostname;
    } catch (e) {
      // Ignore URL parse errors for fallback
    }

    const fallbackResult = {
      title: hostname,
      category: 'Uncategorized',
      description: '',
      resolvedUrl: url
    };

    // 1. Fetch clean text via Jina Reader API
    //    Pass the original URL — Jina follows all redirects internally (lnkd.in, bit.ly, t.co, etc.)
    //    We keep links enabled so the AI can find the real canonical URL in the page content.
    let pageText = '';
    let resolvedUrl = url;
    try {
      const jinaResponse = await fetch(`https://r.jina.ai/${url}`, {
        headers: {
          'Accept': 'text/plain',
          'X-With-Images': 'false',
          // Note: X-With-Links is NOT set to false — we need URLs in the text
          // so the AI can extract the canonical/destination URL.
        }
      });
      if (jinaResponse.ok) {
        pageText = await jinaResponse.text();

        // Jina includes "URL Source: https://actual-url.com" in its output.
        // Extract it to get the real destination URL after all redirects.
        const urlSourceMatch = pageText.match(/URL Source:\s*(https?:\/\/[^\n\r]+)/i);
        if (urlSourceMatch && urlSourceMatch[1]) {
          resolvedUrl = urlSourceMatch[1].trim();
        }

        // Detect LinkedIn (and similar) redirect/warning pages.
        // These pages say "You are leaving LinkedIn" or "external link" and contain the real URL.
        // We must extract the destination and re-fetch with Jina to get the actual page content.
        const isRedirectPage = /leaving linkedin|external link warning|you are about to leave|interstitial|external-link/i.test(pageText);
        if (isRedirectPage) {
          console.log(`Redirect warning page detected for: ${url}. Extracting destination URL...`);

          // The real destination URL is usually in a redirect param or as a plain URL in the text.
          // Try common patterns: ?url=, ?next=, ?redirectUrl=, or just find the first non-LinkedIn https URL.
          let destinationUrl = null;

          // Pattern 1: query param like ?url=https://... or ?next=https://...
          const paramMatch = pageText.match(/(?:url|next|redirect|external)[=:]\s*(https?:\/\/(?!www\.linkedin\.com)[^\s"'\]<>]+)/i);
          if (paramMatch) destinationUrl = paramMatch[1];

          // Pattern 2: find any https URL in the text that is NOT linkedin.com
          if (!destinationUrl) {
            const allUrls = [...pageText.matchAll(/https?:\/\/(?!(?:www\.)?linkedin\.com)([^\s"'\]<>]+)/g)];
            if (allUrls.length > 0) {
              destinationUrl = allUrls[0][0];
            }
          }

          if (destinationUrl) {
            console.log(`Re-fetching real destination with Jina: ${destinationUrl}`);
            try {
              const realJinaResponse = await fetch(`https://r.jina.ai/${destinationUrl}`, {
                headers: { 'Accept': 'text/plain', 'X-With-Images': 'false' }
              });
              if (realJinaResponse.ok) {
                pageText = await realJinaResponse.text();
                resolvedUrl = destinationUrl;
                console.log(`Successfully fetched real page: ${destinationUrl}`);
              }
            } catch (e2) {
              console.error('Re-fetch of destination failed:', e2.message);
              // Continue with what we have
            }
          }
        }
      }
    } catch (e) {
      console.error('Jina Reader error:', e);
      // Proceed to fallback if Jina fails
    }

    // Update hostname and resolvedUrl from what Jina found
    try {
      hostname = new URL(resolvedUrl).hostname;
      fallbackResult.title = hostname;
      fallbackResult.resolvedUrl = resolvedUrl;
    } catch (e) {
      // Ignore
    }

    if (!pageText || pageText.trim().length === 0) {
      return res.status(200).json(fallbackResult);
    }

    // Limit text to avoid exceeding token limits
    const truncatedText = pageText.substring(0, 12000);

    // 2. Extract metadata via OpenRouter AI
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      console.warn("OPENROUTER_API_KEY is not set. Falling back.");
      return res.status(200).json(fallbackResult);
    }

    const systemPrompt = `You are a JSON-only API. You must output ONLY a raw JSON object with no other text, no preamble, no safety labels, no markdown. Never output anything before or after the JSON object.`;

    const userPrompt = `Analyze this web page text and return a JSON object with exactly these keys:
- "title": A concise, meaningful title (max 10 words). Never use a domain name as the title.
- "category": A single word (Development, Technology, Design, News, Research, Tool, Tutorial, Social, Career, Finance, Education).
- "description": A summary in 15 words or fewer.
- "canonicalUrl": The actual full URL of this page/resource as found in the text (look for URLs in the content — e.g. a Udemy course URL, GitHub repo URL, article URL). If the page is a redirect or share page, find the destination URL in the text. Return null if you cannot find any URL in the content.

Text:
${truncatedText}`;

    // Use "openrouter/free" which auto-routes to an available free model.
    // This avoids breakage when specific free models are retired.
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      })
    });


    if (!aiResponse.ok) {
      const errBody = await aiResponse.text();
      console.error('OpenRouter API error:', aiResponse.status, errBody);
      return res.status(200).json(fallbackResult);
    }

    const aiData = await aiResponse.json();
    let resultJson = fallbackResult;

    try {
      let content = aiData.choices[0].message.content;
      
      // Strip safety preambles some models add (e.g. "User Safety: safe\n{...}")
      content = content.trim();
      
      // Remove everything before the first '{' if there's non-JSON preamble
      const firstBrace = content.indexOf('{');
      if (firstBrace > 0) {
        content = content.substring(firstBrace);
      }
      
      // Strip markdown code fences
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```\s*$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```\s*$/, '');
      }
      
      // Remove any trailing text after the last '}'
      const lastBrace = content.lastIndexOf('}');
      if (lastBrace !== -1 && lastBrace < content.length - 1) {
        content = content.substring(0, lastBrace + 1);
      }

      resultJson = JSON.parse(content);
      
      // Ensure fallbacks for missing JSON fields
      if (!resultJson.title) resultJson.title = fallbackResult.title;
      if (!resultJson.category) resultJson.category = fallbackResult.category;
      if (!resultJson.description) resultJson.description = fallbackResult.description;
      
      // If AI found a canonical URL and it looks different/better than the short URL, use it
      if (resultJson.canonicalUrl && resultJson.canonicalUrl !== url) {
        try {
          new URL(resultJson.canonicalUrl); // validate it's a real URL
          resolvedUrl = resultJson.canonicalUrl;
          console.log(`AI extracted canonical URL: ${resolvedUrl}`);
        } catch (e) {
          // Not a valid URL, ignore
        }
      }
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e.message);
      // Try to extract JSON from the content if it's embedded in text
      try {
        const jsonMatch = aiData.choices[0].message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          resultJson = JSON.parse(jsonMatch[0]);
          if (!resultJson.title) resultJson.title = fallbackResult.title;
          if (!resultJson.category) resultJson.category = fallbackResult.category;
          if (!resultJson.description) resultJson.description = fallbackResult.description;
        }
      } catch (e2) {
        console.error('Fallback JSON extraction also failed:', e2.message);
      }
    }

    // Always include the resolved URL in the response (AI-extracted canonical or original)
    resultJson.resolvedUrl = resolvedUrl;
    delete resultJson.canonicalUrl; // don't expose internal field to frontend
    console.log(`Final resolved URL: ${resolvedUrl}`);
    return res.status(200).json(resultJson);
  } catch (error) {
    console.error('Parse link function error:', error);
    // Never throw a hard error to the user
    return res.status(200).json({
      title: 'Failed to Parse',
      category: 'Uncategorized',
      description: ''
    });
  }
}

