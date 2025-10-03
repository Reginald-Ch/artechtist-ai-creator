import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, ShoppingCart, Coffee, Pizza, Book, Heart, Star } from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  intents: {
    name: string;
    trainingPhrases: string[];
    responses: string[];
  }[];
}

const templates: Template[] = [
  {
    id: "restaurant",
    name: "Restaurant Assistant",
    description: "Help customers with menu, orders, and reservations",
    icon: <Pizza className="h-5 w-5" />,
    category: "Food & Dining",
    intents: [
      {
        name: "Menu",
        trainingPhrases: [
          "What's on the menu?",
          "Show me your menu",
          "What do you serve?",
          "What can I order?"
        ],
        responses: [
          "We serve delicious pizzas, pastas, and salads! Would you like to see our full menu?",
          "Our menu includes Italian classics like pizza, pasta, and fresh salads. What interests you?"
        ]
      },
      {
        name: "Hours",
        trainingPhrases: [
          "When are you open?",
          "What are your hours?",
          "Are you open now?",
          "What time do you close?"
        ],
        responses: [
          "We're open Monday-Sunday from 11 AM to 10 PM. Come visit us!",
          "Our hours are 11 AM - 10 PM every day. We'd love to serve you!"
        ]
      }
    ]
  },
  {
    id: "ecommerce",
    name: "Online Store Helper",
    description: "Assist with products, shipping, and returns",
    icon: <ShoppingCart className="h-5 w-5" />,
    category: "E-commerce",
    intents: [
      {
        name: "Shipping",
        trainingPhrases: [
          "How long is shipping?",
          "When will my order arrive?",
          "Do you offer free shipping?",
          "Shipping information"
        ],
        responses: [
          "We offer free shipping on orders over $50! Standard delivery takes 3-5 business days.",
          "Shipping typically takes 3-5 business days. Orders over $50 ship free!"
        ]
      },
      {
        name: "Returns",
        trainingPhrases: [
          "What's your return policy?",
          "Can I return this?",
          "How do I return an item?",
          "Return information"
        ],
        responses: [
          "We accept returns within 30 days of purchase. Items must be unused with tags attached.",
          "You can return items within 30 days for a full refund. Just keep the tags on and the item unused!"
        ]
      }
    ]
  },
  {
    id: "cafe",
    name: "Cafe Assistant",
    description: "Help with coffee orders and cafe information",
    icon: <Coffee className="h-5 w-5" />,
    category: "Food & Dining",
    intents: [
      {
        name: "Drinks",
        trainingPhrases: [
          "What drinks do you have?",
          "Coffee menu",
          "What kind of coffee?",
          "Drink options"
        ],
        responses: [
          "We have espresso, cappuccino, latte, americano, and cold brew! What sounds good?",
          "Our coffee menu includes espresso drinks, pour-overs, and cold brew. What's your preference?"
        ]
      },
      {
        name: "WiFi",
        trainingPhrases: [
          "Do you have WiFi?",
          "What's the WiFi password?",
          "Can I work here?",
          "Internet access"
        ],
        responses: [
          "Yes! Our WiFi is 'CafeGuest' and the password is 'coffeelove123'. Enjoy!",
          "We offer free WiFi! Network: CafeGuest, Password: coffeelove123"
        ]
      }
    ]
  },
  {
    id: "support",
    name: "Customer Support Bot",
    description: "Handle common support questions",
    icon: <Heart className="h-5 w-5" />,
    category: "Support",
    intents: [
      {
        name: "Account",
        trainingPhrases: [
          "How do I reset my password?",
          "Can't log in",
          "Forgot password",
          "Account help"
        ],
        responses: [
          "To reset your password, click 'Forgot Password' on the login page. We'll send you a reset link!",
          "No problem! Use the 'Forgot Password' link on the login page to reset it via email."
        ]
      },
      {
        name: "Contact",
        trainingPhrases: [
          "How can I contact you?",
          "Support email",
          "Talk to a human",
          "Customer service"
        ],
        responses: [
          "You can reach us at support@example.com or call 1-800-HELP. We're here 24/7!",
          "Our support team is available at support@example.com or 1-800-HELP anytime!"
        ]
      }
    ]
  }
];

interface ConversationTemplatesProps {
  onSelectTemplate: (template: Template) => void;
  onClose: () => void;
}

export const ConversationTemplates = ({ onSelectTemplate, onClose }: ConversationTemplatesProps) => {
  return (
    <div className="fixed inset-0 bg-background/98 backdrop-blur-md z-50 overflow-y-auto">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Conversation Templates
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Choose a pre-built template to get started quickly
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] self-end sm:self-auto"
          >
            Close
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-primary/10 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center">
                    {template.icon}
                  </div>
                  <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                </div>
                <CardTitle className="text-base sm:text-lg">{template.name}</CardTitle>
                <CardDescription className="text-sm">{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  <div className="text-sm">
                    <span className="font-semibold text-primary">Includes:</span>
                    <ul className="mt-2 space-y-1">
                      {template.intents.map((intent, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                          <span>{intent.name} ({intent.trainingPhrases.length} phrases)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    onSelectTemplate(template);
                    onClose();
                  }}
                  className="w-full min-h-[44px]"
                >
                  Use This Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6 sm:mt-8 border-2 border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bot className="h-5 w-5" />
              Start from Scratch
            </CardTitle>
            <CardDescription className="text-sm">
              Build your own custom conversation flow without a template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onClose} variant="outline" className="w-full min-h-[44px]">
              Create Custom Bot
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export type { Template };
