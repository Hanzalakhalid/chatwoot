import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore, useStoreGetters } from 'dashboard/composables/store';
import { useUISettings } from 'dashboard/composables/useUISettings';

export const GETTING_STARTED_DISMISSED_KEY = 'getting_started_dismissed';

/**
 * Tracks the setup steps a new admin should complete to start talking to
 * customers. Each step is marked done from data already in the store, so the
 * checklist updates on its own as the admin works through the settings pages.
 */
export function useGettingStarted() {
  const { t } = useI18n();
  const store = useStore();
  const getters = useStoreGetters();
  const { uiSettings, updateUISettings } = useUISettings();

  const inboxes = computed(() => getters['inboxes/getInboxes'].value);
  const agents = computed(() => getters['agents/getAgents'].value);
  const teams = computed(() => getters['teams/getTeams'].value);
  const labels = computed(() => getters['labels/getLabels'].value);
  const cannedResponses = computed(() => getters.getCannedResponses.value);

  const steps = computed(() => [
    {
      key: 'CONNECT_CHANNEL',
      title: t('ONBOARDING.CHECKLIST.STEPS.CONNECT_CHANNEL.TITLE'),
      description: t('ONBOARDING.CHECKLIST.STEPS.CONNECT_CHANNEL.DESCRIPTION'),
      actionLabel: t('ONBOARDING.CHECKLIST.STEPS.CONNECT_CHANNEL.ACTION'),
      icon: 'i-lucide-inbox',
      route: 'settings_inbox_new',
      isDone: inboxes.value.length > 0,
    },
    {
      key: 'INVITE_AGENT',
      title: t('ONBOARDING.CHECKLIST.STEPS.INVITE_AGENT.TITLE'),
      description: t('ONBOARDING.CHECKLIST.STEPS.INVITE_AGENT.DESCRIPTION'),
      actionLabel: t('ONBOARDING.CHECKLIST.STEPS.INVITE_AGENT.ACTION'),
      icon: 'i-lucide-user-plus',
      route: 'agent_list',
      // The admin who signed up is always in the list, so one more means a teammate joined.
      isDone: agents.value.length > 1,
    },
    {
      key: 'CREATE_TEAM',
      title: t('ONBOARDING.CHECKLIST.STEPS.CREATE_TEAM.TITLE'),
      description: t('ONBOARDING.CHECKLIST.STEPS.CREATE_TEAM.DESCRIPTION'),
      actionLabel: t('ONBOARDING.CHECKLIST.STEPS.CREATE_TEAM.ACTION'),
      icon: 'i-lucide-users',
      route: 'settings_teams_new',
      isDone: teams.value.length > 0,
    },
    {
      key: 'ADD_LABELS',
      title: t('ONBOARDING.CHECKLIST.STEPS.ADD_LABELS.TITLE'),
      description: t('ONBOARDING.CHECKLIST.STEPS.ADD_LABELS.DESCRIPTION'),
      actionLabel: t('ONBOARDING.CHECKLIST.STEPS.ADD_LABELS.ACTION'),
      icon: 'i-lucide-tag',
      route: 'labels_list',
      isDone: labels.value.length > 0,
    },
    {
      key: 'ADD_CANNED_RESPONSE',
      title: t('ONBOARDING.CHECKLIST.STEPS.ADD_CANNED_RESPONSE.TITLE'),
      description: t(
        'ONBOARDING.CHECKLIST.STEPS.ADD_CANNED_RESPONSE.DESCRIPTION'
      ),
      actionLabel: t('ONBOARDING.CHECKLIST.STEPS.ADD_CANNED_RESPONSE.ACTION'),
      icon: 'i-lucide-message-square-text',
      route: 'canned_list',
      isDone: cannedResponses.value.length > 0,
    },
  ]);

  const completedCount = computed(
    () => steps.value.filter(step => step.isDone).length
  );
  const totalCount = computed(() => steps.value.length);
  const isComplete = computed(() => completedCount.value === totalCount.value);
  const isDismissed = computed(
    () => uiSettings.value[GETTING_STARTED_DISMISSED_KEY] === true
  );

  const fetchStepData = () => {
    // Inboxes, teams and labels are already loaded by the sidebar.
    store.dispatch('agents/get');
    store.dispatch('getCannedResponse');
  };

  const dismiss = () => {
    updateUISettings({ [GETTING_STARTED_DISMISSED_KEY]: true });
  };

  return {
    steps,
    completedCount,
    totalCount,
    isComplete,
    isDismissed,
    fetchStepData,
    dismiss,
  };
}
