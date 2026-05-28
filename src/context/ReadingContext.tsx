"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTarotShuffle } from "@/hooks/useTarotShuffle";
import { useLenormandShuffle } from "@/hooks/useLenormandShuffle";
import { getSpreadLayout } from "@/lib/spreadLayouts";
import { getLenormandLayout } from "@/lib/lenormand/layouts";
import { buildLenormandCombinations } from "@/lib/lenormand/combinationEngine";
import { upsertReading } from "@/lib/storage";
import type {
  DeckType,
  DrawnCard,
  ReadingSession,
  RitualPhase,
  SpreadType,
} from "@/types/tarot";
import type {
  LenormandCombination,
  LenormandSpreadType,
} from "@/types/lenormand";

interface ReadingContextValue {
  deck: DeckType | null;
  spread: SpreadType | null;
  lenormandSpread: LenormandSpreadType | null;
  question: string;
  cards: DrawnCard[];
  jumpCard: DrawnCard | null;
  showJumpNotice: boolean;
  combinations: LenormandCombination[];
  session: ReadingSession | null;
  ritualPhase: RitualPhase;
  isShuffling: boolean;
  setDeck: (deck: DeckType) => void;
  setSpread: (spread: SpreadType) => void;
  setLenormandSpread: (spread: LenormandSpreadType) => void;
  setQuestion: (q: string) => void;
  startRitual: () => Promise<void>;
  completeCut: (selection: number | string[]) => Promise<DrawnCard[]>;
  shuffledPool: import("@/types/tarot").TarotCard[];
  reset: () => void;
  prepareNewReading: () => void;
  persistSession: (patch?: Partial<ReadingSession>) => void;
  updateSession: (
    updater: (prev: ReadingSession) => ReadingSession,
  ) => void;
}

const ReadingContext = createContext<ReadingContextValue | null>(null);

