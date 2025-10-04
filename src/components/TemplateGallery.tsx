import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Copy, Download, Globe, Star, Zap, Languages, Heart, Brain } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from '@/contexts/LanguageContext';

interface TemplateGalleryProps {
  onUseTemplate: (template: BotTemplate) => void;
}

interface BotTemplate {
  id: string;
  name: string;
  avatar: string;
  description: string;
  category: 'educational' | 'cultural' | 'fun' | 'practical';
  difficulty: 'Beginner' | 'Easy' | 'Medium' | 'Advanced';
  language: string;
  intents: {
    name: string;
    trainingPhrases: string[];
    responses: string[];
  }[];
  features: string[];
  culturalContext?: string;
}

const TemplateGallery = ({ onUseTemplate }: TemplateGalleryProps) => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<BotTemplate | null>(null);

  const templates: BotTemplate[] = [
    {
      id: 'breakfast-bot',
      name: 'Ubuntu Breakfast Bot',
      avatar: '🍳',
      description: 'Help plan healthy African breakfast meals',
      category: 'practical',
      difficulty: 'Beginner',
      language: 'English/Swahili',
      culturalContext: 'Incorporates traditional African breakfast foods and Ubuntu philosophy of sharing meals',
      intents: [
        {
          name: 'Greet',
          trainingPhrases: ['hello', 'hi', 'jambo', 'good morning', 'sawubona'],
          responses: ['Jambo! Ready for a healthy African breakfast?', 'Sawubona! Let\'s plan a nutritious meal together!']
        },
        {
          name: 'Suggest Breakfast',
          trainingPhrases: ['what should I eat', 'breakfast ideas', 'I\'m hungry', 'what\'s for breakfast'],
          responses: ['How about ugali with milk and fruit?', 'Try mandazi with chai tea!', 'Injera with honey is delicious and energizing!']
        },
        {
          name: 'Nutrition Info',
          trainingPhrases: ['is this healthy', 'nutrition facts', 'calories', 'vitamins'],
          responses: ['That\'s packed with nutrients! Great choice for growing minds.', 'This meal gives you energy for learning all day!']
        }
      ],
      features: ['Traditional recipes', 'Nutritional education', 'Multilingual support']
    },
    {
      id: 'story-friend',
      name: 'Anansi Story Friend',
      avatar: '📚',
      description: 'Interactive storyteller with African folktales',
      category: 'cultural',
      difficulty: 'Easy',
      language: 'Multiple African languages',
      culturalContext: 'Based on Anansi the spider and other African storytelling traditions',
      intents: [
        {
          name: 'Tell Story',
          trainingPhrases: ['tell me a story', 'story time', 'once upon a time', 'I want to hear a tale'],
          responses: ['Let me tell you about Anansi the clever spider...', 'Here\'s a story from the great baobab tree...']
        },
        {
          name: 'Create Story',
          trainingPhrases: ['let\'s make a story', 'create together', 'I have an idea'],
          responses: ['Wonderful! What character should we start with?', 'Great! Every good story needs a hero. Who is yours?']
        },
        {
          name: 'Story Moral',
          trainingPhrases: ['what does it mean', 'moral of the story', 'lesson learned'],
          responses: ['This story teaches us about wisdom and kindness', 'The lesson is that Ubuntu - we are stronger together!']
        }
      ],
      features: ['Interactive storytelling', 'Cultural education', 'Creative writing help']
    },
    {
      id: 'math-buddy',
      name: 'Kwame Math Buddy',
      avatar: '🔢',
      description: 'Makes math fun with African contexts',
      category: 'educational',
      difficulty: 'Medium',
      language: 'English',
      culturalContext: 'Uses African market scenarios, wildlife counting, and traditional patterns for math learning',
      intents: [
        {
          name: 'Math Problem',
          trainingPhrases: ['help with math', 'solve this', 'I need help calculating', 'math homework'],
          responses: ['Let\'s solve this step by step!', 'Math is like counting elephants - let\'s take it one step at a time!']
        },
        {
          name: 'Practice Problems',
          trainingPhrases: ['give me practice', 'more problems', 'test me', 'quiz time'],
          responses: ['If you have 5 baskets and each holds 8 mangoes, how many mangoes total?', 'A safari guide sees 3 groups of 4 zebras. How many zebras in total?']
        },
        {
          name: 'Explain Concept',
          trainingPhrases: ['explain fractions', 'what is multiplication', 'how does division work'],
          responses: ['Think of fractions like sharing ugali equally among friends!', 'Multiplication is like counting groups of things - very useful at the market!']
        }
      ],
      features: ['Contextual learning', 'Step-by-step solutions', 'Cultural math scenarios']
    },
    {
      id: 'culture-guide',
      name: 'Heritage Guide',
      avatar: '🌍',
      description: 'Explore African cultures and traditions',
      category: 'cultural',
      difficulty: 'Medium',
      language: 'Multiple',
      culturalContext: 'Comprehensive guide to African cultures, languages, traditions, and modern achievements',
      intents: [
        {
          name: 'Learn Culture',
          trainingPhrases: ['tell me about culture', 'African traditions', 'customs', 'heritage'],
          responses: ['Africa has over 3000 ethnic groups, each with unique traditions!', 'Let me share the beautiful diversity of African cultures!']
        },
        {
          name: 'Language Info',
          trainingPhrases: ['African languages', 'how to say hello', 'teach me words'],
          responses: ['Africa has over 2000 languages! Want to learn greetings?', 'In Swahili we say "Habari" for "How are you?"']
        },
        {
          name: 'Modern Africa',
          trainingPhrases: ['modern Africa', 'technology', 'innovations', 'achievements'],
          responses: ['Africa leads in mobile banking with M-Pesa!', 'African innovators are solving global challenges with technology!']
        }
      ],
      features: ['Cultural education', 'Language learning', 'Modern achievements']
    },
    {
      id: 'weather-wizard',
      name: 'Savanna Weather Wizard',
      avatar: '🌦️',
      description: 'Weather bot with African climate awareness',
      category: 'practical',
      difficulty: 'Beginner',
      language: 'English/French',
      culturalContext: 'Understands African climate patterns, seasonal changes, and agricultural implications',
      intents: [
        {
          name: 'Weather Today',
          trainingPhrases: ['weather today', 'how is it outside', 'should I bring umbrella'],
          responses: ['The savanna is sunny today - perfect for outdoor learning!', 'Looks like rainy season is here - great for the crops!']
        },
        {
          name: 'Seasonal Info',
          trainingPhrases: ['rainy season', 'dry season', 'harvest time', 'planting season'],
          responses: ['Rainy season brings life to the savanna!', 'This is when farmers plant their crops for the harvest!']
        }
      ],
      features: ['Weather awareness', 'Agricultural context', 'Seasonal education']
    },
    {
      id: 'pet-caretaker',
      name: 'Safari Pet Guide',
      avatar: '🐕',
      description: 'Virtual pet care with African animal focus',
      category: 'fun',
      difficulty: 'Easy',
      language: 'English',
      culturalContext: 'Features African animals and teaches about wildlife conservation',
      intents: [
        {
          name: 'Pet Care',
          trainingPhrases: ['feed my pet', 'pet is hungry', 'take care of animal'],
          responses: ['Your virtual meerkat is happy and well-fed!', 'Time to give your baby elephant some water!']
        },
        {
          name: 'Animal Facts',
          trainingPhrases: ['tell me about animals', 'animal facts', 'wildlife'],
          responses: ['Did you know elephants can remember friends for decades?', 'Meerkats work together like a community - just like Ubuntu!']
        }
      ],
      features: ['Virtual pet care', 'Wildlife education', 'Conservation awareness']
    }
  ];

  const categories = [
    { key: 'all', name: 'All Templates', icon: Star },
    { key: 'educational', name: 'Educational', icon: Brain },
    { key: 'cultural', name: 'Cultural', icon: Globe },
    { key: 'fun', name: 'Fun & Games', icon: Heart },
    { key: 'practical', name: 'Practical', icon: Zap },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleUseTemplate = (template: BotTemplate) => {
    onUseTemplate(template);
    toast({
      title: t('toast.agentCreated'),
      description: `${template.name} ${t('createAgent.agentCreatedReady')}`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300';
      case 'Easy': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Medium': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300';
      case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Star className="h-4 w-4 mr-2" />
          {t('templates.browseTemplates')}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-orange-500" />
            {t('templates.browseTemplates')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.key}
                  variant={selectedCategory === category.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.key)}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template, index) => (
              <Card 
                key={template.id} 
                className="hover:shadow-lg transition-all border-2 hover:border-orange-300 focus-within:ring-2 focus-within:ring-primary/50"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleUseTemplate(template);
                  }
                }}
                role="article"
                aria-label={`Template: ${template.name}. ${template.description}. Press Enter to use`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{template.avatar}</div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getDifficultyColor(template.difficulty)}>
                            {template.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Languages className="h-3 w-3 mr-1" />
                            {template.language}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  
                  {template.culturalContext && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                      <p className="text-xs text-orange-700 dark:text-orange-300">
                        <Globe className="h-3 w-3 inline mr-1" />
                        {template.culturalContext}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">{t('templates.features')}:</Label>
                    <div className="flex flex-wrap gap-1">
                      {template.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">{t('templates.sampleIntents')}:</Label>
                    <div className="text-xs text-muted-foreground">
                      {template.intents.slice(0, 2).map(intent => intent.name).join(', ')}
                      {template.intents.length > 2 && ` +${template.intents.length - 2} more`}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-1">
                          {t('templates.preview')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            {template.avatar} {template.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>{template.description}</p>
                          {template.culturalContext && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                              <h4 className="font-medium mb-2">{t('templates.culturalContext')}:</h4>
                              <p className="text-sm">{template.culturalContext}</p>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium mb-2">{t('templates.preview')}:</h4>
                            {template.intents.map((intent, index) => (
                              <div key={index} className="border rounded p-3 mb-2">
                                <h5 className="font-medium text-sm">{intent.name}</h5>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {t('botBuilder.trainingPhrases')}: {intent.trainingPhrases.slice(0, 3).join(', ')}...
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t('botBuilder.responses')}: "{intent.responses[0]}"
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      size="sm" 
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                      onClick={() => handleUseTemplate(template)}
                    >
                      {t('templates.useTemplate')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No templates found in this category.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateGallery;