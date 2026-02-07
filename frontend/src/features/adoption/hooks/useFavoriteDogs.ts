import { useCallback, useEffect, useSyncExternalStore } from "react";
import { ApiError } from "@/shared/api/client";
import useAuth from "@/features/auth/hooks/useAuth";
import { getLikedDogs, likeDog, type LikedDog, unlikeDog } from "../api/likeApi";
import { favoriteStore } from "../store/favoriteStore";

const DEFAULT_ERROR_MESSAGE = "요청에 실패했습니다. 잠시 후 다시 시도해주세요.";

export function resolveFavoriteErrorMessage(err: unknown) {
  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 403) return "로그인이 필요합니다.";
    if (err.status === 404) return "대상을 찾을 수 없습니다.";
    if (err.status >= 500) return DEFAULT_ERROR_MESSAGE;
    const raw = err.message?.trim();
    return raw || DEFAULT_ERROR_MESSAGE;
  }
  return err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
}

type ToggleResult =
  | { status: "ok"; active: boolean }
  | { status: "unauthenticated" }
  | { status: "pending" }
  | { status: "error"; error: unknown; active: boolean };

export default function useFavoriteDogs() {
  const { user } = useAuth();
  const state = useSyncExternalStore(
    favoriteStore.subscribe,
    favoriteStore.getSnapshot,
    favoriteStore.getSnapshot
  );

  const refreshFavorites = useCallback(
    async (options?: { silent?: boolean }): Promise<LikedDog[]> => {
      const silent = options?.silent ?? false;
      if (!user) {
        favoriteStore.reset();
        return [];
      }

      if (!silent) {
        favoriteStore.setLoading(true);
      }
      try {
        const list = await getLikedDogs();
        favoriteStore.setFavorites(list);
        return list;
      } catch (err) {
        if (!silent) {
          favoriteStore.setLoading(false);
        }
        favoriteStore.setInitialized(true);
        throw err;
      }
    },
    [user]
  );

  useEffect(() => {
    if (!user) {
      if (state.initialized || state.favoriteIds.size > 0) {
        favoriteStore.reset();
      }
      return;
    }

    if (!state.initialized && !state.loading) {
      refreshFavorites().catch(() => {
        // Silent: UI can still allow toggling; errors are shown on action.
      });
    }
  }, [refreshFavorites, state.favoriteIds.size, state.initialized, state.loading, user]);

  const isFavorite = useCallback(
    (dogId: string | number) => state.favoriteIds.has(String(dogId)),
    [state.favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (dogId: string | number): Promise<ToggleResult> => {
      if (!user) return { status: "unauthenticated" };

      const id = String(dogId);
      if (state.pendingIds.has(id)) return { status: "pending" };

      const wasLiked = state.favoriteIds.has(id);
      favoriteStore.setPending(id, true);
      favoriteStore.setFavorite(id, !wasLiked);

      try {
        if (wasLiked) {
          await unlikeDog(id);
        } else {
          await likeDog(id);
        }
        refreshFavorites({ silent: true }).catch(() => {
          // Ignore background refresh errors.
        });
        return { status: "ok", active: !wasLiked };
      } catch (error) {
        favoriteStore.setFavorite(id, wasLiked);
        return { status: "error", error, active: wasLiked };
      } finally {
        favoriteStore.setPending(id, false);
      }
    },
    [refreshFavorites, state.favoriteIds, state.pendingIds, user]
  );

  return {
    favoriteIds: state.favoriteIds,
    favoriteDogs: state.favoriteDogs,
    pendingIds: state.pendingIds,
    initialized: state.initialized,
    loading: state.loading,
    refreshFavorites,
    toggleFavorite,
    isFavorite,
  };
}
