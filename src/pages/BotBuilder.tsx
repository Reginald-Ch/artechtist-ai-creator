import { useLocation } from "react-router-dom";
import SimplifiedBotBuilder from "@/components/enhanced/SimplifiedBotBuilder";

const BotBuilder = () => {
  const location = useLocation();
  const template = location.state?.template;
  
  return <SimplifiedBotBuilder template={template} />;
};

export default BotBuilder;