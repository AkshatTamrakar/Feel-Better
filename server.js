// server.js

require('dotenv').config();
process.env.GOOGLE_APPLICATION_CREDENTIALS = './keys/credentials.json';

const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const axios = require('axios');
const cors = require('cors');
const path = require('path')
const app = express();
const PORT = 3000;

// Google Cloud clients
const visionClient = new ImageAnnotatorClient();

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
//

// Multer config
const storage = multer.memoryStorage();
const upload = multer({ storage });
app.use(express.static(path.join(__dirname, 'main_website', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main_website', 'public', 'index.html'));
});

// Convert Base64 to Buffer
function base64ToBuffer(base64) {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

// Text Emotion Detection
async function detectTextEmotion(text) {
  const prompt = `Analyze the following text and respond with only one of these emotions: happiness, sadness, anger, fear, disgust, or surprise.

Text: "${text}"

Respond with just one word from the list above that best describes the dominant emotion.`;

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are an expert emotion detection assistant.' },
        { role: 'user', content: prompt }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const emotion = response.data.choices[0].message.content.toLowerCase().trim();
    const valid = ['happiness', 'sadness', 'anger', 'fear', 'disgust', 'surprise'];
    return valid.includes(emotion) ? emotion : 'neutral';
  } catch (err) {
    console.error('Text emotion error:', err.response?.data || err.message);
    return 'neutral';
  }
}

// Image Emotion Detection
async function detectImageEmotion(base64Image) {
  try {
    const [result] = await visionClient.faceDetection({
      image: { content: base64ToBuffer(base64Image) }
    });

    const face = result.faceAnnotations?.[0];
    if (!face) return 'neutral';

    const scale = {
      VERY_UNLIKELY: 0,
      UNLIKELY: 1,
      POSSIBLE: 2,
      LIKELY: 3,
      VERY_LIKELY: 4
    };

    const likelihoods = [
      { type: 'joy', value: face.joyLikelihood },
      { type: 'sorrow', value: face.sorrowLikelihood },
      { type: 'anger', value: face.angerLikelihood },
      { type: 'surprise', value: face.surpriseLikelihood }
    ];

    likelihoods.sort((a, b) => scale[b.value] - scale[a.value]);
    switch (likelihoods[0].type) {
      case 'joy': return 'happiness';
      case 'sorrow': return 'sadness';
      case 'anger': return 'anger';
      case 'surprise': return 'surprise';
      default: return 'neutral';
    }
  } catch (err) {
    console.error('Image emotion error:', err.message);
    return 'neutral';
  }
}

// Combine Both Emotions
function combineEmotions(imageEmotion, textEmotion) {
  if (imageEmotion === textEmotion) return imageEmotion;
  return textEmotion !== 'neutral' ? textEmotion : imageEmotion;
}

// Generate Recommendation Cards
function generateMoodCards(mood) {
  const cards = {
    happiness: [
      { title: 'Celebrate Your Wins', description: 'Treat yourself or share joy with someone.' },
      { title: 'Spread Positivity', description: 'Send a kind message to a friend.' }
    ],
    sadness: [
      { title: 'Write It Out', description: 'Journaling helps process emotions.' },
      { title: 'Comfort Playlist', description: 'Play music that lifts you up.' }
    ],
    anger: [
      { title: 'Cool Off', description: 'Try a short walk or deep breathing.' },
      { title: 'Express Safely', description: 'Vent through art or journaling.' }
    ],
    fear: [
      { title: 'Face It Gently', description: 'Break tasks into small steps.' },
      { title: 'Talk to Someone', description: 'Reach out to a trusted friend.' }
    ],
    disgust: [
      { title: 'Shift Focus', description: 'Watch or read something uplifting.' },
      { title: 'Clean Space, Clear Mind', description: 'Tidy up your surroundings.' }
    ],
    surprise: [
      { title: 'Reflect on It', description: 'Was it a good surprise or a challenge?' },
      { title: 'Embrace the Unexpected', description: 'Sometimes surprises spark growth.' }
    ],
    neutral: [
      { title: 'Stay Mindful', description: 'Take a moment to notice your breath.' },
      { title: 'Keep Journaling', description: 'Logging your mood helps in the long run.' }
    ]
  };
  return cards[mood] || cards['neutral'];
}

// API Endpoint
app.post('/analyze', async (req, res) => {
  const { image, text } = req.body;

  if (!image || !text) {
    return res.status(400).json({ error: 'Image and text are required.' });
  }

  try {
    const [imgEmotion, txtEmotion] = await Promise.all([
      detectImageEmotion(image),
      detectTextEmotion(text)
    ]);

    const mood = combineEmotions(imgEmotion, txtEmotion);
    const cards = generateMoodCards(mood);

    res.json({ mood, cards });
  } catch (error) {
    res.status(500).json({ error: 'Analysis failed.', details: error.message });
  }
});

app.use("/music", express.static(path.join(__dirname, "music")))







// Routes
app.post("/summary", async (req, res) => {
  const { bookTitle } = req.body;

  if (!bookTitle) {
    return res.status(400).json({ error: "Missing bookTitle in request body." });
  }

  const prompt = `
  Give a detailed summary of the book "${bookTitle}".
  
  Format your response in proper HTML with the following guidelines:
  - Use <h2> for main sections like 'Book Summary', 'Chapter-wise Summaries', 'Key Points or Takeaways'.
  - Use <h3> for chapter titles.
  - Use <p> for paragraphs.
  - Use <ul> and <li> for lists.
  - Do NOT use Markdown symbols like ** or ##. Just return clean HTML.
  `;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.book_api}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          { role: "system", content: "You are a helpful assistant that summarizes books." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const data = await groqRes.json();
    let summary = data.choices?.[0]?.message?.content;

    if (!summary) {
      return res.status(500).json({ error: "No summary received from Groq." });
    }

    // Format fallback markdown-like response to HTML
    summary = summary
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")   // **bold** → <strong>
      .replace(/^## (.*$)/gim, "<h2>$1</h2>")             // ## Heading → <h2>
      .replace(/^# (.*$)/gim, "<h1>$1</h1>")              // # Heading → <h1>
      .replace(/^### (.*$)/gim, "<h3>$1</h3>")            // ### Heading → <h3>
      .replace(/^\s*[-*] (.*)/gm, "<li>$1</li>")          // - item → <li>
      .replace(/(<li>.*<\/li>)/gms, "<ul>$1</ul>")        // wrap in <ul>
      .replace(/\n{2,}/g, "<br><br>")                     // spacing
      .replace(/\n/g, "<br>");                            // new lines

    res.json({ summary });

  } catch (err) {
    console.error("Error talking to Groq:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to get summary from Groq." });
    }
  }
});


 

// Route for Get Started button

app.use('/emotion-detection-app/public', express.static(path.join(__dirname, 'public')));
app.get('/emotion-detection-app/public', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.use('/emotion-detection-app/ai-friend/public', express.static(path.join(__dirname, 'ai-friend', 'public')));
app.get('/emotion-detection-app/ai-friend/public', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/books', express.static(path.join(__dirname, 'books', 'public')));
app.get('/books', (req, res) => {
  res.sendFile(path.join(__dirname, 'books', 'public', 'index.html'));
});
// app.use('/ai-friend', express.static(path.join(__dirname, 'ai-friend', 'public')));
// app.get('/ai-friend', (req, res) => {
//   res.sendFile(path.join(__dirname, 'ai-friend', 'public', 'index.html'));
// });
app.use('/emotion-detection-app/depression-test/public', express.static(path.join(__dirname, 'depression-test', 'public')));
app.get('/emotion-detection-app/depression-test/public', (req, res) => {
  res.sendFile(path.join(__dirname, 'depression-test', 'public', 'index.html'));
});

// POST endpoint to chat
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "system",
            content: "You are a supportive, caring AI friend who chats like a real human. Keep your responses short, realistic, and friendly — like a casual conversation. Avoid sounding robotic or overly detailed. Be emotionally comforting with a warm and human tone. Use minimal emojis (1–2 max) only if it feels natural."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 150  // Limits length of response
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY_fre}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      reply: response.data.choices[0].message.content
    });

  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Something went wrong!" });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
