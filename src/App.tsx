import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import BotBuilder from "./pages/BotBuilder";
import AIPlayground from "./pages/AIPlayground";
import AILessons from "./pages/AILessons";
import CulturalHub from "./pages/CulturalHub";
import PythonIDE from "./pages/PythonIDE";
import CreateAgent from "./pages/CreateAgent";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/builder" element={<ProtectedRoute><BotBuilder /></ProtectedRoute>} />
            <Route path="/builder/:id" element={<ProtectedRoute><BotBuilder /></ProtectedRoute>} />
            <Route path="/ai-playground" element={<ProtectedRoute><AIPlayground /></ProtectedRoute>} />
            <Route path="/ai-lessons" element={<AILessons />} />
            <Route path="/cultural-hub" element={<ProtectedRoute><CulturalHub /></ProtectedRoute>} />
            <Route path="/python-ide" element={<ProtectedRoute><PythonIDE /></ProtectedRoute>} />
            <Route path="/create-agent" element={<ProtectedRoute><CreateAgent /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
