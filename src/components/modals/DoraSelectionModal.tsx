import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { MAHJONG_TILES, Tile, parseDetectionsToTiles } from "@/types/game";
import useMahjongDetection from "@/utils/detection";
import { Grid3X3, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
interface DoraSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (dora: { tile?: Tile; imageUrl?: string }) => void;
}

export const DoraSelectionModal: React.FC<DoraSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useLanguage();
  const [selectedTile, setSelectedTile] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  const { runDetection, isModelLoading, modelError } = useMahjongDetection();

  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const handleDetection = async () => {
    if (isModelLoading || isDetecting) {
      console.log("Model is busy or loading, please wait.");
      return;
    }

    if (!imageElementRef.current) {
      setDetectionError("Image element is not available for detection.");
      return;
    }

    setIsDetecting(true);
    setDetectionError(null);
    try {
      const results = await runDetection(imageElementRef.current);
      if (results && results.length > 0) {
        const detectedTiles = parseDetectionsToTiles(results);
        if (detectedTiles.length > 0) {
          // Since Dora is a single tile, we take the first one detected.
          setSelectedTile(detectedTiles[0].id);
        } else {
          setDetectionError("No tiles were detected in the image.");
        }
      } else {
        setDetectionError("No tiles detected in the image.");
      }
    } catch (error) {
      console.error("Detection failed:", error);
      setDetectionError("Detection failed. Please try again.");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setSelectedTile("");
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);

        const img = new Image();
        img.onload = () => {
          imageElementRef.current = img;
          handleDetection();
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirm = () => {
    if (selectedTile) {
      const tile = MAHJONG_TILES.find((t) => t.id === selectedTile);

      if (tile) {
        onConfirm({ tile });
      }
    }
  };

  const handleClose = () => {
    setSelectedTile("");
    setImageFile(null);
    setImagePreview("");
    setDetectionError(null);
    setIsDetecting(false);
    if (imageElementRef.current) {
      imageElementRef.current = null;
    }
    onClose();
  };

  const getTilesByType = (type: string) => {
    return MAHJONG_TILES.filter((tile) => tile.type === type);
  };

  const canConfirm = selectedTile || imagePreview;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-sm border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {t("selectDora")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="tile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tile" className="flex items-center">
              <Grid3X3 className="h-4 w-4 mr-2" />
              {t("selectTile")}
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              {isModelLoading ? "Loading AI..." : t("uploadImage")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tile" className="space-y-4">
            <div className="space-y-4">
              <Label>{t("selectTile")}</Label>
              <Select value={selectedTile} onValueChange={setSelectedTile}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectTile")} />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <div className="space-y-2">
                    {/* Man (Characters) */}
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                      Man(Characters) (万)
                    </div>
                    {getTilesByType("man").map((tile) => (
                      <SelectItem key={tile.id} value={tile.id}>
                        <span className="text-lg mr-2">{tile.display}</span>
                        {tile.value}
                      </SelectItem>
                    ))}

                    {/* Pin (Circles) */}
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                      Pin (Circles) (筒)
                    </div>
                    {getTilesByType("pin").map((tile) => (
                      <SelectItem key={tile.id} value={tile.id}>
                        <span className="text-lg mr-2">{tile.display}</span>
                        {tile.value}
                      </SelectItem>
                    ))}

                    {/* Sou (Bamboo) */}
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                      Sou (Bamboo) (索)
                    </div>
                    {getTilesByType("sou").map((tile) => (
                      <SelectItem key={tile.id} value={tile.id}>
                        <span className="text-lg mr-2">{tile.display}</span>
                        {tile.value}
                      </SelectItem>
                    ))}

                    {/* Honor */}
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                      Honor Tiles
                    </div>
                    {getTilesByType("honor").map((tile) => (
                      <SelectItem key={tile.id} value={tile.id}>
                        <span className="text-lg mr-2">{tile.display}</span>
                        {tile.value}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>
              {/* Preview selected tile */}
              {selectedTile && (
                <div className="flex justify-center">
                  <div className="w-16 h-20 bg-muted rounded border-2 border-primary flex items-center justify-center p-1">
                    <span className="text-2xl font-bold">
                      <img
                        src={
                          MAHJONG_TILES.find((t) => t.id === selectedTile)
                            ?.imageUrl
                        }
                        alt="Dora preview"
                        className="w-full h-full object-contain"
                      />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-4 m-2">
            <div className="space-y-4 m-2">
              <Label htmlFor="dora-image">{t("uploadImage")}</Label>
              <Input
                id="dora-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
                disabled={isModelLoading || isDetecting}
              />
              {isModelLoading && <p>AI model is loading...</p>}
              {isDetecting && <p>Detecting tiles...</p>}
              {modelError && (
                <p className="text-red-500">
                  Error loading model: {modelError.message}
                </p>
              )}
              {detectionError && (
                <p className="text-red-500">{detectionError}</p>
              )}

              {imagePreview && (
                <div className="flex justify-center m-2">
                  <div className="w-32 h-40 border-2 border-primary rounded overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Dora preview"
                      className="w-full h-full object-scale-down rounded"
                      ref={imageElementRef}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Preview selected tile */}
            {selectedTile && (
              <>
                <Label className="flex justify-center ">
                  {t("detectTile")}
                </Label>
                <div className="flex justify-center">
                  <div className="w-16 h-20 bg-muted rounded border-2 border-primary flex items-center justify-center p-1">
                    <span className="text-2xl font-bold">
                      <img
                        src={
                          MAHJONG_TILES.find((t) => t.id === selectedTile)
                            ?.imageUrl
                        }
                        alt="Dora preview"
                        className="w-full h-full object-contain"
                      />
                    </span>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="bg-gradient-primary hover:shadow-elegant transition-smooth disabled:opacity-50"
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
