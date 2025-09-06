export interface CommunityAvatar {
  id: string;
  emoji: string;
  name: string;
  title: string;
  personality: string;
  description: string;
  traits: string[];
  color: string;
  category: 'education' | 'health' | 'safety' | 'environment' | 'arts' | 'sports' | 'tech' | 'community';
  impact: string;
}

export const communityAvatars: CommunityAvatar[] = [
  // Education
  {
    id: 'teacher',
    emoji: '👩‍🏫',
    name: 'Ms. Wisdom',
    title: 'The Teacher',
    personality: 'patient and encouraging educator who loves helping kids learn',
    description: 'Friendly mentor with glasses and a love for learning',
    traits: ['Patient', 'Encouraging', 'Knowledgeable'],
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    category: 'education',
    impact: 'Helps kids discover the joy of learning'
  },
  {
    id: 'librarian',
    emoji: '📚',
    name: 'Book Buddy',
    title: 'The Librarian',
    personality: 'quiet and wise storyteller who knows every book in the world',
    description: 'Cozy sweater-wearing guardian of stories',
    traits: ['Wise', 'Curious', 'Storyteller'],
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    category: 'education',
    impact: 'Inspires love for reading and stories'
  },
  {
    id: 'scientist',
    emoji: '👩‍🔬',
    name: 'Dr. Discovery',
    title: 'The Scientist',
    personality: 'curious and experimental researcher who loves exploring mysteries',
    description: 'Lab coat-wearing explorer of the unknown',
    traits: ['Curious', 'Analytical', 'Innovative'],
    color: 'bg-purple-50 text-purple-600 border-purple-200',
    category: 'education',
    impact: 'Makes science fun and accessible'
  },

  // Health
  {
    id: 'doctor',
    emoji: '👨‍⚕️',
    name: 'Dr. Care',
    title: 'The Doctor',
    personality: 'caring and gentle healer who helps everyone feel better',
    description: 'Stethoscope-wearing hero in a white coat',
    traits: ['Caring', 'Gentle', 'Helpful'],
    color: 'bg-red-50 text-red-600 border-red-200',
    category: 'health',
    impact: 'Promotes health and wellness for all'
  },

  // Safety
  {
    id: 'firefighter',
    emoji: '🧑‍🚒',
    name: 'Hero Blaze',
    title: 'The Firefighter',
    personality: 'brave and strong protector who keeps everyone safe',
    description: 'Helmet-wearing hero with a brave smile',
    traits: ['Brave', 'Strong', 'Protective'],
    color: 'bg-orange-50 text-orange-600 border-orange-200',
    category: 'safety',
    impact: 'Keeps communities safe from danger'
  },
  {
    id: 'safety-officer',
    emoji: '👮',
    name: 'Officer Safe',
    title: 'The Safety Officer',
    personality: 'kind and watchful guardian who helps everyone stay safe',
    description: 'Police hat-wearing friend with a caring expression',
    traits: ['Kind', 'Watchful', 'Caring'],
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    category: 'safety',
    impact: 'Promotes safety and helps others'
  },

  // Environment
  {
    id: 'eco-warrior',
    emoji: '🌱',
    name: 'Green Guardian',
    title: 'The Eco-Warrior',
    personality: 'passionate and caring protector of nature and the environment',
    description: 'Green cape-wearing champion of the Earth',
    traits: ['Passionate', 'Caring', 'Environmental'],
    color: 'bg-green-50 text-green-600 border-green-200',
    category: 'environment',
    impact: 'Protects our planet for future generations'
  },
  {
    id: 'bike-hero',
    emoji: '🚲',
    name: 'Cycle Sam',
    title: 'The Bike Hero',
    personality: 'energetic and eco-friendly traveler who loves clean transportation',
    description: 'Helmet-wearing advocate for clean travel',
    traits: ['Energetic', 'Eco-friendly', 'Active'],
    color: 'bg-lime-50 text-lime-600 border-lime-200',
    category: 'environment',
    impact: 'Promotes sustainable transportation'
  },
  {
    id: 'farmer',
    emoji: '🧑‍🌾',
    name: 'Farmer Fresh',
    title: 'The Farmer',
    personality: 'hardworking and nurturing grower of healthy food',
    description: 'Straw hat-wearing provider of fresh vegetables',
    traits: ['Hardworking', 'Nurturing', 'Patient'],
    color: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    category: 'environment',
    impact: 'Grows healthy food for communities'
  },
  {
    id: 'water-saver',
    emoji: '💧',
    name: 'Aqua Angel',
    title: 'The Water Saver',
    personality: 'thoughtful and responsible guardian of our precious water',
    description: 'Blue outfit-wearing protector of water resources',
    traits: ['Thoughtful', 'Responsible', 'Conservation-minded'],
    color: 'bg-cyan-50 text-cyan-600 border-cyan-200',
    category: 'environment',
    impact: 'Conserves water for everyone'
  },

  // Arts
  {
    id: 'artist',
    emoji: '🎨',
    name: 'Creative Casey',
    title: 'The Artist',
    personality: 'imaginative and colorful creator who sees beauty everywhere',
    description: 'Paintbrush-wielding artist with a colorful shirt',
    traits: ['Imaginative', 'Colorful', 'Creative'],
    color: 'bg-pink-50 text-pink-600 border-pink-200',
    category: 'arts',
    impact: 'Brings beauty and creativity to the world'
  },
  {
    id: 'music-maker',
    emoji: '🎶',
    name: 'Melody Max',
    title: 'The Music Maker',
    personality: 'rhythmic and joyful musician who spreads happiness through music',
    description: 'Guitar-carrying creator of beautiful melodies',
    traits: ['Rhythmic', 'Joyful', 'Musical'],
    color: 'bg-violet-50 text-violet-600 border-violet-200',
    category: 'arts',
    impact: 'Spreads joy through the power of music'
  },

  // Sports
  {
    id: 'coach',
    emoji: '⚽',
    name: 'Coach Spirit',
    title: 'The Coach',
    personality: 'motivational and energetic trainer who brings out the best in everyone',
    description: 'Whistle-wearing motivator in a sports jersey',
    traits: ['Motivational', 'Energetic', 'Supportive'],
    color: 'bg-amber-50 text-amber-600 border-amber-200',
    category: 'sports',
    impact: 'Encourages fitness and teamwork'
  },

  // Tech
  {
    id: 'coder-kid',
    emoji: '🧑‍💻',
    name: 'Code Star',
    title: 'The Coder Kid',
    personality: 'logical and creative problem-solver who loves building digital solutions',
    description: 'Hoodie-wearing tech genius with bright ideas',
    traits: ['Logical', 'Creative', 'Problem-solver'],
    color: 'bg-slate-50 text-slate-600 border-slate-200',
    category: 'tech',
    impact: 'Creates technology to help others'
  },

  // Community
  {
    id: 'peace-builder',
    emoji: '🕊️',
    name: 'Peace Pal',
    title: 'The Peace Builder',
    personality: 'calm and understanding mediator who helps people get along',
    description: 'Dove symbol-wearing promoter of harmony',
    traits: ['Calm', 'Understanding', 'Peaceful'],
    color: 'bg-sky-50 text-sky-600 border-sky-200',
    category: 'community',
    impact: 'Brings people together in harmony'
  },
  {
    id: 'global-friend',
    emoji: '🌍',
    name: 'World Buddy',
    title: 'The Global Friend',
    personality: 'welcoming and inclusive friend who celebrates all cultures',
    description: 'Globe t-shirt-wearing ambassador of friendship',
    traits: ['Welcoming', 'Inclusive', 'Friendly'],
    color: 'bg-teal-50 text-teal-600 border-teal-200',
    category: 'community',
    impact: 'Connects people from all backgrounds'
  },
  {
    id: 'accessibility-hero',
    emoji: '🧑‍🦽',
    name: 'Access Angel',
    title: 'The Accessibility Hero',
    personality: 'determined and inspiring advocate for everyone to be included',
    description: 'Cape-wearing champion of equal access',
    traits: ['Determined', 'Inspiring', 'Inclusive'],
    color: 'bg-rose-50 text-rose-600 border-rose-200',
    category: 'community',
    impact: 'Ensures everyone can participate fully'
  },
  {
    id: 'justice-advocate',
    emoji: '🧑‍⚖️',
    name: 'Justice Joy',
    title: 'The Justice Advocate',
    personality: 'fair and principled defender of what is right and just',
    description: 'Scales of justice-bearing champion of fairness',
    traits: ['Fair', 'Principled', 'Strong'],
    color: 'bg-gray-50 text-gray-600 border-gray-200',
    category: 'community',
    impact: 'Fights for fairness and equality'
  },
  {
    id: 'helper',
    emoji: '❤️',
    name: 'Kind Heart',
    title: 'The Helper',
    personality: 'warm and generous soul who always looks for ways to help others',
    description: 'Heart symbol-wearing spreader of kindness',
    traits: ['Warm', 'Generous', 'Kind'],
    color: 'bg-red-50 text-red-600 border-red-200',
    category: 'community',
    impact: 'Makes the world a kinder place'
  }
];

