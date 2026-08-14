import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { YakuList } from '@/components/rules/YakuList';
import { WallSetupGuide } from '@/components/rules/WallSetupGuide';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RulesHelp: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen chinese-pattern p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="hover:bg-accent/20">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            Rules & Reference
          </h1>
        </div>

        <Tabs defaultValue="yakus" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="yakus">Valid Hands (Yaku)</TabsTrigger>
            <TabsTrigger value="setup">Wall Setup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="yakus" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Valid Hands (Yaku)</h2>
              <p className="text-muted-foreground">
                In Riichi Mahjong, a winning hand must contain at least one Yaku. Yakus are cumulative, 
                meaning you can combine multiple Yakus to increase the hand's value (fan).
              </p>
            </div>
            <YakuList />
          </TabsContent>
          
          <TabsContent value="setup" className="mt-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Game Setup</h2>
              <p className="text-muted-foreground">
                Reference for building the wall, rolling the dice, and dealing tiles at the start of a round.
              </p>
            </div>
            <WallSetupGuide />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
