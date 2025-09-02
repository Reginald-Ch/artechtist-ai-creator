export const enhancedComicLessons = {
  'intro-to-ai': {
    id: 'intro-to-ai',
    title: 'Introduction to Artificial Intelligence',
    character: 'AI-ko',
    difficulty: 'Beginner',
    duration: '5 min',
    description: 'Discover what AI really is and how it impacts our daily lives.',
    panels: [
      {
        id: 'panel-1',
        character: 'Dr. Amina',
        dialogue: 'Welcome to the fascinating world of AI! I\'m Dr. Amina, and today we\'ll explore what makes machines intelligent.',
        action: 'Setting the scene',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'AI-ko',
        dialogue: 'Artificial Intelligence is the ability of machines to perform tasks that typically require human intelligence - like recognizing faces, understanding speech, or making decisions.',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Student Zara',
        dialogue: 'So AI is like giving computers a brain? But how is that different from regular computer programs?',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What makes AI different from traditional software?',
          options: [
            'AI can learn and adapt from data',
            'AI runs on more powerful computers',
            'AI is written in different programming languages',
            'AI uses more memory'
          ],
          correctAnswer: 'AI can learn and adapt from data'
        }
      }
    ],
    flashcards: [
      { id: 1, question: 'What does AI stand for?', answer: 'Artificial Intelligence', category: 'Basic Terms', difficulty: 'easy' },
      { id: 2, question: 'True or False: AI can only work with numbers', answer: 'False - AI can work with text, images, audio, and more', category: 'Data Types', difficulty: 'easy' },
      { id: 3, question: 'Name three examples of AI in everyday life', answer: 'Voice assistants, recommendation systems, navigation apps', category: 'Applications', difficulty: 'medium' },
      { id: 4, question: 'What is the main difference between AI and traditional programming?', answer: 'AI can learn and adapt from data, while traditional programming follows fixed instructions', category: 'Concepts', difficulty: 'medium' },
      { id: 5, question: 'Which year is considered the birth of AI as a field?', answer: '1956 (Dartmouth Conference)', category: 'History', difficulty: 'hard' },
      { id: 6, question: 'What are the three main types of AI?', answer: 'Narrow AI, General AI, and Super AI', category: 'Classifications', difficulty: 'hard' },
      { id: 7, question: 'What is machine learning?', answer: 'A subset of AI that enables computers to learn from data without explicit programming', category: 'ML Basics', difficulty: 'medium' },
      { id: 8, question: 'Name a famous AI researcher', answer: 'Alan Turing, John McCarthy, Geoffrey Hinton, or others', category: 'People', difficulty: 'medium' },
      { id: 9, question: 'What is the Turing Test?', answer: 'A test to determine if a machine can exhibit intelligent behavior indistinguishable from a human', category: 'Tests', difficulty: 'hard' },
      { id: 10, question: 'What does NLP stand for in AI?', answer: 'Natural Language Processing', category: 'Technologies', difficulty: 'easy' }
    ]
  },

  'intro-to-ai-ml': {
    id: 'intro-to-ai-ml',
    title: 'AI and Machine Learning Fundamentals',
    character: 'Dr. Science',
    difficulty: 'Beginner',
    duration: '6 min',
    description: 'Understanding the relationship between AI and ML with practical examples.',
    panels: [
      {
        id: 'panel-1',
        character: 'Dr. Science',
        dialogue: 'Think of AI as a big umbrella, and Machine Learning is one of the most important tools under that umbrella.',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'Engineer Mike',
        dialogue: 'Machine Learning is like teaching a child to recognize animals by showing them thousands of pictures, instead of programming every detail.',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Student Sarah',
        dialogue: 'So instead of writing code for every possible scenario, we let the computer figure out patterns from examples?',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What are the three main types of machine learning?',
          options: [
            'Supervised, Unsupervised, Reinforcement Learning',
            'Fast, Medium, Slow Learning',
            'Simple, Complex, Advanced Learning',
            'Linear, Circular, Random Learning'
          ],
          correctAnswer: 'Supervised, Unsupervised, Reinforcement Learning'
        }
      }
    ],
    flashcards: [
      { id: 1, question: 'What is supervised learning?', answer: 'Learning with labeled examples (input-output pairs)', category: 'ML Types', difficulty: 'easy' },
      { id: 2, question: 'What is unsupervised learning?', answer: 'Finding patterns in data without labeled examples', category: 'ML Types', difficulty: 'easy' },
      { id: 3, question: 'What is reinforcement learning?', answer: 'Learning through trial and error with rewards and penalties', category: 'ML Types', difficulty: 'medium' },
      { id: 4, question: 'What is a neural network?', answer: 'A computational model inspired by the human brain', category: 'Architecture', difficulty: 'medium' },
      { id: 5, question: 'What is deep learning?', answer: 'Machine learning using neural networks with multiple layers', category: 'Deep Learning', difficulty: 'medium' },
      { id: 6, question: 'What is training data?', answer: 'The dataset used to teach a machine learning model', category: 'Data', difficulty: 'easy' },
      { id: 7, question: 'What is overfitting?', answer: 'When a model learns training data too well and performs poorly on new data', category: 'Problems', difficulty: 'hard' },
      { id: 8, question: 'What is an algorithm?', answer: 'A set of rules or instructions for solving a problem', category: 'Basics', difficulty: 'easy' },
      { id: 9, question: 'What is feature engineering?', answer: 'The process of selecting and transforming variables for machine learning models', category: 'Process', difficulty: 'hard' },
      { id: 10, question: 'What is cross-validation?', answer: 'A technique to evaluate model performance by dividing data into multiple parts', category: 'Evaluation', difficulty: 'hard' }
    ]
  },

  'intro-to-data': {
    id: 'intro-to-data',
    title: 'Understanding Data in AI',
    character: 'Scientist Sarah',
    difficulty: 'Beginner',
    duration: '5 min',
    description: 'Learn why data is the fuel that powers AI systems.',
    panels: [
      {
        id: 'panel-1',
        character: 'Data Analyst David',
        dialogue: 'Data is everywhere! Every click, every photo, every sensor reading is data that can teach AI systems.',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'AI-ko',
        dialogue: 'Think of data as ingredients for cooking. The quality and variety of ingredients determine how good your meal will be!',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Chef Marco',
        dialogue: 'Exactly! Just like I need fresh vegetables for a good soup, AI needs quality data to make good predictions.',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What types of data can AI work with?',
          options: [
            'Text, images, audio, video, and sensor data',
            'Only numbers and text',
            'Only images and videos',
            'Only structured databases'
          ],
          correctAnswer: 'Text, images, audio, video, and sensor data'
        }
      }
    ],
    flashcards: [
      { id: 1, question: 'What is big data?', answer: 'Large volumes of data that require special tools to process', category: 'Data Types', difficulty: 'easy' },
      { id: 2, question: 'What is structured data?', answer: 'Data organized in a predefined format like tables or databases', category: 'Data Types', difficulty: 'easy' },
      { id: 3, question: 'What is unstructured data?', answer: 'Data without predefined format like text, images, or videos', category: 'Data Types', difficulty: 'easy' },
      { id: 4, question: 'What is data preprocessing?', answer: 'Cleaning and preparing data before using it in AI models', category: 'Process', difficulty: 'medium' },
      { id: 5, question: 'What is a dataset?', answer: 'A collection of related data points used for training or testing', category: 'Basics', difficulty: 'easy' },
      { id: 6, question: 'What is data labeling?', answer: 'The process of adding meaningful tags or categories to data', category: 'Process', difficulty: 'medium' },
      { id: 7, question: 'What is data bias?', answer: 'When data unfairly represents certain groups or perspectives', category: 'Ethics', difficulty: 'medium' },
      { id: 8, question: 'What is data mining?', answer: 'The process of discovering patterns in large datasets', category: 'Analysis', difficulty: 'medium' },
      { id: 9, question: 'What is metadata?', answer: 'Data that describes other data', category: 'Concepts', difficulty: 'hard' },
      { id: 10, question: 'What is data quality?', answer: 'How accurate, complete, and reliable data is', category: 'Quality', difficulty: 'medium' }
    ]
  },

  'intro-to-bias': {
    id: 'intro-to-bias',
    title: 'Understanding AI Bias and Fairness',
    character: 'Lawyer Lisa',
    difficulty: 'Intermediate',
    duration: '7 min',
    description: 'Explore the critical topic of bias in AI systems and how to build fair AI.',
    panels: [
      {
        id: 'panel-1',
        character: 'Lawyer Lisa',
        dialogue: 'AI systems can inherit human biases from training data. As builders of AI, we must ensure fairness and equality.',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'Dr. Amina',
        dialogue: 'Imagine an AI hiring system trained only on data from male engineers. It might unfairly favor male candidates.',
        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Student Zara',
        dialogue: 'So the AI isn\'t intentionally biased, but it learned from biased examples?',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'How can we reduce bias in AI systems?',
          options: [
            'Use diverse, representative training data',
            'Use more powerful computers',
            'Write longer code',
            'Use more expensive software'
          ],
          correctAnswer: 'Use diverse, representative training data'
        }
      }
    ],
    flashcards: [
      { id: 1, question: 'What is AI bias?', answer: 'Unfair or prejudiced outcomes in AI systems due to biased training data or algorithms', category: 'Ethics', difficulty: 'easy' },
      { id: 2, question: 'What is algorithmic fairness?', answer: 'Ensuring AI systems treat all groups equitably and without discrimination', category: 'Ethics', difficulty: 'medium' },
      { id: 3, question: 'What is selection bias?', answer: 'When training data doesn\'t represent the full population', category: 'Bias Types', difficulty: 'medium' },
      { id: 4, question: 'What is confirmation bias?', answer: 'The tendency to search for or interpret information in a way that confirms preconceptions', category: 'Bias Types', difficulty: 'medium' },
      { id: 5, question: 'What is demographic parity?', answer: 'When AI outcomes are independent of protected attributes like race or gender', category: 'Fairness Metrics', difficulty: 'hard' },
      { id: 6, question: 'What is explainable AI?', answer: 'AI systems that can provide clear explanations for their decisions', category: 'Transparency', difficulty: 'medium' },
      { id: 7, question: 'What is disparate impact?', answer: 'When AI systems have different effects on different groups, even without intentional discrimination', category: 'Legal', difficulty: 'hard' },
      { id: 8, question: 'What is inclusive design?', answer: 'Designing AI systems that work for people with diverse backgrounds and abilities', category: 'Design', difficulty: 'medium' },
      { id: 9, question: 'What is bias mitigation?', answer: 'Techniques used to reduce unfair bias in AI systems', category: 'Solutions', difficulty: 'medium' },
      { id: 10, question: 'What is a protected attribute?', answer: 'Characteristics like race, gender, or age that should not influence AI decisions in certain contexts', category: 'Legal', difficulty: 'hard' }
    ]
  },

  'intro-to-chatbots': {
    id: 'intro-to-chatbots',
    title: 'Building Conversational AI',
    character: 'Bot Builder',
    difficulty: 'Beginner',
    duration: '6 min',
    description: 'Learn the fundamentals of creating chatbots and conversational interfaces.',
    panels: [
      {
        id: 'panel-1',
        character: 'Customer Service Rep',
        dialogue: 'I answer the same questions hundreds of times: hours, location, pricing. A chatbot could help customers instantly!',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'AI-ko',
        dialogue: 'Chatbots are AI assistants that communicate through text or voice, available 24/7 to help users!',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Developer Dan',
        dialogue: 'Modern chatbots use Natural Language Processing to understand what users mean, even if they phrase things differently.',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What makes a good chatbot?',
          options: [
            'Understanding user intent and providing helpful responses',
            'Using complex technical language',
            'Answering only yes/no questions',
            'Working only during business hours'
          ],
          correctAnswer: 'Understanding user intent and providing helpful responses'
        }
      }
    ],
    flashcards: [
      { id: 1, question: 'What is a chatbot?', answer: 'An AI program designed to simulate conversation with human users', category: 'Basics', difficulty: 'easy' },
      { id: 2, question: 'What is Natural Language Processing in chatbots?', answer: 'The ability to understand and interpret human language', category: 'Technology', difficulty: 'easy' },
      { id: 3, question: 'What is the difference between rule-based and AI chatbots?', answer: 'Rule-based follow scripts; AI chatbots learn and adapt from conversations', category: 'Types', difficulty: 'medium' },
      { id: 4, question: 'What is a conversational interface?', answer: 'A way for humans to interact with computers using natural language', category: 'Interface', difficulty: 'easy' },
      { id: 5, question: 'What are the main benefits of chatbots?', answer: '24/7 availability, instant responses, cost reduction, and scalability', category: 'Benefits', difficulty: 'medium' },
      { id: 6, question: 'What is context awareness in chatbots?', answer: 'The ability to remember and use information from previous parts of the conversation', category: 'Features', difficulty: 'medium' },
      { id: 7, question: 'What is a chatbot framework?', answer: 'A platform or toolkit for building and deploying chatbots', category: 'Tools', difficulty: 'medium' },
      { id: 8, question: 'What is sentiment analysis in chatbots?', answer: 'The ability to detect emotional tone in user messages', category: 'Advanced', difficulty: 'hard' },
      { id: 9, question: 'What is a conversation flow?', answer: 'The planned path of dialogue between user and chatbot', category: 'Design', difficulty: 'medium' },
      { id: 10, question: 'What is omnichannel deployment?', answer: 'Making chatbots available across multiple platforms and channels', category: 'Deployment', difficulty: 'hard' }
    ]
  },

  'intro-to-intents': {
    id: 'intro-to-intents',
    title: 'Understanding User Intents',
    character: 'AI-ko',
    difficulty: 'Intermediate',
    duration: '8 min',
    description: 'Master the concept of intents - the foundation of conversational AI.',
    panels: [
      {
        id: 'panel-1',
        character: 'AI-ko',
        dialogue: 'An intent represents what a user wants to accomplish. It\'s the goal behind their message.',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'Teacher Jane',
        dialogue: 'When students ask "What time does class end?", "When is dismissal?", or "How long until we\'re done?" - they all have the same intent!',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Student Sarah',
        dialogue: 'So the chatbot needs to recognize that different phrases can mean the same thing?',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'For a pizza ordering bot, which intent would "I want a large pepperoni" belong to?',
          options: [
            'order.pizza',
            'greeting',
            'complaint',
            'payment'
          ],
          correctAnswer: 'order.pizza'
        }
      }
    ],
    flashcards: [
      { id: 1, question: 'What is an intent in chatbots?', answer: 'The goal or purpose behind a user\'s message', category: 'Intent Basics', difficulty: 'easy' },
      { id: 2, question: 'What are training phrases?', answer: 'Example sentences that teach the chatbot how users express a particular intent', category: 'Training', difficulty: 'easy' },
      { id: 3, question: 'What is intent classification?', answer: 'The process of determining which intent a user\'s message belongs to', category: 'Classification', difficulty: 'medium' },
      { id: 4, question: 'What is a fallback intent?', answer: 'A default intent triggered when the chatbot doesn\'t understand the user\'s message', category: 'Special Intents', difficulty: 'medium' },
      { id: 5, question: 'What is intent confidence score?', answer: 'A measure of how certain the AI is about its intent classification', category: 'Confidence', difficulty: 'medium' },
      { id: 6, question: 'What are entities in relation to intents?', answer: 'Specific pieces of information extracted from user messages (like dates, names, or locations)', category: 'Entities', difficulty: 'medium' },
      { id: 7, question: 'What is intent ambiguity?', answer: 'When a user message could belong to multiple intents', category: 'Challenges', difficulty: 'hard' },
      { id: 8, question: 'What is small talk intent?', answer: 'Casual conversation intents like greetings, weather talk, or personal questions', category: 'Intent Types', difficulty: 'easy' },
      { id: 9, question: 'What is a composite intent?', answer: 'When a user message contains multiple intents or requests', category: 'Complex Intents', difficulty: 'hard' },
      { id: 10, question: 'What is intent hierarchy?', answer: 'Organizing intents in categories and subcategories for better management', category: 'Organization', difficulty: 'hard' }
    ]
  },

  'intro-to-special-intents': {
    id: 'intro-to-special-intents',
    title: 'Special Intent Types',
    character: 'Tech Expert',
    difficulty: 'Intermediate',
    duration: '7 min',
    description: 'Learn about special intent types that make chatbots more intelligent.',
    panels: [
      {
        id: 'panel-1',
        character: 'Tech Expert',
        dialogue: 'Beyond basic intents, smart chatbots use special intent types like confirmation, navigation, and system intents.',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'AI-ko',
        dialogue: 'System intents handle technical functions like "yes", "no", "cancel", "help", and "restart" - they work across all conversations!',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'UX Designer',
        dialogue: 'Navigation intents help users move through complex flows: "go back", "main menu", "skip this step".',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What type of intent would "Can you help me?" be?',
          options: [
            'System intent (help)',
            'Navigation intent',
            'Custom business intent',
            'Greeting intent'
          ],
          correctAnswer: 'System intent (help)'
        }
      }
    ],
    flashcards: [
      { id: 1, question: 'What are system intents?', answer: 'Built-in intents that handle common user actions like yes, no, help, cancel', category: 'System', difficulty: 'easy' },
      { id: 2, question: 'What is a confirmation intent?', answer: 'An intent that captures user agreement or disagreement (yes/no responses)', category: 'Confirmation', difficulty: 'easy' },
      { id: 3, question: 'What are navigation intents?', answer: 'Intents that help users move through conversation flows (back, menu, skip)', category: 'Navigation', difficulty: 'medium' },
      { id: 4, question: 'What is a help intent?', answer: 'A system intent that provides assistance information to users', category: 'System', difficulty: 'easy' },
      { id: 5, question: 'What is a cancel intent?', answer: 'An intent that allows users to stop or exit the current conversation flow', category: 'System', difficulty: 'easy' },
      { id: 6, question: 'What is an error recovery intent?', answer: 'Special intents designed to handle misunderstandings and guide users back on track', category: 'Error Handling', difficulty: 'medium' },
      { id: 7, question: 'What is a deep link intent?', answer: 'An intent that allows users to jump directly to specific functions or sections', category: 'Navigation', difficulty: 'hard' },
      { id: 8, question: 'What is a clarification intent?', answer: 'An intent triggered when the bot needs more information from the user', category: 'Clarification', difficulty: 'medium' },
      { id: 9, question: 'What is a goodbye intent?', answer: 'A system intent that handles conversation endings gracefully', category: 'System', difficulty: 'easy' },
      { id: 10, question: 'What is intent prioritization?', answer: 'The process of ranking which intent should trigger when multiple intents match', category: 'Advanced', difficulty: 'hard' }
    ]
  },

  'intro-to-followup-intents': {
    id: 'intro-to-followup-intents',
    title: 'Follow-Up Intents and Context',
    character: 'Context Manager',
    difficulty: 'Advanced',
    duration: '9 min',
    description: 'Master contextual conversations with follow-up intents.',
    panels: [
      {
        id: 'panel-1',
        character: 'Context Manager',
        dialogue: 'Follow-up intents create natural conversations by remembering what was discussed previously.',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'Conversation Expert',
        dialogue: 'When someone asks "Book a flight" then says "Make it business class", the second message needs context from the first!',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'AI-ko',
        dialogue: 'Follow-up intents only activate when specific parent intents have been triggered, creating intelligent conversation flows.',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What is context retention in chatbots?',
          options: [
            'Remembering previous conversation elements to understand current messages',
            'Storing user personal information permanently',
            'Using the same response for all questions',
            'Translating between languages'
          ],
          correctAnswer: 'Remembering previous conversation elements to understand current messages'
        }
      }
    ],
    flashcards: [
      { id: 1, question: 'What are follow-up intents?', answer: 'Intents that only activate in the context of a previous conversation', category: 'Context', difficulty: 'medium' },
      { id: 2, question: 'What is conversation context?', answer: 'Information retained from previous exchanges in a conversation', category: 'Context', difficulty: 'easy' },
      { id: 3, question: 'What is a parent intent?', answer: 'The original intent that enables follow-up intents to activate', category: 'Hierarchy', difficulty: 'medium' },
      { id: 4, question: 'What is context switching?', answer: 'When a conversation moves from one topic or intent to another', category: 'Flow', difficulty: 'medium' },
      { id: 5, question: 'What is session persistence?', answer: 'Maintaining conversation context throughout a user session', category: 'Sessions', difficulty: 'medium' },
      { id: 6, question: 'What are context parameters?', answer: 'Variables stored during conversation to remember important information', category: 'Parameters', difficulty: 'hard' },
      { id: 7, question: 'What is context timeout?', answer: 'When stored conversation context expires after a period of inactivity', category: 'Lifecycle', difficulty: 'hard' },
      { id: 8, question: 'What is intent chaining?', answer: 'Linking multiple intents together in a logical conversation sequence', category: 'Chaining', difficulty: 'hard' },
      { id: 9, question: 'What is slot filling?', answer: 'Collecting required information pieces through follow-up questions', category: 'Data Collection', difficulty: 'medium' },
      { id: 10, question: 'What is conversational repair?', answer: 'Techniques to fix misunderstandings and get conversations back on track', category: 'Error Recovery', difficulty: 'hard' }
    ]
  },

  'conversational-design': {
    id: 'conversational-design',
    title: 'Conversational Design Principles',
    character: 'UX Designer',
    difficulty: 'Advanced',
    duration: '10 min',
    description: 'Learn the art and science of designing natural conversations.',
    panels: [
      {
        id: 'panel-1',
        character: 'UX Designer',
        dialogue: 'Great conversational design feels natural and helpful - like talking to a knowledgeable friend who really listens.',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'Conversation Researcher',
        dialogue: 'We must design for turn-taking, acknowledgment, clarification, and graceful error handling - just like human conversations.',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'User Advocate',
        dialogue: 'Users should always know what they can say, what the bot is doing, and how to get help or start over.',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What makes a conversation feel natural?',
          options: [
            'Clear prompts, acknowledgments, and appropriate responses',
            'Complex technical language',
            'One-word responses',
            'Ignoring user input'
          ],
          correctAnswer: 'Clear prompts, acknowledgments, and appropriate responses'
        }
      }
    ],
    flashcards: [
      { id: 1, question: 'What is conversational design?', answer: 'The practice of designing natural, helpful, and usable conversations between humans and computers', category: 'Design', difficulty: 'easy' },
      { id: 2, question: 'What is turn-taking in conversations?', answer: 'The natural flow of speaking and listening between conversation participants', category: 'Flow', difficulty: 'easy' },
      { id: 3, question: 'What is conversational repair?', answer: 'Strategies to fix misunderstandings and guide conversations back on track', category: 'Error Handling', difficulty: 'medium' },
      { id: 4, question: 'What is progressive disclosure?', answer: 'Revealing information and options gradually to avoid overwhelming users', category: 'Information Architecture', difficulty: 'medium' },
      { id: 5, question: 'What is conversation mapping?', answer: 'Visualizing all possible conversation paths and outcomes', category: 'Planning', difficulty: 'medium' },
      { id: 6, question: 'What is persona consistency?', answer: 'Maintaining the same personality and tone throughout all interactions', category: 'Personality', difficulty: 'medium' },
      { id: 7, question: 'What is error prevention in conversations?', answer: 'Designing to minimize misunderstandings before they happen', category: 'Error Prevention', difficulty: 'hard' },
      { id: 8, question: 'What is conversational scaffolding?', answer: 'Providing structure and guidance to help users navigate conversations successfully', category: 'Support', difficulty: 'hard' },
      { id: 9, question: 'What is multimodal conversation?', answer: 'Conversations that use multiple communication channels like text, voice, and visuals', category: 'Modality', difficulty: 'hard' },
      { id: 10, question: 'What is conversation analytics?', answer: 'Measuring and analyzing conversation performance to improve design', category: 'Analytics', difficulty: 'medium' }
    ]
  },

  'chatbot-personality-design': {
    id: 'chatbot-personality-design',
    title: 'Chatbot Personality Design',
    character: 'Personality Designer',
    difficulty: 'Intermediate',
    duration: '8 min',
    description: 'Create engaging and consistent chatbot personalities.',
    panels: [
      {
        id: 'panel-1',
        character: 'Personality Designer',
        dialogue: 'A chatbot\'s personality is its voice, tone, and character - it should align with your brand and serve your users\' needs.',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'Brand Manager',
        dialogue: 'Should your bot be professional like a banker, friendly like a neighbor, or witty like a comedian? It depends on your audience!',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Voice Designer',
        dialogue: 'Consistency is key - if your bot is helpful and professional, it should never suddenly become sarcastic or rude.',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What should guide chatbot personality design?',
          options: [
            'Brand values and user needs',
            'Latest technology trends',
            'Random personality traits',
            'Complex psychological theories'
          ],
          correctAnswer: 'Brand values and user needs'
        }
      }
    ],
    flashcards: [
      { id: 1, question: 'What is chatbot personality?', answer: 'The consistent voice, tone, and character traits that define how a chatbot communicates', category: 'Personality', difficulty: 'easy' },
      { id: 2, question: 'What are the main personality dimensions?', answer: 'Formal vs casual, serious vs playful, direct vs elaborate, supportive vs challenging', category: 'Dimensions', difficulty: 'medium' },
      { id: 3, question: 'What is brand alignment in chatbots?', answer: 'Ensuring the chatbot personality matches the organization\'s brand values and voice', category: 'Brand', difficulty: 'easy' },
      { id: 4, question: 'What is tone consistency?', answer: 'Maintaining the same emotional tone and communication style across all interactions', category: 'Consistency', difficulty: 'easy' },
      { id: 5, question: 'What is personality adaptation?', answer: 'Adjusting communication style based on context while maintaining core personality traits', category: 'Adaptation', difficulty: 'medium' },
      { id: 6, question: 'What is empathy in chatbot design?', answer: 'The ability to understand and respond appropriately to user emotions and situations', category: 'Empathy', difficulty: 'medium' },
      { id: 7, question: 'What is personality testing for chatbots?', answer: 'Evaluating how well the chatbot personality resonates with target users', category: 'Testing', difficulty: 'hard' },
      { id: 8, question: 'What is cultural sensitivity in personality design?', answer: 'Designing personalities that respect and adapt to different cultural contexts', category: 'Culture', difficulty: 'hard' },
      { id: 9, question: 'What is personality evolution?', answer: 'How chatbot personalities can grow and improve based on user feedback and data', category: 'Evolution', difficulty: 'hard' },
      { id: 10, question: 'What is multi-persona design?', answer: 'Creating different personality variants for different contexts or user segments', category: 'Multi-persona', difficulty: 'hard' }
    ]
  },

  'design-thinking': {
    id: 'design-thinking',
    title: 'Design Thinking for AI',
    character: 'Design Thinker',
    difficulty: 'Advanced',
    duration: '10 min',
    description: 'Apply design thinking methodology to create user-centered AI solutions.',
    panels: [
      {
        id: 'panel-1',
        character: 'Design Thinker',
        dialogue: 'Design thinking puts humans at the center of AI development - we start with empathy, define real problems, and ideate solutions.',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'User Researcher',
        dialogue: 'The five stages are: Empathize (understand users), Define (clarify problems), Ideate (brainstorm solutions), Prototype (build), and Test (validate).',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Innovation Coach',
        dialogue: 'For AI projects, we must also consider ethical implications, bias prevention, and inclusive design from the very beginning.',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What is the first stage of design thinking?',
          options: [
            'Empathize - understanding user needs',
            'Define - stating the problem',
            'Ideate - brainstorming solutions',
            'Prototype - building solutions'
          ],
          correctAnswer: 'Empathize - understanding user needs'
        }
      }
    ],
    flashcards: [
      { id: 1, question: 'What is design thinking?', answer: 'A human-centered approach to innovation that integrates people\'s needs, technology possibilities, and business requirements', category: 'Methodology', difficulty: 'easy' },
      { id: 2, question: 'What are the 5 stages of design thinking?', answer: 'Empathize, Define, Ideate, Prototype, Test', category: 'Process', difficulty: 'easy' },
      { id: 3, question: 'What is the empathize stage?', answer: 'Understanding users\' needs, thoughts, emotions, and motivations through observation and engagement', category: 'Empathize', difficulty: 'easy' },
      { id: 4, question: 'What is the define stage?', answer: 'Synthesizing observations into a clear problem statement that focuses on user needs', category: 'Define', difficulty: 'easy' },
      { id: 5, question: 'What is the ideate stage?', answer: 'Brainstorming creative solutions and thinking outside the box', category: 'Ideate', difficulty: 'easy' },
      { id: 6, question: 'What is rapid prototyping?', answer: 'Quickly building low-fidelity versions of solutions to test ideas', category: 'Prototype', difficulty: 'medium' },
      { id: 7, question: 'What is user-centered design?', answer: 'Design philosophy that prioritizes user needs and experiences in all design decisions', category: 'Philosophy', difficulty: 'medium' },
      { id: 8, question: 'What is divergent thinking?', answer: 'Generating many creative ideas and exploring various possibilities', category: 'Ideation', difficulty: 'medium' },
      { id: 9, question: 'What is convergent thinking?', answer: 'Evaluating and selecting the best ideas to move forward with', category: 'Selection', difficulty: 'medium' },
      { id: 10, question: 'What is human-centered AI?', answer: 'AI systems designed to augment human capabilities while respecting human values and needs', category: 'Human-AI', difficulty: 'hard' }
    ]
  }
};