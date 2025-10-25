import { Button } from "@/components/ui/button";
import { Brain, Zap, Users, Star, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card dark:from-background dark:via-card dark:to-background relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-8 animate-fade-in">
            <Brain className="h-16 w-16 text-primary glow-primary transition-glow" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Artechtist AI
            </h1>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Empowering African Learners to Build AI 🚀
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
            A kid-friendly platform where young African minds aged 8-16 create their own 
            conversational AI agents using intuitive drag-and-drop tools. 
            Learn AI and ML through playful exploration and hands-on design!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg glow-primary transition-glow">
                Start Building AI
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-primary/50 hover:bg-primary/10 hover:border-primary transition-glow">
              Explore Templates
            </Button>
          </div>
        </div>

        {/* Features Grid - Futuristic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-card/80 dark:bg-card/50 backdrop-blur-lg rounded-2xl p-8 border border-primary/30 hover:border-primary transition-all hover:glow-primary group">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Visual Flow Builder</h3>
            <p className="text-muted-foreground">
              Create conversation flows with our intuitive drag-and-drop interface. 
              Each intent becomes a visual node in your AI's conversation tree.
            </p>
          </div>

          <div className="bg-card/80 dark:bg-card/50 backdrop-blur-lg rounded-2xl p-8 border border-secondary/30 hover:border-secondary transition-all hover:glow-secondary group">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary-glow rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6 text-secondary-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Voice-to-Text Training</h3>
            <p className="text-muted-foreground">
              Perfect for early readers! Train your AI by speaking your phrases aloud. 
              Our voice recognition makes AI accessible to all learning levels.
            </p>
          </div>

          <div className="bg-card/80 dark:bg-card/50 backdrop-blur-lg rounded-2xl p-8 border border-accent/30 hover:border-accent transition-all hover:glow-accent group">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-accent-glow rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Star className="h-6 w-6 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Real-time Testing</h3>
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

        {/* CTA Section - Futuristic Design */}
        <div className="mt-20 text-center bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl p-12 text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 animate-pulse" />
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4 drop-shadow-lg">Ready to Create Your First AI Agent?</h3>
            <p className="text-xl mb-8 opacity-90 drop-shadow">
              Join thousands of young African innovators building the future with AI
            </p>
            <Link to="/auth">
              <Button size="lg" className="px-8 py-4 text-lg bg-card text-foreground hover:bg-card/90 glow-primary transition-glow">
                Get Started Free
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
