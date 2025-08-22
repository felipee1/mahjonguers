import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 bg-card/80 backdrop-blur-sm border-border/50 hover:bg-accent/20 transition-smooth"
    >
      <Globe className="h-4 w-4 mr-2" />
      {language.toUpperCase()}
    </Button>
  );
};