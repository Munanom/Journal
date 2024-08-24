const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = 'AIzaSyBztZIoGE1U_12Y3u5QRIlWfo2RbZym-CE';
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 256,
};

export default async function handler(req, res) {
  console.log('Handler function called');

  if (req.method === 'POST') {
    const { mood } = req.body;
    console.log('Received mood:', mood);

    try {
      const chatSession = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [{ text: "You are a helpful assistant that provides mood improvement suggestions." }],
          },
          {
            role: "model",
            parts: [{ text: "Understood. I'm here to provide helpful suggestions to improve mood. How can I assist you today?" }],
          },
        ],
      });
      

      const prompt = `Provide a short suggestion to improve mood when someone feels ${mood}.`;
      console.log('Prompt:', prompt);

      const result = await chatSession.sendMessage(prompt);
      const suggestion = result.response.text();
      console.log('Generated suggestion:', suggestion);

      res.status(200).json({ suggestion });
    } catch (error) {
      console.error('Error fetching suggestion from Gemini:', error);
      res.status(500).json({ error: 'Failed to fetch suggestion', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}