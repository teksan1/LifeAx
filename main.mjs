import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Example usage
(async () => {
  try {
    const response = await openai.models.list();
    console.log("✅ OpenAI connection successful. Models loaded:");
    console.log(response);
  } catch (err) {
    console.error("❌ OpenAI error:", err.message);
  }
})();
