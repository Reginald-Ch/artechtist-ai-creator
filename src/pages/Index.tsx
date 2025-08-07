import { Button } from "@/components/ui/button";
import { Brain, Zap, Users, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-orange-950/20 dark:via-yellow-950/20 dark:to-red-950/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8">
            <Brain className="h-16 w-16 text-orange-500" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 bg-clip-text text-transparent">
              Artechtist AI
            </h1>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Empowering African Learners to Build AI 🚀
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            A kid-friendly platform where young African minds aged 8-16 create their own 
            conversational AI agents using intuitive drag-and-drop tools. 
            Learn AI and ML through playful exploration and hands-on design!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg">
                Start Building AI
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-border hover:bg-accent">
              Explore Templates
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-orange-100 dark:border-orange-900/20 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-6">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4">Visual Flow Builder</h3>
            <p className="text-muted-foreground">
              Create conversation flows with our intuitive drag-and-drop interface. 
              Each intent becomes a visual node in your AI's conversation tree.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-yellow-100 dark:border-yellow-900/20 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-6">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4">Voice-to-Text Training</h3>
            <p className="text-muted-foreground">
              Perfect for early readers! Train your AI by speaking your phrases aloud. 
              Our voice recognition makes AI accessible to all learning levels.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border border-red-100 dark:border-red-900/20 hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-6">
              <Star className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-4">Real-time Testing</h3>
            <p className="text-muted-foreground">
              Test your AI agent instantly! Chat with your creation in real-time 
              and see how it responds to different questions and scenarios.
            </p>
          </div>
        </div>

        {/* Examples Section */}
        <div className="mt-20 text-center">
          <h3 className="text-3xl font-bold mb-8">What Will You Build?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { emoji: "🍳", name: "Breakfast Bot", desc: "Recipe helper" },
              { emoji: "📚", name: "Story Friend", desc: "Creative writing" },
              { emoji: "🔢", name: "Math Buddy", desc: "Homework help" },
              { emoji: "🌍", name: "Culture Guide", desc: "African heritage" },
            ].map((bot, index) => (
              <div key={index} className="bg-white/60 dark:bg-gray-900/60 rounded-xl p-6 border border-border hover:shadow-lg transition-all">
                <div className="text-4xl mb-3">{bot.emoji}</div>
                <h4 className="font-semibold text-lg mb-2">{bot.name}</h4>
                <p className="text-sm text-muted-foreground">{bot.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-orange-500 to-yellow-500 rounded-3xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Create Your First AI Agent?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of young African innovators building the future with AI
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
              Get Started Free
              <Users className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
