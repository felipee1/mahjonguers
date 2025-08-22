import React, { createContext, ReactNode, useContext, useState } from "react";

type Language = "en" | "pt";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Main Menu
    newGame: "New Game",
    title: "Mahjonguers",
    subtitle: "Manage your Mahjong matches with style",
    mahjongZen: "Mahjonguers",
    gameManager: "Game Manager",
    history: "History",
    settings: "Settings",
    traditionalMahjong: "Riichi Mahjong",
    prevailingWind: "Prevailing Wind",

    // Player Setup
    playerSetup: "Player Setup",
    enterPlayerNames: "Enter Player Names",
    player: "Player",
    startGame: "Start Game",
    fillAllPlayers: "Please fill all player names",

    // Game Board
    round: "Round",
    wind: "Wind",
    east: "East",
    south: "South",
    west: "West",
    north: "North",
    score: "Score",
    startNewRound: "Start New Round",
    resetMatch: "Finish Match",
    selectDora: "Select Dora",

    // Game Actions
    ron: "Ron",
    tsumo: "Tsumo",
    kan: "Kan",
    riichi: "Riichi",
    doubleRiichi: "Double Riichi",
    tilesLeft: "Tiles Left",
    firstRound: "First Round",
    afterKan: "After Kan",
    robbingKan: "Robbing Kan",

    // Modals
    selectPlayer: "Select Player",
    uploadImage: "Upload Image",
    selectTile: "Select Tile",
    selectHand: "Select Hand",
    complete: "Complete",
    incomplete: "Incomplete",
    scoringOptions: "Scoring Options",
    remainingTiles: "Remaining Tiles",
    selectPlayerToPay: "Select Player to Pay",
    selectPlayerWinner: "Select The Winner Player",
    confirm: "Confirm",
    cancel: "Cancel",
    addTile: "Add Tile",
    remove: "Remove",
    detectTile: "Detected Tile",
    winningTile: "Winning Tile",

    // Dora/Tiles
    dora: "Dora",
    hand: "Hand",
    tiles: "Tiles",

    // General
    newRound: "New Round",
    endGame: "End Game",
    back: "Back",
    gameHistory: "Game History",
    lastFiveGames: "Last 5 Games",
    noGamesPlayed: "No Games Played Yet",
    playFirstGame: "Start your first Mahjong game to see the history here",
    finalRanking: "Final Ranking",
    game: "Game",
    rounds: "Rounds",
    players: "Players",
  },
  pt: {
    // Main Menu
    newGame: "Novo Jogo",
    title: "Mahjongueiros",
    subtitle: "Gerencie suas partidas de Mahjong com estilo",
    mahjongZen: "Mahjongueiros",
    gameManager: "Gerenciador de Jogos",
    history: "Histórico",
    settings: "Configurações",
    traditionalMahjong: "Mahjong Riichi",
    prevailingWind: "Vento Prevalente",

    // Player Setup
    playerSetup: "Configuração de Jogadores",
    enterPlayerNames: "Digite os Nomes dos Jogadores",
    player: "Jogador",
    startGame: "Iniciar Jogo",
    resetMatch: "Finalizar o jogo",
    fillAllPlayers: "Por favor, preencha todos os nomes",

    // Game Board
    round: "Rodada",
    wind: "Vento",
    east: "Leste",
    south: "Sul",
    west: "Oeste",
    north: "Norte",
    score: "Pontuação",
    startNewRound: "Iniciar Nova Rodada",
    selectDora: "Selecionar Dora",

    // Game Actions
    ron: "Ron",
    tsumo: "Tsumo",
    kan: "Kan",
    riichi: "Riichi",
    doubleRiichi: "Riichi Duplo",
    tilesLeft: "Peças Restantes",
    firstRound: "Primeira Rodada",
    afterKan: "After Kan",
    robbingKan: "Roubando Kan",

    // Modals
    selectPlayer: "Selecionar Jogador",
    uploadImage: "Carregar Imagem",
    selectTile: "Selecionar Peça",
    selectHand: "Selecionar Mão",
    complete: "Completa",
    incomplete: "Incompleta",
    scoringOptions: "Opções de Pontuação",
    remainingTiles: "Peças Restantes",
    selectPlayerToPay: "Selecionar Jogador para Pagar",
    selectPlayerWinner: "Selecionar Jogador Vencedor",
    confirm: "Confirmar",
    cancel: "Cancelar",
    addTile: "Adicionar Peça",
    remove: "Remover",
    detectTile: "Peça Detectada",
    winningTile: "Peça Vencedora",

    // Dora/Tiles
    dora: "Dora",
    hand: "Mão",
    tiles: "Peças",

    // General
    newRound: "Nova Rodada",
    endGame: "Finalizar Partida",
    back: "Voltar",
    gameHistory: "Histórico de Jogos",
    lastFiveGames: "Últimos 5 Jogos",
    noGamesPlayed: "Nenhum Jogo Jogado Ainda",
    playFirstGame:
      "Comece seu primeiro jogo de Mahjong para ver o histórico aqui",
    finalRanking: "Classificação Final",
    game: "Jogo",
    rounds: "Rodadas",
    players: "Jogadores",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "pt" : "en"));
  };

  const t = (key: string): string => {
    return (
      translations[language][key as keyof (typeof translations)["en"]] || key
    );
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
