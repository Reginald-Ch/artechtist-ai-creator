import { toast } from "@/hooks/use-toast";

/**
 * Helper function for showing translated toast notifications
 * Automatically uses the translation context
 */
export const createTranslatedToast = (t: (key: string) => string) => {
  return {
    success: (titleKey: string, descriptionKey?: string) => {
      toast({
        title: t(titleKey),
        description: descriptionKey ? t(descriptionKey) : undefined,
      });
    },
    
    error: (titleKey: string, descriptionKey?: string) => {
      toast({
        title: t(titleKey),
        description: descriptionKey ? t(descriptionKey) : undefined,
        variant: "destructive",
      });
    },
    
    info: (titleKey: string, descriptionKey?: string) => {
      toast({
        title: t(titleKey),
        description: descriptionKey ? t(descriptionKey) : undefined,
      });
    },
    
    // Custom toast with dynamic values
    custom: (titleKey: string, customDescription: string, variant?: "default" | "destructive") => {
      toast({
        title: t(titleKey),
        description: customDescription,
        variant,
      });
    }
  };
};
