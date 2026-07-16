import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

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
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setTrips(JSON.parse(raw) as Trip[]);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  const saveTrip = (trip: Trip) => {
    setTripsSafe((prev) => {
      const i = prev.findIndex((t) => t.id === trip.id);
      const next = [...prev];
      if (i >= 0) next[i] = trip;
      else next.unshift(trip);
      return next;
    });
  };

  const deleteTrip = (id: string) => {
    setTripsSafe((prev) => prev.filter((t) => t.id !== id));
  };

  // Route updates through the latest state, then persist the result.
  const setTripsSafe = (fn: (prev: Trip[]) => Trip[]) => {
    setTrips((prev) => {
      const next = fn(prev);
      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      }, 150);
      return next;
    });
  };

  return (
    <TripsContext.Provider value={{ trips, hydrated, saveTrip, deleteTrip }}>
      {children}
    </TripsContext.Provider>
  );
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
