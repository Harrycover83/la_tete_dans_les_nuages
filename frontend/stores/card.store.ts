import { create } from 'zustand';

interface CardState {
  balance: number | null;
  cardId: string | null;
  setCard: (cardId: string, balance: number) => void;
  setBalance: (balance: number) => void;
  reset: () => void;
}

export const useCardStore = create<CardState>((set) => ({
  balance: null,
  cardId: null,
  setCard: (cardId, balance) => set({ cardId, balance }),
  setBalance: (balance) => set({ balance }),
  reset: () => set({ balance: null, cardId: null }),
}));
