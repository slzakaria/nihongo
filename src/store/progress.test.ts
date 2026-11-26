import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/store/auth';
import { useProgressStore } from '@/store/progress';

describe('progress store offline queue', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, loaded: false });
    useProgressStore.setState({
      cards: {},
      scenarioProgress: {},
      pendingCardsByUser: {},
      pendingScenarioProgressByUser: {},
      pendingReviewEventsByUser: {},
      pendingStudyDaysByUser: {},
      pendingScenarioResetsByUser: {},
      flashcardProgressResetByUser: {},
    });
  });

  it('saves reviews locally and keeps the latest signed-in write queued', () => {
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: null,
        phone: null,
        createdAt: null,
        lastSignInAt: null,
      },
    });
    const store = useProgressStore.getState();
    store.initCard('gr-01');
    const initialWrite =
      useProgressStore.getState().pendingCardsByUser['user-1']['gr-01'];

    useProgressStore.getState().gradeCard('gr-01', 'good');
    const latestWrite = useProgressStore.getState().pendingCardsByUser['user-1']['gr-01'];

    expect(useProgressStore.getState().cards['gr-01']).toEqual(latestWrite.card);
    expect(latestWrite.card.lastReview).not.toBeNull();
    expect(latestWrite.operationId).not.toBe(initialWrite.operationId);
    expect(
      Object.keys(useProgressStore.getState().pendingStudyDaysByUser['user-1']),
    ).toHaveLength(1);
    expect(
      Object.values(useProgressStore.getState().pendingReviewEventsByUser['user-1']),
    ).toHaveLength(1);
    expect(
      Object.values(useProgressStore.getState().pendingReviewEventsByUser['user-1'])[0],
    ).toMatchObject({
      phraseId: 'gr-01',
      scenarioSlug: 'greetings',
      rating: 'good',
      reviewedAt: latestWrite.card.lastReview,
    });

    useProgressStore.getState().acknowledgeCards('user-1', [
      {
        phraseId: 'gr-01',
        operationId: initialWrite.operationId,
      },
    ]);
    expect(useProgressStore.getState().pendingCardsByUser['user-1']['gr-01']).toEqual(
      latestWrite,
    );
  });

  it('keeps guest progress local without creating account sync work', () => {
    useProgressStore.getState().initCard('gr-01');
    useProgressStore.getState().gradeCard('gr-01', 'good');

    expect(useProgressStore.getState().cards['gr-01'].lastReview).not.toBeNull();
    expect(useProgressStore.getState().pendingCardsByUser).toEqual({});
    expect(useProgressStore.getState().pendingReviewEventsByUser).toEqual({});
    expect(useProgressStore.getState().pendingStudyDaysByUser).toEqual({});
  });

  it('keeps scenario phrase exploration separate from flashcard reviews', () => {
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: null,
        phone: null,
        createdAt: null,
        lastSignInAt: null,
      },
    });
    useProgressStore.getState().initCard('gr-01');
    const originalCard = useProgressStore.getState().cards['gr-01'];
    const originalCardWrite =
      useProgressStore.getState().pendingCardsByUser['user-1']['gr-01'];

    useProgressStore.getState().markScenarioPhraseExplored('greetings', 'gr-01');

    expect(useProgressStore.getState().cards['gr-01']).toEqual(originalCard);
    expect(useProgressStore.getState().pendingCardsByUser['user-1']['gr-01']).toEqual(
      originalCardWrite,
    );
    expect(
      useProgressStore.getState().pendingScenarioProgressByUser['user-1']['gr-01'],
    ).toMatchObject({ scenarioSlug: 'greetings' });
    expect(useProgressStore.getState().getFlashcardCompletion('greetings')).toBe(0);
    expect(
      Object.keys(useProgressStore.getState().pendingStudyDaysByUser['user-1']),
    ).toHaveLength(1);
  });

  it('queues scenario resets and removes obsolete local card writes', () => {
    useAuthStore.setState({
      user: {
        id: 'user-1',
        email: null,
        phone: null,
        createdAt: null,
        lastSignInAt: null,
      },
    });
    useProgressStore.getState().initCard('gr-01');
    useProgressStore.getState().resetScenario('greetings');

    expect(useProgressStore.getState().cards['gr-01']).toBeUndefined();
    expect(
      useProgressStore.getState().pendingCardsByUser['user-1']['gr-01'],
    ).toBeUndefined();
    expect(
      useProgressStore.getState().pendingScenarioResetsByUser['user-1']['greetings'],
    ).toBeTruthy();
  });
});
