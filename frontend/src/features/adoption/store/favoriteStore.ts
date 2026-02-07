import type { LikedDog } from "../api/likeApi";

type FavoriteState = {
  favoriteIds: Set<string>;
  favoriteDogs: LikedDog[];
  pendingIds: Set<string>;
  initialized: boolean;
  loading: boolean;
};

let state: FavoriteState = {
  favoriteIds: new Set(),
  favoriteDogs: [],
  pendingIds: new Set(),
  initialized: false,
  loading: false,
};

const listeners = new Set<() => void>();

const emit = () => {
  listeners.forEach((listener) => listener());
};

const setState = (updater: (prev: FavoriteState) => FavoriteState) => {
  state = updater(state);
  emit();
};

const coerceId = (id: string) => id.trim();

export const favoriteStore = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  reset: () => {
    state = {
      favoriteIds: new Set(),
      favoriteDogs: [],
      pendingIds: new Set(),
      initialized: false,
      loading: false,
    };
    emit();
  },
  setLoading: (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  },
  setInitialized: (initialized: boolean) => {
    setState((prev) => ({ ...prev, initialized }));
  },
  setFavorites: (dogs: LikedDog[]) => {
    setState(() => ({
      favoriteIds: new Set(dogs.map((dog) => coerceId(String(dog.dogId)))),
      favoriteDogs: dogs,
      pendingIds: new Set(),
      initialized: true,
      loading: false,
    }));
  },
  setFavorite: (id: string, active: boolean) => {
    const safeId = coerceId(id);
    setState((prev) => {
      const nextIds = new Set(prev.favoriteIds);
      if (active) {
        nextIds.add(safeId);
      } else {
        nextIds.delete(safeId);
      }

      let nextDogs = prev.favoriteDogs;
      if (active) {
        const alreadyIncluded = prev.favoriteDogs.some(
          (dog) => coerceId(String(dog.dogId)) === safeId
        );
        if (!alreadyIncluded) {
          const numericId = Number(safeId);
          if (!Number.isNaN(numericId)) {
            nextDogs = [...prev.favoriteDogs, { dogId: numericId }];
          }
        }
      } else {
        nextDogs = prev.favoriteDogs.filter((dog) => coerceId(String(dog.dogId)) !== safeId);
      }

      return {
        ...prev,
        favoriteIds: nextIds,
        favoriteDogs: nextDogs,
      };
    });
  },
  setPending: (id: string, pending: boolean) => {
    const safeId = coerceId(id);
    setState((prev) => {
      const nextPending = new Set(prev.pendingIds);
      if (pending) {
        nextPending.add(safeId);
      } else {
        nextPending.delete(safeId);
      }
      return { ...prev, pendingIds: nextPending };
    });
  },
};
