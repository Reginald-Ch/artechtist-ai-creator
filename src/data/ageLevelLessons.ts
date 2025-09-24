// Age-grouped lesson content for different learning levels
export const ageLevelLessons = {
  'little-explorers': {
    title: 'Little Explorers (Ages 6-8)',
    description: 'Fun and simple AI adventures for young minds',
    ageRange: '6-8',
    color: 'from-pink-400 to-purple-400',
    lessons: {
      'ai-is-everywhere': {
        id: 'ai-is-everywhere',
        title: 'AI is Everywhere!',
        character: 'Robo-Friend',
        difficulty: 'Beginner',
        duration: '3 min',
        ageGroup: 'little-explorers',
        description: 'Discover AI helpers all around us in a fun adventure!',
        panels: [
          {
            id: 'panel-1',
            character: 'Robo-Friend',
            dialogue: '🤖 Hi there! I\'m Robo-Friend! Did you know AI helpers are everywhere? Let\'s go on an adventure to find them!',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-2',
            character: 'Little Emma',
            dialogue: 'Really? Where can we find AI? I don\'t see any robots!',
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-3',
            character: 'Robo-Friend',
            dialogue: '📱 Look at your mom\'s phone! When she asks "Hey Siri, what\'s the weather?" - that\'s AI helping her!',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            animation: 'slideRight'
          },
          {
            id: 'panel-4',
            character: 'Little Emma',
            dialogue: 'Wow! So AI can hear and talk? That\'s amazing!',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-5',
            character: 'Robo-Friend',
            dialogue: '🎵 And when you watch videos on YouTube, AI picks fun videos just for you! It learns what you like!',
            background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-6',
            character: 'Little Emma',
            dialogue: 'That\'s so cool! What else can AI do?',
            background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
            animation: 'slideRight'
          },
          {
            id: 'panel-7',
            character: 'Robo-Friend',
            dialogue: '🚗 AI helps cars know which way to go, helps cameras find faces in photos, and even helps doctors!',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-8',
            character: 'Little Emma',
            dialogue: 'I want to learn more about AI! Can you teach me?',
            background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
            animation: 'celebration'
          }
        ],
        flashcards: [
          { id: 1, question: 'What does AI stand for?', answer: 'Artificial Intelligence - smart computer helpers!', category: 'Basics', difficulty: 'easy' },
          { id: 2, question: 'Can AI hear and talk?', answer: 'Yes! Like Siri and Alexa', category: 'Abilities', difficulty: 'easy' },
          { id: 3, question: 'Where can we find AI?', answer: 'Phones, computers, cars, and many places!', category: 'Examples', difficulty: 'easy' }
        ]
      },
      'smart-helpers': {
        id: 'smart-helpers',
        title: 'Smart Helpers Around Us',
        character: 'Helper Bot',
        difficulty: 'Beginner',
        duration: '4 min',
        ageGroup: 'little-explorers',
        description: 'Meet the AI helpers that make life easier every day!',
        panels: [
          {
            id: 'panel-1',
            character: 'Helper Bot',
            dialogue: '🏠 Welcome to the Smart House! I\'m Helper Bot, and I\'ll show you all the AI helpers here!',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-2',
            character: 'Curious Cat',
            dialogue: 'Meow! What makes them smart, Helper Bot?',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-3',
            character: 'Helper Bot',
            dialogue: '🧠 They learn! Like when Netflix remembers you like cartoons and shows you more cartoons!',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            animation: 'slideRight'
          },
          {
            id: 'panel-4',
            character: 'Curious Cat',
            dialogue: 'That IS smart! What about the lights?',
            background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-5',
            character: 'Helper Bot',
            dialogue: '💡 Smart lights learn when you like them on or off! They can even change colors to match your mood!',
            background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-6',
            character: 'Curious Cat',
            dialogue: 'Purple is my favorite! Can AI helpers be friends?',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            animation: 'slideRight'
          },
          {
            id: 'panel-7',
            character: 'Helper Bot',
            dialogue: '👫 Of course! AI helpers are here to make life fun and easy. We\'re your digital friends!',
            background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
            animation: 'celebration'
          }
        ],
        flashcards: [
          { id: 1, question: 'How do smart helpers learn?', answer: 'They watch what you like and remember it!', category: 'Learning', difficulty: 'easy' },
          { id: 2, question: 'What can smart lights do?', answer: 'Turn on/off and change colors!', category: 'Examples', difficulty: 'easy' },
          { id: 3, question: 'Are AI helpers friendly?', answer: 'Yes! They are digital friends that help us!', category: 'Friendship', difficulty: 'easy' }
        ]
      }
    }
  },
  'young-builders': {
    title: 'Young Builders (Ages 9-12)',
    description: 'Build understanding of how AI works with interactive examples',
    ageRange: '9-12',
    color: 'from-blue-400 to-green-400',
    lessons: {
      'how-ai-learns': {
        id: 'how-ai-learns',
        title: 'How AI Learns from Data',
        character: 'Data Detective',
        difficulty: 'Intermediate',
        duration: '6 min',
        ageGroup: 'young-builders',
        description: 'Discover how AI uses data to get smarter, just like how you learn from practice!',
        panels: [
          {
            id: 'panel-1',
            character: 'Data Detective',
            dialogue: '🔍 Greetings, young builder! I\'m Data Detective. Want to know the secret of how AI gets so smart?',
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-2',
            character: 'Builder Sam',
            dialogue: 'Yes! I want to build my own AI. How does it learn?',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-3',
            character: 'Data Detective',
            dialogue: '📚 Think about learning to ride a bike. You practiced many times, fell down, got back up, and got better!',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
            animation: 'slideRight'
          },
          {
            id: 'panel-4',
            character: 'Builder Sam',
            dialogue: 'Oh! So AI practices too?',
            background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-5',
            character: 'Data Detective',
            dialogue: '🎯 Exactly! But instead of riding bikes, AI practices with DATA. Show it 1000 cat photos, and it learns what cats look like!',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-6',
            character: 'Builder Sam',
            dialogue: 'So more data means smarter AI?',
            background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
            animation: 'slideRight'
          },
          {
            id: 'panel-7',
            character: 'Data Detective',
            dialogue: '✨ Usually yes! But the data needs to be good quality - like having clear photos, not blurry ones!',
            background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-8',
            character: 'Builder Sam',
            dialogue: 'I get it! Good data makes good AI. Now I want to start building!',
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            animation: 'celebration',
            interactiveElement: {
              type: 'quiz',
              content: 'What do you need to train AI to recognize dogs?',
              options: ['Lots of clear dog photos', 'Just one dog photo', 'Only dog videos', 'Pictures of cats'],
              correctAnswer: 'Lots of clear dog photos',
              explanation: 'AI needs many examples to learn patterns. More clear dog photos help AI understand what makes a dog look like a dog!'
            }
          }
        ],
        flashcards: [
          { id: 1, question: 'What is data in AI?', answer: 'Information that AI uses to learn, like photos, text, or numbers', category: 'Data', difficulty: 'medium' },
          { id: 2, question: 'Why does AI need lots of examples?', answer: 'To find patterns and learn what things look like', category: 'Learning', difficulty: 'medium' },
          { id: 3, question: 'What makes data "good quality"?', answer: 'Clear, accurate, and well-organized information', category: 'Quality', difficulty: 'medium' }
        ]
      },
      'building-smart-apps': {
        id: 'building-smart-apps',
        title: 'Building Smart Apps',
        character: 'App Builder',
        difficulty: 'Intermediate',
        duration: '7 min',
        ageGroup: 'young-builders',
        description: 'Learn the steps to create your own AI-powered application!',
        panels: [
          {
            id: 'panel-1',
            character: 'App Builder',
            dialogue: '💻 Ready to build your first smart app? I\'m App Builder, and I\'ll guide you through the process!',
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-2',
            character: 'Coder Zoe',
            dialogue: 'Yes! I want to make an app that can tell if a picture has a cat or dog in it!',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-3',
            character: 'App Builder',
            dialogue: '🎯 Perfect choice! First step: collect data. You\'ll need hundreds of cat and dog photos, all labeled correctly.',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
            animation: 'slideRight'
          },
          {
            id: 'panel-4',
            character: 'Coder Zoe',
            dialogue: 'Hundreds?! That\'s a lot of photos!',
            background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-5',
            character: 'App Builder',
            dialogue: '📊 Step 2: Train the AI! Feed it 80% of your photos so it can learn the differences between cats and dogs.',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-6',
            character: 'Coder Zoe',
            dialogue: 'What about the other 20%?',
            background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
            animation: 'slideRight'
          },
          {
            id: 'panel-7',
            character: 'App Builder',
            dialogue: '🧪 Step 3: Test it! Use the remaining 20% to see how well your AI learned. Good AI gets 90%+ correct!',
            background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-8',
            character: 'Coder Zoe',
            dialogue: 'Then I can use it in my app?',
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-9',
            character: 'App Builder',
            dialogue: '🚀 Step 4: Deploy! Put your trained AI into an app where people can upload photos and get instant results!',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            animation: 'celebration'
          }
        ],
        flashcards: [
          { id: 1, question: 'What are the 4 steps to build an AI app?', answer: 'Collect data, Train AI, Test it, Deploy app', category: 'Process', difficulty: 'medium' },
          { id: 2, question: 'How much data should you use for training?', answer: 'About 80% for training, 20% for testing', category: 'Training', difficulty: 'medium' },
          { id: 3, question: 'What does "deploy" mean?', answer: 'Put your AI into an app that people can use', category: 'Development', difficulty: 'medium' }
        ]
      }
    }
  },
  'ai-ambassadors': {
    title: 'AI Ambassadors (Ages 13-16)',
    description: 'Advanced concepts and real-world AI applications for future innovators',
    ageRange: '13-16',
    color: 'from-purple-400 to-red-400',
    lessons: {
      'neural-networks-deep-dive': {
        id: 'neural-networks-deep-dive',
        title: 'Neural Networks: AI\'s Brain',
        character: 'Neural Navigator',
        difficulty: 'Advanced',
        duration: '10 min',
        ageGroup: 'ai-ambassadors',
        description: 'Explore how artificial neural networks mimic the human brain to solve complex problems.',
        panels: [
          {
            id: 'panel-1',
            character: 'Neural Navigator',
            dialogue: '🧠 Welcome, future AI ambassador! I\'m Neural Navigator. Ready to explore the brain of AI?',
            background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-2',
            character: 'Teen Alex',
            dialogue: 'Absolutely! I\'ve heard neural networks are inspired by our brains. How similar are they really?',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-3',
            character: 'Neural Navigator',
            dialogue: '🔗 Great question! Like brain neurons, artificial neurons connect in networks. Each connection has a "weight" that determines how much influence it has.',
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            animation: 'slideRight'
          },
          {
            id: 'panel-4',
            character: 'Teen Alex',
            dialogue: 'So it\'s like a web of decision-makers?',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-5',
            character: 'Neural Navigator',
            dialogue: '⚡ Exactly! Input data flows through layers. Each layer transforms the data, finding more complex patterns as it goes deeper.',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-6',
            character: 'Teen Alex',
            dialogue: 'That\'s why they call it "deep learning" with many layers?',
            background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
            animation: 'slideRight'
          },
          {
            id: 'panel-7',
            character: 'Neural Navigator',
            dialogue: '🎯 Precisely! Deep networks with millions of neurons can recognize faces, understand speech, even create art!',
            background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-8',
            character: 'Teen Alex',
            dialogue: 'How do we train these massive networks?',
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-9',
            character: 'Neural Navigator',
            dialogue: '📈 Through backpropagation! The network makes predictions, compares them to correct answers, and adjusts weights to improve.',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            animation: 'slideRight'
          },
          {
            id: 'panel-10',
            character: 'Teen Alex',
            dialogue: 'This is the foundation of modern AI! I want to build my own neural network.',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            animation: 'celebration',
            interactiveElement: {
              type: 'quiz',
              content: 'What is backpropagation?',
              options: [
                'A method to train neural networks by adjusting weights based on errors',
                'A way to make networks run backwards',
                'A technique to reduce network size',
                'A programming language for AI'
              ],
              correctAnswer: 'A method to train neural networks by adjusting weights based on errors',
              explanation: 'Backpropagation calculates how much each weight contributed to errors and adjusts them to minimize future mistakes.'
            }
          }
        ],
        flashcards: [
          { id: 1, question: 'What is a neural network?', answer: 'A computing system inspired by biological neural networks', category: 'Architecture', difficulty: 'hard' },
          { id: 2, question: 'What are weights in neural networks?', answer: 'Values that determine the strength of connections between neurons', category: 'Components', difficulty: 'hard' },
          { id: 3, question: 'What is backpropagation?', answer: 'An algorithm for training networks by propagating errors backwards', category: 'Training', difficulty: 'hard' }
        ]
      },
      'ai-ethics-responsibility': {
        id: 'ai-ethics-responsibility',
        title: 'AI Ethics & Responsibility',
        character: 'Ethics Guardian',
        difficulty: 'Advanced',
        duration: '12 min',
        ageGroup: 'ai-ambassadors',
        description: 'Navigate the complex ethical landscape of AI development and deployment.',
        panels: [
          {
            id: 'panel-1',
            character: 'Ethics Guardian',
            dialogue: '⚖️ Greetings, future leader! I\'m Ethics Guardian. With great AI power comes great responsibility. Are you ready to explore this?',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-2',
            character: 'Teen Jordan',
            dialogue: 'Yes! I want to build AI that helps people, but I\'ve heard about bias and unfairness. How do we avoid that?',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-3',
            character: 'Ethics Guardian',
            dialogue: '🎯 Excellent awareness! Bias often comes from training data. If your data mostly shows doctors as men, AI might assume all doctors are male.',
            background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
            animation: 'slideRight'
          },
          {
            id: 'panel-4',
            character: 'Teen Jordan',
            dialogue: 'So diverse, representative data is crucial?',
            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-5',
            character: 'Ethics Guardian',
            dialogue: '🌍 Absolutely! But it goes deeper. We must consider: Is this AI fair to all groups? Does it respect privacy? Could it cause harm?',
            background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-6',
            character: 'Teen Jordan',
            dialogue: 'What about AI making important decisions, like hiring or medical diagnosis?',
            background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
            animation: 'slideRight'
          },
          {
            id: 'panel-7',
            character: 'Ethics Guardian',
            dialogue: '⚠️ Critical point! AI should augment human decision-making, not replace it. Humans must remain accountable for important choices.',
            background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-8',
            character: 'Teen Jordan',
            dialogue: 'How do we ensure AI systems are transparent and explainable?',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            animation: 'slideLeft'
          },
          {
            id: 'panel-9',
            character: 'Ethics Guardian',
            dialogue: '🔍 Great question! We\'re developing "explainable AI" that can show its reasoning. Users deserve to understand how decisions affecting them are made.',
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            animation: 'slideRight'
          },
          {
            id: 'panel-10',
            character: 'Teen Jordan',
            dialogue: 'This is complex but so important. How can I be an ethical AI developer?',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
            animation: 'fadeIn'
          },
          {
            id: 'panel-11',
            character: 'Ethics Guardian',
            dialogue: '✨ Ask hard questions: Who benefits? Who might be harmed? Is this fair? Always test for bias and involve diverse perspectives in development.',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            animation: 'celebration'
          }
        ],
        flashcards: [
          { id: 1, question: 'What is algorithmic bias?', answer: 'Unfair discrimination that occurs when AI systems make biased decisions', category: 'Ethics', difficulty: 'hard' },
          { id: 2, question: 'Why is explainable AI important?', answer: 'People deserve to understand how AI systems make decisions that affect them', category: 'Transparency', difficulty: 'hard' },
          { id: 3, question: 'What role should humans play in AI decisions?', answer: 'Humans should remain accountable for important decisions, with AI as a tool', category: 'Responsibility', difficulty: 'hard' }
        ]
      }
    }
  }
};

// Additional research-based topics for each age group
export const researchBasedTopics = {
  'little-explorers': [
    'What is AI vs What is NOT AI',
    'AI Animal Friends (Computer Vision for Kids)',
    'Talking to Computers (Voice Recognition)',
    'AI Magic Tricks (Pattern Recognition)',
  ],
  'young-builders': [
    'Computer Vision Basics',
    'Natural Language Processing for Kids',
    'AI in Games and Fun',
    'Data Collection and Patterns',
    'Simple Machine Learning Concepts'
  ],
  'ai-ambassadors': [
    'Advanced Neural Network Architectures',
    'AI in Society and Ethics',
    'Machine Learning Algorithms',
    'AI Safety and Alignment',
    'Future of AI and Careers'
  ]
};

export default ageLevelLessons;