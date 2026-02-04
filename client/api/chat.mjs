export default async function handler(req, res) {
  const body = await req.json();
  const msg = body.message;
  // Use OpenAI via fetch (replace with your API key)
  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method:"POST",
    headers:{
      "Authorization":"Bearer "+process.env.OPENAI_API_KEY,
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      model:"gpt-3.5-turbo",
      messages:[{role:"user",content:msg}]
    })
  });
  const data = await resp.json();
  res.json({ reply: data.choices?.[0]?.message?.content || "🤖 AI could not respond" });
}