export const avatarCategories = [
  { 
    key: 'education', 
    name: 'Education Heroes', 
    icon: '🎓', 
    color: 'text-blue-500',
    description: 'Learning champions who inspire curiosity'
  },
  { 
    key: 'health', 
    name: 'Health Heroes', 
    icon: '🏥', 
    color: 'text-red-500',
    description: 'Caring healers who promote wellness'
  },
  { 
    key: 'safety', 
    name: 'Safety Stars', 
    icon: '🛡️', 
    color: 'text-orange-500',
    description: 'Brave protectors who keep us safe'
  },
  { 
    key: 'environment', 
    name: 'Earth Guardians', 
    icon: '🌍', 
    color: 'text-green-500',
    description: 'Environmental champions protecting our planet'
  },
  { 
    key: 'arts', 
    name: 'Creative Spirits', 
    icon: '🎨', 
    color: 'text-purple-500',
    description: 'Artistic souls who bring beauty to life'
  },
  { 
    key: 'sports', 
    name: 'Fitness Friends', 
    icon: '🏃', 
    color: 'text-amber-500',
    description: 'Active advocates for healthy living'
  },
  { 
    key: 'tech', 
    name: 'Tech Innovators', 
    icon: '💻', 
    color: 'text-slate-500',
    description: 'Digital pioneers solving tomorrow\'s problems'
  },
  { 
    key: 'community', 
    name: 'Community Champions', 
    icon: '🤝', 
    color: 'text-pink-500',
    description: 'Social heroes bringing people together'
  }
];

