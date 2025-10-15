import { Lesson } from '@/types/lesson';

// AI4K12-aligned lessons following the "5 Big Ideas in AI" framework
// Reference: https://ai4k12.org/

export const ai4k12Lessons: Record<string, Lesson> = {
  // BIG IDEA 1: PERCEPTION - How computers sense and understand the world
  'perception-sensors': {
    id: 'perception-sensors',
    title: 'How Machines See: Computer Vision',
    character: 'Vision Explorer',
    difficulty: 'Beginner',
    duration: '8 min',
    description: 'Discover how computers use cameras and sensors to "see" and understand the world around them.',
    tags: ['perception', 'computer-vision', 'sensors', 'ai4k12-big-idea-1'],
    panels: [
      {
        id: 'panel-1',
        character: 'Vision Explorer',
        dialogue: '👁️ Welcome! I\'m Vision Explorer. Ever wonder how your phone recognizes your face, or how self-driving cars "see" the road?',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'Student Maya',
        dialogue: 'Yes! My phone unlocks just by looking at it. How does it know it\'s me?',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Vision Explorer',
        dialogue: '📸 Computers don\'t "see" like humans. They convert images into millions of numbers - each pixel becomes data! A camera is just a sensor that captures light.',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideRight',
        realWorldExample: '🌟 Real Example: Face ID on phones uses infrared cameras to create a 3D map of your face with over 30,000 invisible dots! This creates a unique mathematical pattern that unlocks your phone.'
      },
      {
        id: 'panel-4',
        character: 'Student Maya',
        dialogue: 'Wait, so my face is just... numbers?',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        animation: 'fadeIn',
        interactiveElement: {
          type: 'question',
          content: 'How does a computer represent a color image?',
          options: [
            'As millions of numbers for red, green, and blue values',
            'As a drawing on a screen',
            'As words describing the image',
            'By memorizing what it looks like'
          ],
          correctAnswer: 'As millions of numbers for red, green, and blue values',
          explanation: 'Each pixel has 3 numbers (0-255) for red, green, and blue. A 1000x1000 image has 3 million numbers!'
        }
      },
      {
        id: 'panel-5',
        character: 'Vision Explorer',
        dialogue: '🎯 Exactly! Then AI looks for patterns in those numbers. Your face has unique patterns - distance between eyes, nose shape, jaw line.',
        background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-6',
        character: 'Tech Guru',
        dialogue: 'This is called feature detection. AI finds edges, shapes, textures - like how you recognize a friend by their features.',
        background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-7',
        character: 'Student Maya',
        dialogue: 'What other sensors do computers use besides cameras?',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-8',
        character: 'Vision Explorer',
        dialogue: '🎤 Microphones capture sound waves, LiDAR measures distances with lasers, thermal sensors detect heat, and touchscreens feel pressure!',
        background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
        animation: 'slideLeft',
        realWorldExample: '🚗 Real Example: Tesla self-driving cars use 8 cameras, 12 ultrasonic sensors, and radar to "see" 360 degrees around the car in all weather conditions!'
      },
      {
        id: 'panel-9',
        character: 'Tech Guru',
        dialogue: 'Medical AI uses X-ray sensors, self-driving cars combine cameras + LiDAR + radar. More sensors = better understanding!',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-10',
        character: 'Student Maya',
        dialogue: 'So perception is the first step - turning the real world into data AI can understand!',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        animation: 'celebration'
      }
    ],
    flashcards: [
      { id: 1, question: 'What is computer vision?', answer: 'The ability of computers to understand and interpret visual information from images or videos', category: 'Perception', difficulty: 'easy' },
      { id: 2, question: 'How do computers represent images?', answer: 'As arrays of numbers representing pixel colors (RGB values)', category: 'Representation', difficulty: 'medium' },
      { id: 3, question: 'What is feature detection?', answer: 'Finding important patterns like edges, shapes, and textures in images', category: 'Techniques', difficulty: 'medium' },
      { id: 4, question: 'Name 3 types of sensors AI uses', answer: 'Cameras, microphones, LiDAR, thermal sensors, radar', category: 'Hardware', difficulty: 'easy' },
      { id: 5, question: 'Why do self-driving cars use multiple sensors?', answer: 'Different sensors provide different information, creating a more complete understanding', category: 'Applications', difficulty: 'hard' }
    ]
  },

  // BIG IDEA 2: REPRESENTATION & REASONING - How machines think
  'how-machines-think': {
    id: 'how-machines-think',
    title: 'How Machines Think: Representation & Reasoning',
    character: 'Logic Master',
    difficulty: 'Intermediate',
    duration: '10 min',
    description: 'Explore the fascinating world of how computers represent knowledge and make decisions.',
    tags: ['reasoning', 'knowledge-representation', 'decision-making', 'ai4k12-big-idea-2'],
    panels: [
      {
        id: 'panel-1',
        character: 'Logic Master',
        dialogue: '🧠 Welcome to the mind of AI! I\'m Logic Master. Today we\'ll discover how machines "think" and make decisions.',
        background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'Student Jamal',
        dialogue: 'Do computers really think like humans? I thought they just follow instructions!',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Logic Master',
        dialogue: '💭 Good insight! Computers don\'t think like humans, but they can solve problems. First, they need to represent knowledge in a way they understand.',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-4',
        character: 'Data Scientist',
        dialogue: 'Think of a map app. It represents roads as a network: places are points, roads are connections. This is called a graph!',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        animation: 'fadeIn',
        interactiveElement: {
          type: 'question',
          content: 'Why does a map app represent roads as a graph?',
          options: [
            'To find the shortest or fastest path between locations',
            'To make pretty pictures',
            'Because computers like graphs',
            'To save memory space'
          ],
          correctAnswer: 'To find the shortest or fastest path between locations',
          explanation: 'Graphs let AI use algorithms like Dijkstra\'s to calculate optimal routes!'
        }
      },
      {
        id: 'panel-5',
        character: 'Student Jamal',
        dialogue: 'So representation is like choosing the right language to describe a problem?',
        background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-6',
        character: 'Logic Master',
        dialogue: '🎯 Exactly! Different representations work for different problems. Medical AI uses decision trees: IF fever AND cough, THEN might be flu.',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-7',
        character: 'Data Scientist',
        dialogue: 'Reasoning is making logical conclusions from knowledge. IF all humans are mortal AND Socrates is human, THEN Socrates is mortal.',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-8',
        character: 'Student Jamal',
        dialogue: 'Can AI reason with uncertainty? Like "probably" or "maybe"?',
        background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-9',
        character: 'Logic Master',
        dialogue: '📊 Yes! Probabilistic reasoning uses probability. Weather AI says "70% chance of rain" because perfect certainty is rare in the real world.',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What type of reasoning handles uncertainty?',
          options: [
            'Probabilistic reasoning using probabilities',
            'Logical reasoning with true/false',
            'Emotional reasoning',
            'Random guessing'
          ],
          correctAnswer: 'Probabilistic reasoning using probabilities'
        }
      },
      {
        id: 'panel-10',
        character: 'Data Scientist',
        dialogue: 'AI also uses heuristics - rules of thumb. Chess AI doesn\'t check every possible move, it uses smart shortcuts!',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-11',
        character: 'Student Jamal',
        dialogue: 'So machines "think" by: 1) Representing knowledge, 2) Applying logic rules, 3) Handling uncertainty, 4) Using smart shortcuts!',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        animation: 'celebration'
      }
    ],
    flashcards: [
      { id: 1, question: 'What is knowledge representation?', answer: 'How AI stores and organizes information to reason about it', category: 'Concepts', difficulty: 'medium' },
      { id: 2, question: 'What is a graph in AI?', answer: 'A network structure with nodes (points) and edges (connections)', category: 'Data Structures', difficulty: 'medium' },
      { id: 3, question: 'What is logical reasoning?', answer: 'Drawing conclusions from rules and facts using logic', category: 'Reasoning', difficulty: 'easy' },
      { id: 4, question: 'What is probabilistic reasoning?', answer: 'Making decisions under uncertainty using probabilities', category: 'Reasoning', difficulty: 'medium' },
      { id: 5, question: 'What is a heuristic?', answer: 'A rule of thumb or shortcut for solving problems faster', category: 'Optimization', difficulty: 'hard' },
      { id: 6, question: 'Give an example of a decision tree', answer: 'IF-THEN rules organized in a tree structure for classification', category: 'Applications', difficulty: 'medium' }
    ]
  },

  // BIG IDEA 3: LEARNING - Machine Learning fundamentals
  'machine-learning-intro': {
    id: 'machine-learning-intro',
    title: 'Machine Learning: How AI Learns from Experience',
    character: 'Learning Guide',
    difficulty: 'Intermediate',
    duration: '12 min',
    description: 'Understand how machines learn patterns from data without being explicitly programmed.',
    tags: ['machine-learning', 'training', 'data', 'ai4k12-big-idea-3'],
    panels: [
      {
        id: 'panel-1',
        character: 'Learning Guide',
        dialogue: '📚 Hello! I\'m Learning Guide. The most powerful AI today doesn\'t follow programmed rules - it learns from examples!',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'Student Sofia',
        dialogue: 'How can a computer learn? I thought we had to program every step!',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Learning Guide',
        dialogue: '🎓 Think about learning to ride a bike. Did someone program every muscle movement? No! You practiced, made mistakes, and improved.',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-4',
        character: 'ML Engineer',
        dialogue: 'Machine Learning is similar! We show AI thousands of examples, and it finds patterns. Show 10,000 cat photos labeled "cat" - it learns what cats look like.',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        animation: 'fadeIn',
        interactiveElement: {
          type: 'question',
          content: 'What does a machine learning model need to learn?',
          options: [
            'Lots of example data with labels',
            'Just one perfect example',
            'Detailed programming instructions',
            'Human supervision for each decision'
          ],
          correctAnswer: 'Lots of example data with labels',
          explanation: 'More diverse, high-quality examples = better learning!'
        }
      },
      {
        id: 'panel-5',
        character: 'Student Sofia',
        dialogue: 'So it\'s like the AI is practicing with homework examples?',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-6',
        character: 'Learning Guide',
        dialogue: '✨ Perfect analogy! This is called training. The training data is like homework. The AI adjusts its internal parameters to minimize errors.',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-7',
        character: 'ML Engineer',
        dialogue: 'There are 3 main types: 1) Supervised Learning - learning from labeled examples like we just discussed.',
        background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-8',
        character: 'ML Engineer',
        dialogue: '2) Unsupervised Learning - finding hidden patterns in data WITHOUT labels. Like grouping customers by shopping behavior.',
        background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-9',
        character: 'ML Engineer',
        dialogue: '3) Reinforcement Learning - learning through trial and error with rewards. Like training a dog: good action = treat, bad action = no treat!',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'Which learning type is used for game-playing AI?',
          options: [
            'Reinforcement Learning - rewards for winning moves',
            'Supervised Learning - labeled examples',
            'Unsupervised Learning - finding patterns',
            'None - games use programmed rules'
          ],
          correctAnswer: 'Reinforcement Learning - rewards for winning moves',
          explanation: 'AI like AlphaGo learned by playing millions of games and getting rewards for winning!'
        }
      },
      {
        id: 'panel-10',
        character: 'Student Sofia',
        dialogue: 'What prevents the AI from just memorizing the training data?',
        background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-11',
        character: 'Learning Guide',
        dialogue: '🎯 Great question! We test on NEW data it hasn\'t seen. If it memorized instead of learning patterns, it fails on new examples - that\'s called overfitting.',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-12',
        character: 'ML Engineer',
        dialogue: 'We split data: 80% for training, 20% for testing. Good AI generalizes - applies learned patterns to completely new situations!',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-13',
        character: 'Student Sofia',
        dialogue: 'Machine Learning is powerful! AI learns patterns from data, then applies them to new situations. Amazing!',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        animation: 'celebration'
      }
    ],
    flashcards: [
      { id: 1, question: 'What is Machine Learning?', answer: 'AI learning patterns from data without explicit programming', category: 'Fundamentals', difficulty: 'easy' },
      { id: 2, question: 'What are the 3 main types of ML?', answer: 'Supervised, Unsupervised, and Reinforcement Learning', category: 'Types', difficulty: 'medium' },
      { id: 3, question: 'What is Supervised Learning?', answer: 'Learning from labeled training examples', category: 'Supervised', difficulty: 'easy' },
      { id: 4, question: 'What is Unsupervised Learning?', answer: 'Finding patterns in data without labels', category: 'Unsupervised', difficulty: 'medium' },
      { id: 5, question: 'What is Reinforcement Learning?', answer: 'Learning through trial and error with rewards and penalties', category: 'Reinforcement', difficulty: 'medium' },
      { id: 6, question: 'What is overfitting?', answer: 'When a model memorizes training data instead of learning general patterns', category: 'Problems', difficulty: 'hard' },
      { id: 7, question: 'Why split data into training and testing sets?', answer: 'To verify the model generalizes to new, unseen data', category: 'Evaluation', difficulty: 'medium' },
      { id: 8, question: 'What is a training dataset?', answer: 'The data used to teach the machine learning model', category: 'Data', difficulty: 'easy' }
    ]
  },

  // Neural Networks - Deep Learning
  'neural-networks-explained': {
    id: 'neural-networks-explained',
    title: 'Neural Networks: The Brain of Modern AI',
    character: 'Neural Navigator',
    difficulty: 'Advanced',
    duration: '12 min',
    description: 'Dive deep into how artificial neural networks work and power today\'s most advanced AI systems.',
    tags: ['neural-networks', 'deep-learning', 'machine-learning', 'ai4k12-big-idea-3'],
    panels: [
      {
        id: 'panel-1',
        character: 'Neural Navigator',
        dialogue: '🧠 Greetings! I\'m Neural Navigator. Neural networks are inspired by your brain - let\'s explore how!',
        background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'Student Marcus',
        dialogue: 'I\'ve heard neural networks can recognize faces, generate art, and even write! How do they work?',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Neural Navigator',
        dialogue: '⚡ Your brain has ~86 billion neurons connected in networks. Each neuron receives signals, processes them, and sends signals to other neurons.',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-4',
        character: 'Neuroscientist',
        dialogue: 'Artificial neurons are similar but simpler! Each receives numbers (inputs), multiplies them by weights, adds them up, and produces an output.',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-5',
        character: 'Student Marcus',
        dialogue: 'What are weights?',
        background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
        animation: 'slideLeft',
        interactiveElement: {
          type: 'question',
          content: 'What do weights represent in a neural network?',
          options: [
            'The strength or importance of connections between neurons',
            'The physical weight of the computer',
            'The amount of data processed',
            'The speed of computation'
          ],
          correctAnswer: 'The strength or importance of connections between neurons',
          explanation: 'Weights determine how much influence one neuron has on another - this is what the network learns!'
        }
      },
      {
        id: 'panel-6',
        character: 'Neural Navigator',
        dialogue: '🎯 Weights are the "knowledge"! During training, the network adjusts weights to reduce errors. It\'s like tuning a musical instrument.',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-7',
        character: 'Neuroscientist',
        dialogue: 'Neurons are organized in layers: Input Layer → Hidden Layers → Output Layer. Data flows forward through the network.',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-8',
        character: 'Student Marcus',
        dialogue: 'Why are they called "deep" neural networks?',
        background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-9',
        character: 'Neural Navigator',
        dialogue: '📊 "Deep" means many hidden layers! Each layer learns increasingly complex features. Layer 1: edges. Layer 2: shapes. Layer 3: objects!',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-10',
        character: 'Neuroscientist',
        dialogue: 'Training uses backpropagation: Make a prediction → Calculate error → Adjust weights backward through layers → Repeat millions of times!',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        animation: 'fadeIn',
        interactiveElement: {
          type: 'question',
          content: 'How does a neural network improve over time?',
          options: [
            'By adjusting weights to minimize prediction errors',
            'By adding more neurons automatically',
            'By memorizing all training examples',
            'By running faster processors'
          ],
          correctAnswer: 'By adjusting weights to minimize prediction errors'
        }
      },
      {
        id: 'panel-11',
        character: 'Student Marcus',
        dialogue: 'What makes neural networks so powerful for image recognition?',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-12',
        character: 'Neural Navigator',
        dialogue: '🎨 CNNs (Convolutional Neural Networks) use special layers that detect patterns anywhere in an image - like finding cats regardless of position!',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-13',
        character: 'Neuroscientist',
        dialogue: 'Modern neural networks have millions of neurons and billions of connections. GPT models have 175 billion parameters!',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-14',
        character: 'Student Marcus',
        dialogue: 'Neural networks are incredible! They mimic brain structure, learn from examples, and power the AI revolution!',
        background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
        animation: 'celebration'
      }
    ],
    flashcards: [
      { id: 1, question: 'What is an artificial neuron?', answer: 'A computational unit that receives inputs, processes them with weights, and produces an output', category: 'Architecture', difficulty: 'medium' },
      { id: 2, question: 'What are weights in neural networks?', answer: 'Parameters that determine the strength of connections between neurons', category: 'Components', difficulty: 'medium' },
      { id: 3, question: 'What is a layer in a neural network?', answer: 'A collection of neurons that process data at the same stage', category: 'Structure', difficulty: 'easy' },
      { id: 4, question: 'What does "deep" mean in deep learning?', answer: 'Having many hidden layers between input and output', category: 'Terminology', difficulty: 'easy' },
      { id: 5, question: 'What is backpropagation?', answer: 'The algorithm that adjusts weights by propagating errors backward through the network', category: 'Training', difficulty: 'hard' },
      { id: 6, question: 'What is a CNN?', answer: 'Convolutional Neural Network - specialized for image processing', category: 'Types', difficulty: 'medium' },
      { id: 7, question: 'How many parameters do large language models have?', answer: 'Billions of parameters (e.g., GPT-3 has 175 billion)', category: 'Scale', difficulty: 'hard' }
    ]
  },

  // BIG IDEA 4: NATURAL INTERACTION - How humans interact with AI
  'natural-interaction': {
    id: 'natural-interaction',
    title: 'Talking to Machines: Natural Language Processing',
    character: 'Chat Expert',
    difficulty: 'Intermediate',
    duration: '10 min',
    description: 'Learn how AI understands and generates human language, making natural conversation possible.',
    tags: ['nlp', 'natural-language', 'chatbots', 'ai4k12-big-idea-4'],
    panels: [
      {
        id: 'panel-1',
        character: 'Chat Expert',
        dialogue: '💬 Hi there! I\'m Chat Expert. Let\'s explore how AI can understand and speak human languages!',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'Student Emma',
        dialogue: 'When I ask Alexa "What\'s the weather?", how does it understand what I mean?',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Chat Expert',
        dialogue: '🎯 Great question! Natural Language Processing (NLP) involves multiple steps: Speech Recognition → Text Understanding → Response Generation → Speech Synthesis.',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-4',
        character: 'NLP Engineer',
        dialogue: 'First, speech recognition converts your voice waves into text. It uses acoustic models trained on millions of voice samples!',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'fadeIn',
        interactiveElement: {
          type: 'question',
          content: 'What is the first step in voice AI?',
          options: [
            'Converting speech to text',
            'Understanding the meaning',
            'Generating a response',
            'Speaking the answer'
          ],
          correctAnswer: 'Converting speech to text',
          explanation: 'Speech-to-text must happen before the AI can understand what you said!'
        }
      },
      {
        id: 'panel-5',
        character: 'Student Emma',
        dialogue: 'Then what? The AI has text, but how does it understand what I want?',
        background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-6',
        character: 'Chat Expert',
        dialogue: '📝 Intent Recognition! AI identifies your goal: "weather" = weather_query intent. "play music" = music_play intent. "set alarm" = alarm_set intent.',
        background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-7',
        character: 'NLP Engineer',
        dialogue: 'AI also extracts entities - important details like location, time, or item names. "Weather in Paris tomorrow" → Location: Paris, Time: tomorrow',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-8',
        character: 'Student Emma',
        dialogue: 'What about understanding context? Like if I say "What about Friday?" after asking about weather?',
        background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-9',
        character: 'Chat Expert',
        dialogue: '🔗 Context tracking! Good chatbots remember conversation history. They know "Friday" refers to weather because of your previous question.',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'Why is context important in conversations?',
          options: [
            'Words have different meanings in different contexts',
            'It makes the AI sound smarter',
            'It speeds up processing',
            'It saves memory'
          ],
          correctAnswer: 'Words have different meanings in different contexts',
          explanation: '"Bank" could mean river bank or money bank - context determines which!'
        }
      },
      {
        id: 'panel-10',
        character: 'NLP Engineer',
        dialogue: 'Language models like GPT learn patterns from billions of text examples. They predict what words make sense based on context.',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-11',
        character: 'Student Emma',
        dialogue: 'Can AI understand multiple languages? What about slang or emojis?',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-12',
        character: 'Chat Expert',
        dialogue: '🌍 Modern AI is multilingual! Translation models convert between 100+ languages. And yes, AI is learning slang and emoji meanings too! 😊',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-13',
        character: 'Student Emma',
        dialogue: 'NLP makes human-AI interaction natural! Speech → Text → Understanding → Response → Speech. Amazing!',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        animation: 'celebration'
      }
    ],
    flashcards: [
      { id: 1, question: 'What is NLP?', answer: 'Natural Language Processing - how computers understand and generate human language', category: 'Fundamentals', difficulty: 'easy' },
      { id: 2, question: 'What is intent recognition?', answer: 'Identifying what a user wants to accomplish from their message', category: 'Techniques', difficulty: 'medium' },
      { id: 3, question: 'What are entities in NLP?', answer: 'Important pieces of information like names, places, dates, or numbers', category: 'Concepts', difficulty: 'medium' },
      { id: 4, question: 'Why is context important?', answer: 'Same words can mean different things depending on the situation', category: 'Understanding', difficulty: 'easy' },
      { id: 5, question: 'What is a language model?', answer: 'An AI model that predicts and generates text based on patterns learned from data', category: 'Models', difficulty: 'hard' },
      { id: 6, question: 'Name the 4 steps of voice AI', answer: 'Speech Recognition, Understanding, Response Generation, Speech Synthesis', category: 'Process', difficulty: 'hard' }
    ]
  },

  // BIG IDEA 5: SOCIETAL IMPACT - AI Ethics and Impact
  'ai-ethics-bias': {
    id: 'ai-ethics-bias',
    title: 'AI Ethics: Fairness, Bias, and Responsibility',
    character: 'Ethics Guardian',
    difficulty: 'Advanced',
    duration: '12 min',
    description: 'Explore the critical ethical considerations and societal impacts of AI systems.',
    tags: ['ethics', 'bias', 'fairness', 'society', 'ai4k12-big-idea-5'],
    panels: [
      {
        id: 'panel-1',
        character: 'Ethics Guardian',
        dialogue: '⚖️ Welcome, future AI leader! I\'m Ethics Guardian. With great AI power comes great responsibility.',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-2',
        character: 'Student Alex',
        dialogue: 'Why do we need to worry about ethics? Isn\'t AI just math and code?',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-3',
        character: 'Ethics Guardian',
        dialogue: '🎯 AI affects people\'s lives! It decides loan approvals, job applications, medical diagnoses, and criminal sentencing. If AI is biased, real people suffer.',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-4',
        character: 'Social Scientist',
        dialogue: 'Bias means unfair treatment of groups. If training data has historical biases, AI learns and amplifies them!',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        animation: 'fadeIn',
        interactiveElement: {
          type: 'question',
          content: 'How can AI become biased?',
          options: [
            'By learning from biased training data',
            'By being programmed to be mean',
            'By running too fast',
            'AI cannot be biased'
          ],
          correctAnswer: 'By learning from biased training data',
          explanation: 'If historical data reflects societal biases, the AI will learn those biases!'
        }
      },
      {
        id: 'panel-5',
        character: 'Student Alex',
        dialogue: 'Can you give me a real example?',
        background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-6',
        character: 'Ethics Guardian',
        dialogue: '📸 Face recognition AI trained mostly on one ethnicity performed poorly on other ethnicities. This caused real problems in security and law enforcement.',
        background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-7',
        character: 'Social Scientist',
        dialogue: 'Another example: hiring AI trained on historical data favored candidates similar to past hires, perpetuating lack of diversity.',
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-8',
        character: 'Student Alex',
        dialogue: 'That\'s serious! How do we make AI fair?',
        background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-9',
        character: 'Ethics Guardian',
        dialogue: '✅ Multiple strategies: 1) Diverse training data representing all groups. 2) Regular fairness testing. 3) Diverse AI development teams. 4) Transparency.',
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        animation: 'slideRight',
        interactiveElement: {
          type: 'question',
          content: 'What helps reduce AI bias?',
          options: [
            'Diverse training data and development teams',
            'Faster computers',
            'More complex algorithms',
            'Keeping AI secret'
          ],
          correctAnswer: 'Diverse training data and development teams'
        }
      },
      {
        id: 'panel-10',
        character: 'Social Scientist',
        dialogue: 'Privacy is another huge concern. AI often needs data about people. We must protect personal information and get informed consent.',
        background: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-11',
        character: 'Student Alex',
        dialogue: 'What about AI taking jobs? Will robots replace humans?',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-12',
        character: 'Ethics Guardian',
        dialogue: '🤝 AI will change work, not eliminate it. History shows technology creates new jobs while automating repetitive tasks. But we must prepare workers for transitions!',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-13',
        character: 'Social Scientist',
        dialogue: 'Explainability matters too! If AI denies your loan, you deserve to know why. "Black box" decisions are unfair.',
        background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        animation: 'fadeIn'
      },
      {
        id: 'panel-14',
        character: 'Student Alex',
        dialogue: 'Who decides what\'s ethical? AI developers? Governments? Users?',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
        animation: 'slideLeft'
      },
      {
        id: 'panel-15',
        character: 'Ethics Guardian',
        dialogue: '🌍 Everyone! That\'s why diverse voices matter. Different cultures have different values. Global cooperation is essential for responsible AI.',
        background: 'linear-gradient(135deg, #fef7cd 0%, #fde68a 100%)',
        animation: 'slideRight'
      },
      {
        id: 'panel-16',
        character: 'Student Alex',
        dialogue: 'As future AI creators, we must build technology that\'s fair, transparent, and benefits everyone. I\'m ready to lead responsibly!',
        background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
        animation: 'celebration'
      }
    ],
    flashcards: [
      { id: 1, question: 'What is AI bias?', answer: 'Unfair treatment of certain groups due to biased training data or algorithms', category: 'Ethics', difficulty: 'easy' },
      { id: 2, question: 'How does AI bias occur?', answer: 'When training data reflects historical or societal biases', category: 'Causes', difficulty: 'medium' },
      { id: 3, question: 'What is fairness in AI?', answer: 'Ensuring AI treats all groups equitably without discrimination', category: 'Principles', difficulty: 'medium' },
      { id: 4, question: 'What is explainable AI?', answer: 'AI systems that can explain their decisions in human-understandable terms', category: 'Transparency', difficulty: 'hard' },
      { id: 5, question: 'Why is privacy important in AI?', answer: 'AI often uses personal data that must be protected and used responsibly', category: 'Privacy', difficulty: 'easy' },
      { id: 6, question: 'How can we reduce AI bias?', answer: 'Use diverse training data, diverse dev teams, regular testing, and transparency', category: 'Solutions', difficulty: 'hard' },
      { id: 7, question: 'What is the societal impact of AI?', answer: 'AI affects jobs, privacy, fairness, safety, and many aspects of society', category: 'Impact', difficulty: 'medium' }
    ]
  }
};
