import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, Moon, Sun } from 'lucide-react';
import { AuthButton } from '@/components/AuthButton';

export const SettingsToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:top-4 md:right-4 md:bottom-auto z-50 flex flex-col md:flex-row items-end md:items-center gap-2">
      <AuthButton />
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:bg-accent/20 transition-smooth rounded-full w-10 h-10"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="bg-card/80 backdrop-blur-sm border-border/50 shadow-lg hover:bg-accent/20 transition-smooth rounded-full px-4 h-10"
        >
          <Globe className="h-4 w-4 mr-2" />
          {language.toUpperCase()}
        </Button>
      </div>
    </div>
  );
};