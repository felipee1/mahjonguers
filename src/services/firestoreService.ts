import { db } from '@/config/firebase';
import {
    collection,
    doc,
    getDoc,
    serverTimestamp,
    setDoc,
    updateDoc,
    onSnapshot,
} from 'firebase/firestore';

export interface FirestoreGameState {
  players: any[];
  currentRound: number;
  dealer: string;
  doraIndicators: any[];
  prevalentWind: string;
  gamePhase: string;
  history: any[];
  updatedAt: any;
}

export const firestoreService = {
  // Save game state to Firestore
  async saveGameState(userId: string, gameState: any): Promise<void> {
    try {
      const gameRef = doc(db, 'users', userId, 'games', 'current');
      await setDoc(
        gameRef,
        {
          ...gameState,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving game state to Firestore:', error);
      throw error;
    }
  },

  // Load game state from Firestore
  async loadGameState(userId: string): Promise<FirestoreGameState | null> {
    try {
      const gameRef = doc(db, 'users', userId, 'games', 'current');
      const gameSnap = await getDoc(gameRef);

      if (gameSnap.exists()) {
        return gameSnap.data() as FirestoreGameState;
      }
      return null;
    } catch (error) {
      console.error('Error loading game state from Firestore:', error);
      throw error;
    }
  },

  // Update specific fields in game state
  async updateGameState(userId: string, updates: Partial<FirestoreGameState>): Promise<void> {
    try {
      const gameRef = doc(db, 'users', userId, 'games', 'current');
      await updateDoc(gameRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating game state in Firestore:', error);
      throw error;
    }
  },

  // Delete game state from Firestore
  async deleteGameState(userId: string): Promise<void> {
    try {
      const gameRef = doc(db, 'users', userId, 'games', 'current');
      await setDoc(gameRef, {
        players: [],
        currentRound: 0,
        dealer: '',
        doraIndicators: [],
        prevalentWind: 'east',
        gamePhase: 'waiting',
        history: [],
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error deleting game state from Firestore:', error);
      throw error;
    }
  },

  // Save match history
  async saveMatchHistory(userId: string, matchData: any): Promise<void> {
    try {
      const historyRef = doc(collection(db, 'users', userId, 'history'));
      await setDoc(historyRef, {
        ...matchData,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving match history to Firestore:', error);
      throw error;
    }
  },

  // Multiplayer Rooms
  async createRoom(gameState: any): Promise<string> {
    try {
      const roomRef = doc(collection(db, 'rooms'));
      await setDoc(roomRef, {
        gameState,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return roomRef.id;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },

  async getRoomState(roomId: string): Promise<any | null> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        return roomSnap.data().gameState;
      }
      return null;
    } catch (error) {
      console.error('Error getting room state:', error);
      throw error;
    }
  },

  async updateRoomState(roomId: string, gameState: any): Promise<void> {
    try {
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        gameState,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating room state:', error);
      throw error;
    }
  },

  listenRoomState(roomId: string, callback: (gameState: any) => void): () => void {
    const roomRef = doc(db, 'rooms', roomId);
    return onSnapshot(roomRef, (snap: any) => {
      if (snap.exists()) {
        callback(snap.data().gameState);
      }
    });
  },
};
