import React from 'react';
import yakuData from '@/data/yaku-ema.json';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const YakuList: React.FC = () => {
  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {yakuData.map((category, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="text-xl font-bold">
              {category.category}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                {category.yakus.map((yaku, yIdx) => (
                  <Card key={yIdx} className="bg-card/50 backdrop-blur-sm border-border/50">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{yaku.englishName}</CardTitle>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {yaku.concealedOnly && (
                            <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
                              Concealed Only
                            </Badge>
                          )}
                          {yaku.isSpecial && (
                            <Badge variant="outline" className="text-amber-500 border-amber-500/50">
                              +1 Han Concealed
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CardDescription className="text-sm font-medium italic">
                        {yaku.japaneseName}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{yaku.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
