import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { goal } = req.body;

  if (!goal) {
    return res.status(400).json({ error: "Goal is required" });
  }

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful planner that creates detailed roadmaps with subgoals and tasks." },
        { role: "user", content: `Create a step-by-step roadmap for: ${goal}` }
      ]
    });

    const roadmap = completion.choices[0].message.content;
    res.status(200).json({ roadmap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate roadmap" });
  }
}
