import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '@/store/auth';
import { useProgressStore } from '@/store/progress';

describe('progress store offline queue', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, loaded: false });
    useProgressStore.setState({
      cards: {},
      pendingCardsByUser: {},
      pendingStudyDaysByUser: {},
      pendingScenarioResetsByUser: {},
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

    useProgressStore.getState().gradeCard('gr-01', 4);
    const latestWrite = useProgressStore.getState().pendingCardsByUser['user-1']['gr-01'];

    expect(useProgressStore.getState().cards['gr-01']).toEqual(latestWrite.card);
    expect(latestWrite.card.lastReview).not.toBeNull();
    expect(latestWrite.operationId).not.toBe(initialWrite.operationId);
    expect(
      Object.keys(useProgressStore.getState().pendingStudyDaysByUser['user-1']),
    ).toHaveLength(1);

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
    useProgressStore.getState().gradeCard('gr-01', 4);

    expect(useProgressStore.getState().cards['gr-01'].lastReview).not.toBeNull();
    expect(useProgressStore.getState().pendingCardsByUser).toEqual({});
    expect(useProgressStore.getState().pendingStudyDaysByUser).toEqual({});
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
