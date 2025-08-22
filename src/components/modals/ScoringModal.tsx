import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useMahjongGame } from "@/contexts/MatchContext";
import { MAHJONG_TILES, parseDetectionsToTiles, Tile } from "@/types/game";
import useMahjongDetection from "@/utils/detection";
import { analyzeMahjongHand } from "@/utils/hand_analyzer";
import { Grid3X3, Plus, Upload, X } from "lucide-react";
import React, { useRef, useState } from "react";
interface ScoringModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scoring: ScoringData) => void;
  actionType: "ron" | "tsumo";
  doras: Tile[];
}

export interface ScoringData {
  tiles: Tile[];
  isRiichi: boolean;
  isDoubleRiichi: boolean;
  remainingTiles: number;
  isFirstRound: boolean;
  ronPlayer?: string; // Player ID who pays (only for Ron)
  winnerPlayer: string; // Player ID who pays (only for Ron)
  isTsumo?: boolean;
  isClosed: boolean;
  isFirstTurnWin: boolean;
  isFirstTurnForPlayer: boolean;
  totalPoints: number;
}

export const ScoringModal: React.FC<ScoringModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  actionType,
  doras,
}) => {
  const { t } = useLanguage();
  const [selectedTiles, setSelectedTiles] = useState<Tile[]>([]);
  const [currentTileSelection, setCurrentTileSelection] = useState<string>("");
  const [uraDoras, seturaDoras] = useState<Tile[]>([]);
  const [currentUraDoraSelection, setCurrentUraDoraSelection] =
    useState<string>("");
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isRiichi, setIsRiichi] = useState(false);
  const [isDoubleRiichi, setIsDoubleRiichi] = useState(false);
  const [remainingTiles, setRemainingTiles] = useState<number>(70);
  const [isFirstRound, setIsFirstRound] = useState(false);
  const [ronPlayer, setRonPlayer] = useState<string>("");
  const [winnerPlayer, setWinnerPlayer] = useState<string>("");
  const [detectionError, setDetectionError] = useState<string | null>(null);
  const [isTsumo, setIsTsumo] = useState(actionType === "tsumo");
  const [isClosed, setIsClosed] = useState(true);
  const [isFirstTurnWin, setIsFirstTurnWin] = useState(false);
  const [isFirstTurnForPlayer, setIsFirstTurnForPlayer] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const { runDetection, isModelLoading, modelError } = useMahjongDetection();
  const [winningTile, setWinningTile] = useState<Tile | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null); // State for the analysis result
  const { prevalentWind, players } = useMahjongGame();

  const handleDetection = async () => {
    if (isModelLoading || isDetecting) {
      console.log("Model is busy or loading, please wait.");
      return;
    }

    if (!imageElementRef.current) {
      console.error("Image element is not available.");
      return;
    }

    setIsDetecting(true);
    try {
      const results = await runDetection(imageElementRef.current);
      setSelectedTiles(parseDetectionsToTiles(results));
      if (results && results.length > 0) {
        const newTiles = results
          .map((d) => MAHJONG_TILES[d.tileCode])
          .filter(Boolean) as Tile[];
        setSelectedTiles((prev) => [...prev, ...newTiles].slice(0, 14));
        setDetectionError(null);
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
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
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

  const addTile = () => {
    if (currentTileSelection && selectedTiles.length < 14) {
      const tile = Object.values(MAHJONG_TILES).find(
        (t) => t.id === currentTileSelection
      );
      if (tile) {
        setSelectedTiles([...selectedTiles, tile]);
        setCurrentTileSelection("");
      }
    }
  };
  const addUradora = () => {
    if (currentUraDoraSelection && uraDoras.length < doras.length) {
      const tile = Object.values(MAHJONG_TILES).find(
        (t) => t.id === currentUraDoraSelection
      );
      if (tile) {
        seturaDoras([...uraDoras, tile]);
        setCurrentUraDoraSelection("");
      }
    }
  };

  const removeTile = (index: number) => {
    setSelectedTiles(selectedTiles.filter((_, i) => i !== index));
  };
  const removeUradora = (index: number) => {
    seturaDoras(uraDoras.filter((_, i) => i !== index));
  };

  const handleAnalyzeHand = () => {
    const winner = players.find((p) => p.name === winnerPlayer);
    if (!winner) {
      setAnalysisResult({ error: "No winner selected." });
      return;
    }

    // This is a placeholder as the Dora tiles are not selectable in the UI.

    const result = analyzeMahjongHand({
      handTiles: selectedTiles,
      doraTiles: doras,
      uraDoraTiles: uraDoras,
      prevalentWind: prevalentWind,
      seatWind: winner.wind,
      remainingTiles: remainingTiles,
      winningTile: winningTile,
      isRiichi: isRiichi,
      isDoubleRiichi: isDoubleRiichi,
      isTsumo: isTsumo,
      isClosed: isClosed,
      isDealer: winner.wind == "east",
      isFirstTurnWin: isFirstTurnWin,
      isFirstTurnForPlayer: isFirstTurnForPlayer,
    });
    setAnalysisResult(result);
  };

  const handleConfirm = () => {
    if (
      selectedTiles.length === 14 &&
      (actionType === "tsumo" || ronPlayer) &&
      analysisResult &&
      !analysisResult.error
    ) {
      const scoringData: ScoringData = {
        tiles: selectedTiles,
        isRiichi,
        isDoubleRiichi,
        remainingTiles,
        isFirstRound,
        ...(actionType === "ron" && { ronPlayer }),
        winnerPlayer,
        isClosed,
        isFirstTurnWin,
        isFirstTurnForPlayer,
        totalPoints: analysisResult.total_points,
      };
      onConfirm(scoringData);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedTiles([]);
    setCurrentTileSelection("");
    setImagePreview("");
    setIsRiichi(false);
    setIsDoubleRiichi(false);
    setRemainingTiles(122);
    setIsFirstRound(false);
    setRonPlayer("");
    setDetectionError(null);
    setIsTsumo(actionType === "tsumo");
    setIsClosed(true);
    setIsFirstTurnWin(false);
    setIsFirstTurnForPlayer(false);
    if (imageElementRef.current) {
      imageElementRef.current = null;
    }
    setAnalysisResult(null); // Reset analysis result
    onClose();
  };

  const tile_selector = (section: string) => (
    <SelectContent className="max-h-60 bg-card border-border">
      <div className="space-y-2">
        {/* Man (Characters) */}
        <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
          Characters (万)
        </div>
        {getTilesByType("man").map((tile) => (
          <SelectItem key={tile.id + section} value={tile.id}>
            <span className="text-lg mr-2">{tile.display}</span>
            {tile.value}
          </SelectItem>
        ))}

        {/* Pin (Circles) */}
        <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
          Circles (筒)
        </div>
        {getTilesByType("pin").map((tile) => (
          <SelectItem key={tile.id + section} value={tile.id}>
            <span className="text-lg mr-2">{tile.display}</span>
            {tile.value}
          </SelectItem>
        ))}

        {/* Sou (Bamboo) */}
        <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
          Bamboo (索)
        </div>
        {getTilesByType("sou").map((tile) => (
          <SelectItem key={tile.id + section} value={tile.id}>
            <span className="text-lg mr-2">{tile.display}</span>
            {tile.value}
          </SelectItem>
        ))}

        {/* Honor */}
        <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
          Honor Tiles
        </div>
        {getTilesByType("honor").map((tile) => (
          <SelectItem key={tile.id + section} value={tile.id}>
            <span className="text-lg mr-2">{tile.display}</span>
            {tile.value}
          </SelectItem>
        ))}
      </div>
    </SelectContent>
  );
  const getTilesByType = (type: string) => {
    return MAHJONG_TILES.filter((tile) => tile.type === type);
  };

  const canAnalyze =
    selectedTiles.length === 14 &&
    winnerPlayer &&
    uraDoras.length == doras.length &&
    (actionType === "tsumo" || ronPlayer);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[1100px] max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-sm border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {actionType === "ron" ? t("ron") : t("tsumo")} - {t("selectHand")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tiles Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                {t("hand")} ({selectedTiles.length}/14)
              </Label>
              <Badge
                variant={selectedTiles.length === 14 ? "default" : "secondary"}
              >
                {selectedTiles.length === 14 ? t("complete") : t("incomplete")}
              </Badge>
            </div>

            {/* Selected Tiles Display */}
            {selectedTiles.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                {selectedTiles.map((tile, index) => (
                  <div
                    key={`${tile.id}-${index}-selectedtile`}
                    className="relative group"
                  >
                    <div className="flex justify-center">
                      <div className="w-16 h-20 bg-muted rounded border-2 border-primary flex items-center justify-center p-1">
                        <span className="text-2xl font-bold">
                          <img
                            src={tile?.imageUrl}
                            alt="Tile preview"
                            className="w-full h-full object-contain"
                          />
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-5 h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeTile(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Tiles */}
            {selectedTiles.length < 14 && (
              <Tabs defaultValue="tile" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tile" className="flex items-center">
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    {t("selectTile")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="image"
                    className="flex items-center"
                    disabled={isModelLoading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isModelLoading ? "Loading AI..." : t("uploadImage")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="image" className="space-y-4">
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                      disabled={isModelLoading || isDetecting}
                    />
                    {isModelLoading && <p>AI model is loading...</p>}
                    {modelError && (
                      <p className="text-red-500">
                        Error loading model: {modelError.message}
                      </p>
                    )}
                    {detectionError && (
                      <p className="text-red-500">{detectionError}</p>
                    )}

                    {imagePreview && (
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 border-2 border-primary rounded overflow-hidden">
                          <img
                            src={imagePreview}
                            alt="Tile preview"
                            className="w-full h-full object-cover"
                            ref={imageElementRef}
                          />
                        </div>
                        <p>{t("detectedFromImage")}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="tile" className="space-y-4">
                  <div className="flex gap-2">
                    <Select
                      value={currentTileSelection}
                      onValueChange={setCurrentTileSelection}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={t("selectTile")} />
                      </SelectTrigger>
                      {tile_selector("hand")}
                    </Select>
                    <Button
                      onClick={addTile}
                      disabled={!currentTileSelection || isModelLoading}
                      size="sm"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
          {/* Uradora Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                Ura Doras ({uraDoras.length}/{doras.length})
              </Label>
              <Badge
                variant={
                  uraDoras.length === doras.length ? "default" : "secondary"
                }
              >
                {uraDoras.length === doras.length
                  ? t("complete")
                  : t("incomplete")}
              </Badge>
            </div>
          </div>
          {/* Selected Ura dora Display */}
          {uraDoras.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
              {uraDoras.map((tile, index) => (
                <div
                  key={`${tile.id}-${index}-uraDoras`}
                  className="relative group"
                >
                  <div className="flex justify-center">
                    <div className="w-16 h-20 bg-muted rounded border-2 border-primary flex items-center justify-center p-1">
                      <span className="text-2xl font-bold">
                        <img
                          src={tile?.imageUrl}
                          alt="uraDora preview"
                          className="w-full h-full object-contain"
                        />
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-5 h-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeUradora(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {/* Uradora Options */}

          <div className="flex gap-2">
            <Select
              value={currentUraDoraSelection}
              onValueChange={setCurrentUraDoraSelection}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={t("selectTile")} />
              </SelectTrigger>
              {tile_selector("uradora")}
            </Select>
            <Button
              onClick={addUradora}
              disabled={!currentUraDoraSelection || isModelLoading}
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {/* Scoring Options */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold">
              {t("scoringOptions")}
            </Label>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="riichi"
                  checked={isRiichi}
                  onCheckedChange={(checked) => {
                    setIsRiichi(checked === true);
                    setIsDoubleRiichi(false);
                    setIsClosed(true);
                  }}
                />
                <Label htmlFor="riichi">Riichi</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="double-riichi"
                  checked={isDoubleRiichi}
                  onCheckedChange={(checked) => {
                    setIsDoubleRiichi(checked === true);
                    setIsClosed(true);
                    setIsRiichi(false);
                  }}
                />
                <Label htmlFor="double-riichi">Double Riichi</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="closed"
                  checked={isClosed}
                  onCheckedChange={(checked) => setIsClosed(checked === true)}
                />
                <Label htmlFor="closed">Closed Hand</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="first-turn-win"
                  checked={isFirstTurnWin}
                  onCheckedChange={(checked) =>
                    setIsFirstTurnWin(checked === true)
                  }
                />
                <Label htmlFor="first-turn-win">First Turn Win</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="first-turn-for-player"
                  checked={isFirstTurnForPlayer}
                  onCheckedChange={(checked) => {
                    setIsFirstTurnForPlayer(checked === true);
                    setIsFirstTurnWin(true);
                  }}
                />
                <Label htmlFor="first-turn-for-player">
                  First Turn for Player
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remaining-tiles">{t("remainingTiles")}</Label>
              <Input
                id="remaining-tiles"
                type="number"
                min="0"
                max="136"
                value={remainingTiles}
                onChange={(e) =>
                  setRemainingTiles(parseInt(e.target.value) || 0)
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("selectPlayerWinner")}</Label>
              <Select value={winnerPlayer} onValueChange={setWinnerPlayer}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectPlayer")} />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {players.map(
                    (player, index) =>
                      player.name != ronPlayer && (
                        <SelectItem
                          key={player.name + index + "winner"}
                          value={player.name}
                        >
                          {player.name} ({player.wind})
                        </SelectItem>
                      )
                  )}
                </SelectContent>
              </Select>
            </div>
            {/* Ron Player Selection */}
            {actionType === "ron" && winnerPlayer && (
              <div className="space-y-2">
                <Label>{t("selectPlayerToPay")}</Label>
                <Select value={ronPlayer} onValueChange={setRonPlayer}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectPlayer")} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {players.map(
                      (player, index) =>
                        player.name != winnerPlayer && (
                          <SelectItem
                            key={player.name + index + "payer"}
                            value={player.name}
                          >
                            {player.name} ({player.wind})
                          </SelectItem>
                        )
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          {/* Winning Tile Selection */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-semibold">
              {t("winningTile")}
            </Label>
            <div className="flex items-center gap-4">
              <Select
                value={winningTile?.id || ""}
                onValueChange={(value) => {
                  const tile = MAHJONG_TILES.find((t) => t.id === value);
                  setWinningTile(tile || null);
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select winning tile" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-card border-border">
                  <div className="space-y-2">
                    <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                      Final hand
                    </div>
                    {selectedTiles.map((tile, index) => (
                      <SelectItem
                        key={tile.id + index + "winning"}
                        value={tile.id}
                      >
                        <span className="text-lg mr-2">{tile.display}</span>
                        {tile.value}
                      </SelectItem>
                    ))}
                  </div>
                </SelectContent>
              </Select>

              {winningTile && (
                <div className="flex justify-center">
                  <div className="w-12 h-16 bg-muted rounded border-2 border-primary flex items-center justify-center p-1">
                    <span className="text-2xl font-bold">
                      <img
                        src={winningTile.imageUrl}
                        alt="Winning Tile preview"
                        className="w-full h-full object-cover"
                        ref={imageElementRef}
                      />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Results Display */}
            {analysisResult && (
              <div className="mt-6 relative overflow-hidden animate-scale-in">
                {/* Simple background */}
                <div className="absolute inset-0 bg-card/95 border border-border rounded-lg"></div>

                <div className="relative p-6 space-y-6">
                  {/* Hand Display */}
                  <div className="text-center space-y-3">
                    <h3 className="text-2xl font-bold text-primary">
                      Hand Analysis
                    </h3>

                    {/* Winning Hand Tiles */}
                    <div className="flex justify-center items-center gap-1 mb-4">
                      {selectedTiles.map((tile, index) => (
                        <div className="flex justify-center">
                          <div className="w-8 h-12 bg-muted rounded border-2 border-primary flex items-center justify-center">
                            <span className="text-2xl font-bold">
                              <img
                                src={tile.imageUrl}
                                alt={index + "hand result Tile preview"}
                                className="w-full h-full object-cover"
                                ref={imageElementRef}
                              />
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Dora Indicators (placeholder) */}
                    <div className="flex justify-center items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-semibold text-sm">
                          Doras
                        </span>
                        {doras.map((tile, index) => (
                          <div className="flex justify-center">
                            <div className="w-6 h-8 bg-muted rounded border-2 border-primary flex items-center justify-center">
                              <span className="text-2xl font-bold">
                                <img
                                  src={tile.imageUrl}
                                  alt="dora result Tile preview"
                                  className="w-full h-full object-cover"
                                  ref={imageElementRef}
                                />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-semibold text-sm">
                          Hidden Doras
                        </span>
                        {uraDoras.map((tile, index) => (
                          <div className="flex justify-center">
                            <div className="w-6 h-8 bg-muted rounded border-2 border-primary flex items-center justify-center">
                              <span className="text-2xl font-bold">
                                <img
                                  src={tile.imageUrl}
                                  alt="ura dora result Tile preview"
                                  className="w-full h-full object-cover"
                                  ref={imageElementRef}
                                />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-6xl font-black text-primary mb-4">
                      {analysisResult.total_points?.toLocaleString() || "0"}
                    </div>

                    <div className="flex justify-center gap-8 mb-4">
                      <div className="text-center p-3 bg-secondary/10 rounded-lg border border-secondary/30">
                        <div className="text-foreground font-bold text-2xl">
                          {analysisResult.total_han}
                        </div>
                        <div className="text-muted-foreground text-sm font-semibold">
                          Han
                        </div>
                      </div>
                      <div className="text-center p-3 bg-accent/10 rounded-lg border border-accent/30">
                        <div className="text-foreground font-bold text-2xl">
                          {analysisResult.total_fu}
                        </div>
                        <div className="text-muted-foreground text-sm font-semibold">
                          Fu
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Yaku List */}
                  {analysisResult.han_by_name && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-bold text-primary text-center">
                        Yaku List
                      </h4>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {Object.entries(analysisResult.han_by_name).map(
                          ([name, han], index) => (
                            <div
                              key={name}
                              className="flex justify-between items-center bg-muted/50 rounded px-3 py-2 border border-border hover:border-primary/50 transition-colors duration-200"
                            >
                              <span className="text-foreground text-sm font-medium">
                                {name}
                              </span>
                              <div className="flex items-center gap-1 bg-secondary/20 px-2 py-0.5 rounded">
                                <span className="text-foreground font-bold text-sm">
                                  {han as number}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  Han
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleAnalyzeHand}
            disabled={!canAnalyze}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50"
          >
            Analyze Hand
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!analysisResult || analysisResult.error}
            className="bg-gradient-primary hover:shadow-elegant transition-smooth disabled:opacity-50"
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
