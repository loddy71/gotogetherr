import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { isCityCode } from '@/lib/data/cities';
import type { Trip } from '@/lib/types';

/**
 * Trip storage: React context backed by AsyncStorage (localStorage on web,
 * native storage on iOS/Android). Small enough that a state library isn't
 * worth the dependency; swap for a synced backend when accounts land.
 */

const STORAGE_KEY = 'gotogether/trips/v1';

type TripsContextValue = {
  trips: Trip[];
  hydrated: boolean;
  saveTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
};

const TripsContext = createContext<TripsContextValue | null>(null);

export function TripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const stored = raw ? validTrips(JSON.parse(raw)) : [];
        // Keep anything saved before storage answered (e.g. a join link).
        setTrips((early) => [...early, ...stored.filter((t) => !early.some((e) => e.id === t.id))]);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  // Persist after load only, debounced, from committed state.
  useEffect(() => {
    if (!hydrated) return;
    const timer = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trips)).catch(() => {});
    }, 150);
    return () => clearTimeout(timer);
  }, [trips, hydrated]);

  const saveTrip = (trip: Trip) => {
    setTrips((prev) => {
      const i = prev.findIndex((t) => t.id === trip.id);
      const next = [...prev];
      if (i >= 0) next[i] = trip;
      else next.unshift(trip);
      return next;
    });
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <TripsContext.Provider value={{ trips, hydrated, saveTrip, deleteTrip }}>
      {children}
    </TripsContext.Provider>
  );
}

/** Stored data is untrusted after app updates: drop travelers from unknown cities. */
function validTrips(raw: unknown): Trip[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((t): t is Trip => !!t && typeof t.id === 'string' && Array.isArray(t.travelers))
    .map((t) => ({ ...t, travelers: t.travelers.filter((tr) => tr && isCityCode(tr.originCode)) }))
    .filter((t) => t.travelers.length > 0);
}

export function useTrips(): TripsContextValue {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error('useTrips must be used inside <TripsProvider>');
  return ctx;
}

export function useTrip(id: string | undefined): Trip | undefined {
  const { trips } = useTrips();
  return trips.find((t) => t.id === id);
}
