// scripts/ci-test-openrouter.js
// Automated CI verification script for OpenRouter API connectivity, authentication, and model routing.

const API_KEY = process.env.VITE_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: OPENROUTER_API_KEY or VITE_OPENROUTER_API_KEY environment variable is missing.');
  process.exit(1);
}

const maskedKey = `${API_KEY.slice(0, 10)}...${API_KEY.slice(-4)}`;
console.log(`🔑 Testing OpenRouter API with key: ${maskedKey}`);

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': 'https://jxoesneon.github.io/',
  'X-Title': 'jxoesneon portfolio CI verification'
};

async function testAuth() {
  console.log('\n--- [Step 1: Auth & Key Info] ---');
  try {
    const res = await fetch('https://openrouter.ai/api/v1/auth/key', { headers });
    console.log(`Status: ${res.status} ${res.statusText}`);
    const data = await res.json();
    console.log('Key Details:', JSON.stringify(data, null, 2));
    return res.ok;
  } catch (err) {
    console.error('Auth verification failed:', err.message);
    return false;
  }
}

async function getAvailableFreeModels() {
  console.log('\n--- [Step 2: Querying Available Models] ---');
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models');
    if (!res.ok) {
      console.warn(`Failed to fetch models: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    const allModels = data.data || [];
    console.log(`Total models on OpenRouter: ${allModels.length}`);
    
    const freeModels = allModels
      .filter(m => m.id && m.id.includes(':free'))
      .map(m => ({ id: m.id, name: m.name, context_length: m.context_length }));
    
    console.log(`Found ${freeModels.length} active :free models:`);
    freeModels.slice(0, 15).forEach((m, idx) => {
      console.log(`  ${idx + 1}. ${m.id} (${m.name})`);
    });
    
    return freeModels.map(m => m.id);
  } catch (err) {
    console.error('Failed to query models:', err.message);
    return [];
  }
}

async function testChat(modelId) {
  const start = Date.now();
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: 'You are an AI assistant. Be concise.' },
          { role: 'user', content: 'Respond with exactly: "ACK: SYSTEM OPERATIONAL"' }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    const latency = Date.now() - start;
    if (!res.ok) {
      const errText = await res.text();
      console.log(`❌ [${modelId}] HTTP ${res.status} (${latency}ms): ${errText.substring(0, 200)}`);
      return { success: false, model: modelId, error: errText };
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content?.trim();
    console.log(`✅ [${modelId}] (${latency}ms) Reply: "${reply}"`);
    return { success: true, model: modelId, reply, latency };
  } catch (err) {
    const latency = Date.now() - start;
    console.log(`❌ [${modelId}] Exception (${latency}ms): ${err.message}`);
    return { success: false, model: modelId, error: err.message };
  }
}

async function run() {
  await testAuth();
  await getAvailableFreeModels();

  console.log('\n--- [Step 3: Testing Chat Completions] ---');
  const candidateModels = [
    'nvidia/nemotron-3.5-lightning:free',
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
    'apodex/apodex-1.1-mini:free',
    'liquid/lfm-2.5-2.6b:free',
    'openrouter/auto'
  ];

  // Deduplicate
  const uniqueCandidates = [...new Set(candidateModels)];
  console.log(`Testing ${uniqueCandidates.length} candidate model configurations...`);

  const results = [];
  for (const model of uniqueCandidates) {
    const result = await testChat(model);
    results.push(result);
    // Pause briefly to respect free tier rate limits
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n========================================');
  console.log('         CI TEST SUMMARY RESULTS        ');
  console.log('========================================');
  const successful = results.filter(r => r.success);
  console.log(`Successful models (${successful.length}/${results.length}):`);
  successful.forEach(s => console.log(`  ⭐ ${s.model} [${s.latency}ms]`));

  if (successful.length === 0) {
    console.error('\n❌ All tested models failed. Review the logs above for specific error messages.');
    process.exit(1);
  } else {
    console.log(`\n🎉 Verification passed! ${successful.length} model(s) operational.`);
    process.exit(0);
  }
}

run().catch(err => {
  console.error('Unexpected script failure:', err);
  process.exit(1);
});
