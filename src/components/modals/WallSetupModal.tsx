import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { WallSetup } from "@/components/game/WallSetup";

interface WallSetupModalProps {
  isOpen: boolean;
  dealerWind: string;
  onComplete: () => void;
}

export const WallSetupModal: React.FC<WallSetupModalProps> = ({
  isOpen,
  dealerWind,
  onComplete,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onComplete(); }}>
      <DialogContent className="sm:max-w-[700px] bg-transparent border-none shadow-none flex justify-center p-0">
        <WallSetup dealerWind={dealerWind} onComplete={onComplete} />
      </DialogContent>
    </Dialog>
  );
};
