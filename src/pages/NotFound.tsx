import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
      <div className="text-center bg-background/80 backdrop-blur-sm rounded-3xl p-12 border border-border shadow-xl">
        <div className="text-6xl mb-6">🤖</div>
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">404</h1>
        <p className="text-2xl text-muted-foreground mb-6">Oops! This AI agent got lost!</p>
        <p className="text-lg text-muted-foreground mb-8">The page you're looking for doesn't exist in our knowledge base.</p>
        <Link to="/" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