export function ReadingProvider({ children }: { children: ReactNode }) {
  const [deck, setDeckState] = useState<DeckType | null>(null);
  const [spread, setSpread] = useState<SpreadType | null>(null);
  const [lenormandSpread, setLenormandSpread] =
    useState<LenormandSpreadType | null>(null);
  const [question, setQuestion] = useState("");
  const [cards, setCards] = useState<DrawnCard[]>([]);
  const [combinations, setCombinations] = useState<LenormandCombination[]>([]);
  const [session, setSession] = useState<ReadingSession | null>(null);
  const [ritualPhase, setRitualPhase] = useState<RitualPhase>("idle");

  const tarotShuffle = useTarotShuffle();
  const lenormandShuffle = useLenormandShuffle();

  const isLenormand = deck === "lenormand";
  const isShuffling = isLenormand
    ? lenormandShuffle.isShuffling
    : tarotShuffle.isShuffling;
  const jumpCard = isLenormand
    ? lenormandShuffle.jumpCard
    : tarotShuffle.jumpCard;
  const showJumpNotice = isLenormand
    ? lenormandShuffle.showJumpNotice
    : tarotShuffle.showJumpNotice;

  const setDeck = useCallback((d: DeckType) => {
    setDeckState(d);
    if (d === "lenormand") {
      setSpread(null);
    } else {
      setLenormandSpread(null);
    }
  }, []);

  const startRitual = useCallback(async () => {
    if (!deck) return;
    setRitualPhase("shuffling");
    setCards([]);
    setCombinations([]);

    if (deck === "lenormand" && lenormandSpread) {
      await lenormandShuffle.runShuffle(lenormandSpread);
    } else if (deck === "waite" && spread) {
      await tarotShuffle.runShuffle(deck, spread);
    } else {
      return;
    }
    setRitualPhase("cutting");
  }, [deck, spread, lenormandSpread, tarotShuffle, lenormandShuffle]);

  const completeCut = useCallback(
    async (selection: number | string[]): Promise<DrawnCard[]> => {
      if (!deck) return [];

      let drawn: DrawnCard[] = [];
      let combos: LenormandCombination[] = [];

      if (deck === "lenormand" && lenormandSpread) {
        drawn = Array.isArray(selection)
          ? lenormandShuffle.drawPickedCards(lenormandSpread, selection)
          : lenormandShuffle.drawFromPool(lenormandSpread);
        drawn = drawn.slice(0, getLenormandLayout(lenormandSpread).cardCount);
        combos = buildLenormandCombinations(lenormandSpread, drawn);
        setCombinations(combos);
      } else if (deck === "waite" && spread) {
        drawn = Array.isArray(selection)
          ? tarotShuffle.drawPickedCards(spread, deck, selection)
          : tarotShuffle.drawFromPool(spread, deck);
        drawn = drawn.slice(0, getSpreadLayout(spread).cardCount);
      }

      setCards(drawn);
      const newSession: ReadingSession = {
        id: crypto.randomUUID(),
        deck,
        spread: deck === "waite" ? spread! : undefined,
        lenormandSpread: deck === "lenormand" ? lenormandSpread! : undefined,
        cards: drawn,
        jumpCard: isLenormand ? lenormandShuffle.jumpCard : tarotShuffle.jumpCard,
        combinations: combos.length ? combos : undefined,
        createdAt: new Date().toISOString(),
        question: question.trim() || undefined,
      };
      setSession(newSession);
      setRitualPhase("spread");
      return drawn;
    },
    [
      deck,
      spread,
      lenormandSpread,
      tarotShuffle,
      lenormandShuffle,
      question,
      isLenormand,
    ]
  );

  const persistSession = useCallback(
    (patch?: Partial<ReadingSession>) => {
      setSession((prev) => {
        if (!prev) return prev;
        const merged = { ...prev, ...patch };
        upsertReading(merged);
        return merged;
      });
    },
    [],
  );

  const updateSession = useCallback(
    (updater: (prev: ReadingSession) => ReadingSession) => {
      setSession((prev) => {
        if (!prev) return prev;
        const merged = updater(prev);
        upsertReading(merged);
        return merged;
      });
    },
    [],
  );

  const resetShuffle = useCallback(() => {
    tarotShuffle.resetShuffle();
    lenormandShuffle.resetShuffle();
  }, [tarotShuffle, lenormandShuffle]);

  const reset = useCallback(() => {
    setDeckState(null);
    setSpread(null);
    setLenormandSpread(null);
    setQuestion("");
    setCards([]);
    setCombinations([]);
    setSession(null);
    setRitualPhase("idle");
    resetShuffle();
  }, [resetShuffle]);

  const prepareNewReading = useCallback(() => {
    setCards([]);
    setCombinations([]);
    setSession(null);
    setRitualPhase("idle");
    resetShuffle();
  }, [resetShuffle]);

  const shuffledPool = isLenormand
    ? lenormandShuffle.shuffledPool
    : tarotShuffle.shuffledPool;

  const value = useMemo(
    () => ({
      deck,
      spread,
      lenormandSpread,
      question,
      cards,
      jumpCard,
      showJumpNotice,
      combinations,
      session,
      ritualPhase,
      isShuffling,
      shuffledPool,
      setDeck,
      setSpread,
      setLenormandSpread,
      setQuestion,
      startRitual,
      completeCut,
      reset,
      prepareNewReading,
      persistSession,
      updateSession,
    }),
    [
      deck,
      spread,
      lenormandSpread,
      question,
      cards,
      jumpCard,
      showJumpNotice,
      combinations,
      session,
      ritualPhase,
      isShuffling,
      shuffledPool,
      startRitual,
      completeCut,
      persistSession,
      updateSession,
      reset,
      prepareNewReading,
    ]
  );

  return (
    <ReadingContext.Provider value={value}>{children}</ReadingContext.Provider>
  );
}

export function useReading() {
  const ctx = useContext(ReadingContext);
  if (!ctx) {
    throw new Error("useReading must be used within ReadingProvider");
  }
  return ctx;
}
