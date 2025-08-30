import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMahjongGame } from "@/contexts/MatchContext";
import { Player } from "@/types/game";
import { CheckCircle } from "lucide-react";
import React, { useEffect, useState } from "react";

interface TenpaiModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // This handler takes an array of the names of the players who are in tenpai
  onConfirmTenpai: (tenpaiPlayerNames: string[]) => void;
}

/**
 * Modal for selecting which players are in tenpai at the end of a round draw (Ryūkyoku).
 */
export const TenpaiModal: React.FC<TenpaiModalProps> = ({
  isOpen,
  onOpenChange,
  onConfirmTenpai,
}) => {
  const { t } = useLanguage();
  const { players } = useMahjongGame();

  // State to track the names of selected tenpai players
  const [selectedTenpaiPlayers, setSelectedTenpaiPlayers] = useState<string[]>(
    []
  );

  // Reset state when the modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTenpaiPlayers([]);
    }
  }, [isOpen]);

  const handleCheckboxChange = (playerName: string, checked: boolean) => {
    setSelectedTenpaiPlayers((prev) => {
      if (checked) {
        return [...prev, playerName];
      } else {
        return prev.filter((name) => name !== playerName);
      }
    });
  };

  const handleSubmit = () => {
    onConfirmTenpai(selectedTenpaiPlayers);
    // The parent component should close the dialog via onConfirmTenpai's side effect,
    // but we can ensure it closes here as well.
    onOpenChange(false);
  };

  const isAllTenpai = selectedTenpaiPlayers.length === players.length;
  const isAllNotTenpai = selectedTenpaiPlayers.length === 0;
  const isDrawWithoutExchange = isAllTenpai || isAllNotTenpai;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center">
            <CheckCircle className="h-6 w-6 mr-2 text-cyan-500" />
            {t("tenpaiDeclaration")}
          </DialogTitle>
          <DialogDescription>
            {t("selectTenpaiPlayersDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <p className="text-sm font-medium text-muted-foreground">
            {t("playersInTenpai")}:
          </p>
          {players.map((player: Player) => (
            <div
              key={player.name}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent/30 transition-colors"
            >
              <Checkbox
                id={`tenpai-${player.name}`}
                checked={selectedTenpaiPlayers.includes(player.name)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(player.name, !!checked)
                }
              />
              <Label
                htmlFor={`tenpai-${player.name}`}
                className="text-base cursor-pointer font-semibold"
              >
                {player.name} ({t(player.wind.toLowerCase())} {t("wind")})
              </Label>
            </div>
          ))}
        </div>

        {/* Info/Warning Block */}
        <div className="text-sm p-3 rounded-md border bg-yellow-100/30 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          {isAllTenpai && t("allTenpaiNoExchange")}
          {isAllNotTenpai && t("allNotTenpaiNoExchange")}
          {!isDrawWithoutExchange && t("pointExchangeWillOccur")}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            className="w-full bg-cyan-600 hover:bg-cyan-700 transition-smooth"
          >
            {t("confirmDraw")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
