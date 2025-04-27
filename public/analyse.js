// api/analyze.js

require('dotenv').config();
const { ImageAnnotatorClient } = require('@google-cloud/vision');
const axios = require('axios');

// Google Cloud client
const visionClient = new ImageAnnotatorClient();

// Convert Base64 to Buffer
function base64ToBuffer(base64) {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

// Detect emotion from text
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

// Detect emotion from image
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

// Combine image and text emotion
function combineEmotions(imageEmotion, textEmotion) {
  if (imageEmotion === textEmotion) return imageEmotion;
  return textEmotion !== 'neutral' ? textEmotion : imageEmotion;
}

// Generate cards based on mood
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

// API Route handler
module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const { text, image } = req.body;

      let textEmotion = 'neutral';
      let imageEmotion = 'neutral';

      if (text) {
        textEmotion = await detectTextEmotion(text);
      }
      
      if (image) {
        imageEmotion = await detectImageEmotion(image);
      }

      const combinedEmotion = combineEmotions(imageEmotion, textEmotion);
      const moodCards = generateMoodCards(combinedEmotion);

      return res.status(200).json({ emotion: combinedEmotion, cards: moodCards });
    } catch (error) {
      console.error('Error in processing the emotion:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    // Handle unsupported methods
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
};
