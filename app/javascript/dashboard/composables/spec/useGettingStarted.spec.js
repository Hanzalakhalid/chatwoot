import { ref } from 'vue';
import {
  useGettingStarted,
  GETTING_STARTED_DISMISSED_KEY,
} from '../useGettingStarted';
import { useStore, useStoreGetters } from 'dashboard/composables/store';
import { useUISettings } from 'dashboard/composables/useUISettings';

vi.mock('dashboard/composables/store');
vi.mock('dashboard/composables/useUISettings');
vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: key => key }),
}));

const buildGetters = ({
  inboxes = [],
  agents = [{ id: 1 }],
  teams = [],
  labels = [],
  cannedResponses = [],
} = {}) => ({
  'inboxes/getInboxes': ref(inboxes),
  'agents/getAgents': ref(agents),
  'teams/getTeams': ref(teams),
  'labels/getLabels': ref(labels),
  getCannedResponses: ref(cannedResponses),
});

describe('useGettingStarted', () => {
  let dispatch;
  let updateUISettings;
  let uiSettings;

  beforeEach(() => {
    dispatch = vi.fn();
    updateUISettings = vi.fn();
    uiSettings = ref({});
    useStore.mockReturnValue({ dispatch });
    useUISettings.mockReturnValue({ uiSettings, updateUISettings });
  });

  it('marks every step as pending for a brand new account', () => {
    useStoreGetters.mockReturnValue(buildGetters());

    const { steps, completedCount, totalCount, isComplete } =
      useGettingStarted();

    expect(steps.value.map(step => step.isDone)).toEqual([
      false,
      false,
      false,
      false,
      false,
    ]);
    expect(completedCount.value).toBe(0);
    expect(totalCount.value).toBe(5);
    expect(isComplete.value).toBe(false);
  });

  it('does not count the signed-up admin as an invited teammate', () => {
    useStoreGetters.mockReturnValue(buildGetters({ agents: [{ id: 1 }] }));

    const { steps } = useGettingStarted();
    const inviteStep = steps.value.find(step => step.key === 'INVITE_AGENT');

    expect(inviteStep.isDone).toBe(false);
  });

  it('marks steps done from the data already in the store', () => {
    useStoreGetters.mockReturnValue(
      buildGetters({
        inboxes: [{ id: 1 }],
        agents: [{ id: 1 }, { id: 2 }],
        labels: [{ id: 1 }],
      })
    );

    const { steps, completedCount } = useGettingStarted();
    const doneKeys = steps.value
      .filter(step => step.isDone)
      .map(step => step.key);

    expect(doneKeys).toEqual(['CONNECT_CHANNEL', 'INVITE_AGENT', 'ADD_LABELS']);
    expect(completedCount.value).toBe(3);
  });

  it('is complete once every step is done', () => {
    useStoreGetters.mockReturnValue(
      buildGetters({
        inboxes: [{ id: 1 }],
        agents: [{ id: 1 }, { id: 2 }],
        teams: [{ id: 1 }],
        labels: [{ id: 1 }],
        cannedResponses: [{ id: 1 }],
      })
    );

    const { isComplete } = useGettingStarted();

    expect(isComplete.value).toBe(true);
  });

  it('reads and stores the dismissed flag in UI settings', () => {
    useStoreGetters.mockReturnValue(buildGetters());

    const { isDismissed, dismiss } = useGettingStarted();
    expect(isDismissed.value).toBe(false);

    dismiss();
    expect(updateUISettings).toHaveBeenCalledWith({
      [GETTING_STARTED_DISMISSED_KEY]: true,
    });

    uiSettings.value = { [GETTING_STARTED_DISMISSED_KEY]: true };
    expect(isDismissed.value).toBe(true);
  });

  it('fetches agents and canned responses that the sidebar does not load', () => {
    useStoreGetters.mockReturnValue(buildGetters());

    const { fetchStepData } = useGettingStarted();
    fetchStepData();

    expect(dispatch).toHaveBeenCalledWith('agents/get');
    expect(dispatch).toHaveBeenCalledWith('getCannedResponse');
  });
});
