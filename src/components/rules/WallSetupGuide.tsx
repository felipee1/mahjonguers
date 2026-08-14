import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dice1, Dice2, ArrowRightCircle } from 'lucide-react';

export const WallSetupGuide: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dice1 className="w-5 h-5 text-primary" />
            Building the Wall
          </CardTitle>
          <CardDescription>How to build and break the wall before starting a hand.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">1. Building</h3>
            <p className="text-sm text-muted-foreground">
              After mixing the tiles face down, each player builds a wall of face-down tiles in front of themselves, 
              17 tiles long and 2 tiers high. The four walls are pushed together to form a square.
            </p>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">2. Rolling the Dice</h3>
            <p className="text-sm text-muted-foreground">
              The dealer (East) rolls two dice. They count counter-clockwise starting with themselves as 1. 
              The resulting player is where the wall will be broken.
            </p>
            <ul className="text-sm text-muted-foreground list-disc pl-5 mt-2 space-y-1">
              <li><strong>East (Dealer):</strong> 5, 9</li>
              <li><strong>South (Right):</strong> 2, 6, 10</li>
              <li><strong>West (Across):</strong> 3, 7, 11</li>
              <li><strong>North (Left):</strong> 4, 8, 12</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">3. Breaking the Wall</h3>
            <p className="text-sm text-muted-foreground">
              The chosen player counts from the right side of their wall, skipping the number of stacks indicated by the dice. 
              The wall is broken after that stack.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">4. Dead Wall and Drawing</h3>
            <p className="text-sm text-muted-foreground">
              The 7 tile stacks (14 tiles) to the right of the break form the <strong>Dead Wall</strong>. 
              Players take tiles from the left of the break, drawing clockwise. Turn order proceeds counter-clockwise.
            </p>
            <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border/50 flex flex-col gap-2 items-center text-center">
              <ArrowRightCircle className="w-6 h-6 text-primary" />
              <p className="text-sm font-medium">Draw Clockwise, Play Counter-Clockwise</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
