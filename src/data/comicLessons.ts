export const comicLessons = {
  'ai-basics': {
    id: 'ai-basics',
    title: 'The Magic of Artificial Intelligence',
    character: 'AI-ko',
    difficulty: 'Beginner',
    duration: '5 min',
    description: 'Join young inventor Zuberi as he discovers the amazing world of AI in his African village.',
    panels: [
      {
        id: 'panel-1',
        character: 'Inventor Zuberi',
        dialogue: 'Welcome to my workshop in beautiful Lagos! I\'m Zuberi, and I love creating things that help my community.',
        action: 'Setting the scene',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'AI-ko',
        dialogue: 'Hello Zuberi! I\'m AI-ko, your friendly AI guide. Today, I\'ll show you how Artificial Intelligence works - it\'s like teaching computers to think and learn!',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Inventor Zuberi',
        dialogue: 'But how can a computer think? Computers just follow instructions, right?',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What do you think makes AI different from regular computer programs?',
          options: [
            'AI can learn from experience',
            'AI just runs faster',
            'AI uses more electricity',
            'AI speaks different languages'
          ],
          correctAnswer: 'AI can learn from experience'
        }
      },
      {
        id: 'panel-4',
        character: 'AI-ko',
        dialogue: 'Excellent! Unlike regular programs that only follow pre-written instructions, AI can learn patterns from data - just like how you learned to recognize your grandmother\'s voice!',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'bounce'
      },
      {
        id: 'panel-5',
        character: 'Market Vendor Asha',
        dialogue: 'In my market, I use AI to predict which fruits will sell best each day. It learns from past sales patterns!',
        action: 'Real-world example',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-6',
        character: 'AI-ko',
        dialogue: 'AI is everywhere! From helping doctors diagnose diseases to translating between Swahili and English. It\'s like having a really smart assistant that keeps getting smarter!',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'pulse',
        interactiveElement: {
          type: 'click',
          content: 'Click to see AI in action! 🌟'
        }
      }
    ]
  },

  'machine-learning': {
    id: 'machine-learning',
    title: 'Teaching Machines to Think',
    character: 'AI-ko',
    difficulty: 'Beginner',
    duration: '7 min',
    description: 'Discover how machine learning works through the story of training a virtual pet to recognize African animals.',
    panels: [
      {
        id: 'panel-1',
        character: 'Student Amara',
        dialogue: 'AI-ko, I want to create an app that can identify animals in Serengeti photos. How do I teach a computer to recognize a lion from an elephant?',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'AI-ko',
        dialogue: 'Great question, Amara! Machine Learning is like training a very patient student. We show the computer thousands of animal photos with labels.',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'AI-ko',
        dialogue: 'Imagine showing a child 1,000 lion photos and saying "This is a lion" each time. Eventually, they learn what makes a lion look like a lion!',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What features might help identify a lion?',
          options: [
            'Mane, golden fur, sharp teeth',
            'Trunk and big ears',
            'Black and white stripes',
            'Long neck and spots'
          ],
          correctAnswer: 'Mane, golden fur, sharp teeth'
        }
      },
      {
        id: 'panel-4',
        character: 'Elder Fatima',
        dialogue: 'In our village, we teach children about animals by sharing stories and showing them tracks. Machine learning is similar - we teach computers using data!',
        action: 'Wisdom sharing',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'bounce'
      },
      {
        id: 'panel-5',
        character: 'Student Amara',
        dialogue: 'So the computer looks for patterns in the data, just like how I learned to distinguish between my aunt\'s laugh and my mother\'s laugh?',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'pulse',
        interactiveElement: {
          type: 'question',
          content: 'Machine learning is most like:',
          options: [
            'Following a recipe exactly',
            'Learning from practice and examples',
            'Memorizing a textbook',
            'Guessing randomly'
          ],
          correctAnswer: 'Learning from practice and examples'
        }
      },
      {
        id: 'panel-6',
        character: 'AI-ko',
        dialogue: 'Exactly! And the more examples we show the computer, the better it gets at recognizing new animals it has never seen before. That\'s the magic of machine learning!',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'fadeIn'
      }
    ]
  },

  'chatbots': {
    id: 'chatbots',
    title: 'Creating Your Digital Assistant',
    character: 'AI-ko',
    difficulty: 'Beginner',
    duration: '6 min',
    description: 'Learn how chatbots work by building an AI helper for a local school.',
    panels: [
      {
        id: 'panel-1',
        character: 'Teacher Kwame',
        dialogue: 'Students keep asking me the same questions: "When is lunch?", "Where is the library?", "What time does school end?" I need help!',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'AI-ko',
        dialogue: 'Perfect! Let\'s build a chatbot - a computer program that can chat with students and answer their questions automatically!',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Student Amara',
        dialogue: 'How does a chatbot know what I\'m asking about when I type "Where can I find books?"',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What is the chatbot trying to understand?',
          options: [
            'The user\'s intent (what they want)',
            'The user\'s name',
            'The user\'s location',
            'The user\'s age'
          ],
          correctAnswer: 'The user\'s intent (what they want)'
        }
      },
      {
        id: 'panel-4',
        character: 'AI-ko',
        dialogue: 'Great thinking! The chatbot identifies your INTENT. "Where can I find books?" = Library Location Intent. It then gives the appropriate response!',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'bounce'
      },
      {
        id: 'panel-5',
        character: 'Village Chief',
        dialogue: 'This reminds me of how our village elder answered questions. Each type of question had its proper response based on our traditions.',
        action: 'Cultural wisdom',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'pulse'
      },
      {
        id: 'panel-6',
        character: 'Teacher Kwame',
        dialogue: 'Amazing! Now students can get quick answers 24/7, and I can focus on teaching instead of repeating the same information!',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'fadeIn',
        interactiveElement: {
          type: 'click',
          content: 'Celebrate the successful chatbot! 🎉'
        }
      }
    ]
  },

  'nlp': {
    id: 'nlp',
    title: 'How Computers Understand Language',
    character: 'AI-ko',
    difficulty: 'Intermediate',
    duration: '8 min',
    description: 'Explore Natural Language Processing through the lens of African languages and translation.',
    panels: [
      {
        id: 'panel-1',
        character: 'Student Amara',
        dialogue: 'My grandmother speaks Swahili, but my chatbot only understands English. How can computers understand different languages?',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'AI-ko',
        dialogue: 'Welcome to Natural Language Processing (NLP)! It\'s how computers understand, interpret, and generate human language - whether it\'s English, Swahili, or Yoruba!',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Elder Fatima',
        dialogue: 'In our village, when someone speaks, we listen to their words, understand their meaning, and respond appropriately. Can computers do this too?',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What steps does NLP involve?',
          options: [
            'Break down words, understand meaning, generate response',
            'Just translate everything to English',
            'Count the number of letters',
            'Play the words out loud'
          ],
          correctAnswer: 'Break down words, understand meaning, generate response'
        }
      },
      {
        id: 'panel-4',
        character: 'AI-ko',
        dialogue: 'Exactly! First, the computer breaks down "Habari gani?" into parts. It recognizes this as a Swahili greeting meaning "What\'s the news?" or "How are you?"',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'bounce'
      },
      {
        id: 'panel-5',
        character: 'Market Vendor Asha',
        dialogue: 'I use translation apps to talk with tourists from different countries. The computer understands context - "bank" could mean river bank or money bank!',
        action: 'Real application',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'pulse',
        interactiveElement: {
          type: 'question',
          content: 'Why is context important in NLP?',
          options: [
            'Words can have different meanings in different situations',
            'It makes the computer faster',
            'It uses less memory',
            'It sounds more natural'
          ],
          correctAnswer: 'Words can have different meanings in different situations'
        }
      },
      {
        id: 'panel-6',
        character: 'Student Amara',
        dialogue: 'So NLP helps preserve our languages by teaching computers to understand them! Now my grandmother can chat with my AI assistant in Swahili!',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'fadeIn'
      }
    ]
  },

  'creating-intents': {
    id: 'creating-intents',
    title: 'Understanding What Users Want',
    character: 'AI-ko',
    difficulty: 'Intermediate',
    duration: '10 min',
    description: 'Master the art of creating intents through scenarios from an African marketplace.',
    panels: [
      {
        id: 'panel-1',
        character: 'Market Vendor Asha',
        dialogue: 'Every day, customers ask me questions in different ways. "How much for tomatoes?", "What\'s the price of these red ones?", "Cost of tomatoes?"',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'AI-ko',
        dialogue: 'All those questions have the same INTENT - the customer wants to know the price! This is what we call "price inquiry" intent.',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Student Amara',
        dialogue: 'So an intent is like the customer\'s goal or what they really want to achieve?',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'Which of these is an intent?',
          options: [
            'Product.Price.Inquiry',
            'The word "tomato"',
            'Speaking loudly',
            'Using hand gestures'
          ],
          correctAnswer: 'Product.Price.Inquiry'
        }
      },
      {
        id: 'panel-4',
        character: 'Teacher Kwame',
        dialogue: 'In my classroom, when students ask "When is break?", "What time is lunch?", or "How long until break?" - they all have the same intent: schedule inquiry!',
        action: 'Teaching moment',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'bounce'
      },
      {
        id: 'panel-5',
        character: 'AI-ko',
        dialogue: 'Now we train our AI with many examples of how people express each intent. These are called "training phrases" - different ways to say the same thing!',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'pulse',
        interactiveElement: {
          type: 'question',
          content: 'For a "greeting" intent, which are good training phrases?',
          options: [
            '"Hello", "Hi there", "Good morning", "Sanibonani"',
            '"Goodbye", "See you later", "Farewell"',
            '"Thank you", "Please", "Sorry"',
            '"Yes", "No", "Maybe"'
          ],
          correctAnswer: '"Hello", "Hi there", "Good morning", "Sanibonani"'
        }
      },
      {
        id: 'panel-6',
        character: 'Village Chief',
        dialogue: 'This wisdom of understanding intent reminds me of our traditional palaver system - we listen not just to words, but to the heart of what people need.',
        action: 'Cultural connection',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      }
    ]
  },

  'conversation-flow': {
    id: 'conversation-flow',
    title: 'Designing Perfect Conversations',
    character: 'AI-ko',
    difficulty: 'Advanced',
    duration: '12 min',
    description: 'Learn conversational flow design through Ubuntu philosophy and respectful dialogue.',
    panels: [
      {
        id: 'panel-1',
        character: 'Elder Fatima',
        dialogue: 'In our tradition of Ubuntu - "I am because we are" - every conversation is a dance. There\'s a flow, a rhythm, a respectful exchange.',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'AI-ko',
        dialogue: 'Beautiful! Conversation flow design is exactly like this dance. We map out how the chatbot should respond and guide users through meaningful dialogue.',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Student Amara',
        dialogue: 'So if someone asks "Book a flight", the bot shouldn\'t just say "OK". It should ask follow-up questions like destination and date?',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'Good conversation flow includes:',
          options: [
            'Asking clarifying questions when needed',
            'Giving one-word answers',
            'Changing topics randomly',
            'Ignoring user responses'
          ],
          correctAnswer: 'Asking clarifying questions when needed'
        }
      },
      {
        id: 'panel-4',
        character: 'Market Vendor Asha',
        dialogue: 'Exactly! When a customer says "I want fruit", I ask "What type? How much? For eating now or later?" Good conversation builds understanding.',
        action: 'Real-world example',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'bounce'
      },
      {
        id: 'panel-5',
        character: 'AI-ko',
        dialogue: 'We connect intents with arrows, creating a conversation map. After "greeting", we might flow to "help_offer", then to specific assistance intents.',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'pulse',
        interactiveElement: {
          type: 'question',
          content: 'A good conversation flow should:',
          options: [
            'Guide users naturally toward their goals',
            'Force users to say exact phrases',
            'Never ask questions',
            'Always end conversations quickly'
          ],
          correctAnswer: 'Guide users naturally toward their goals'
        }
      },
      {
        id: 'panel-6',
        character: 'Village Chief',
        dialogue: 'Remember, young ones - technology should serve humanity. A well-designed conversation flow honors the user\'s needs and creates harmony, just like Ubuntu teaches us.',
        action: 'Final wisdom',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      }
    ]
  }
};