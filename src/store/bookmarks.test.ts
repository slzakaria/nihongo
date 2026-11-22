import { beforeEach, describe, expect, it } from 'vitest';
import { useBookmarkStore } from '@/store/bookmarks';
import { useAuthStore } from '@/store/auth';

describe('bookmark store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, loaded: false });
    useBookmarkStore.setState({ phraseIds: [], pendingByUser: {} });
  });

  it('adds and removes a phrase bookmark', () => {
    useBookmarkStore.getState().toggleBookmark('greetings-hello');
    expect(useBookmarkStore.getState().phraseIds).toEqual(['greetings-hello']);

    useBookmarkStore.getState().toggleBookmark('greetings-hello');
    expect(useBookmarkStore.getState().phraseIds).toEqual([]);
  });

  it('merges bookmark IDs without duplicates', () => {
    useBookmarkStore
      .getState()
      .setPhraseIds(['greetings-hello', 'restaurant-water', 'greetings-hello']);
    expect(useBookmarkStore.getState().phraseIds).toEqual([
      'greetings-hello',
      'restaurant-water',
    ]);
  });

  it('keeps the latest signed-in bookmark intent queued until acknowledged', () => {
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: null,
        phone: null,
        createdAt: null,
        lastSignInAt: null,
      },
    });
    useBookmarkStore.getState().toggleBookmark('greetings-hello');
    const firstWrite =
      useBookmarkStore.getState().pendingByUser['user-1']['greetings-hello'];

    useBookmarkStore.getState().toggleBookmark('greetings-hello');
    const latestWrite =
      useBookmarkStore.getState().pendingByUser['user-1']['greetings-hello'];

    expect(latestWrite.isBookmarked).toBe(false);
    expect(latestWrite.operationId).not.toBe(firstWrite.operationId);

    useBookmarkStore.getState().acknowledge('user-1', [
      {
        phraseId: 'greetings-hello',
        operationId: firstWrite.operationId,
      },
    ]);

    expect(
      useBookmarkStore.getState().pendingByUser['user-1']['greetings-hello'],
    ).toEqual(latestWrite);
  });
});
