<script>
import { mapGetters } from 'vuex';
import { useAdmin } from 'dashboard/composables/useAdmin';
import { useGettingStarted } from 'dashboard/composables/useGettingStarted';
import GettingStartedChecklist from '../GettingStartedChecklist.vue';
import EmptyStateMessage from './EmptyStateMessage.vue';

export default {
  components: {
    GettingStartedChecklist,
    EmptyStateMessage,
  },
  props: {
    isOnExpandedLayout: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const { isAdmin } = useAdmin();
    const { isComplete: isSetupComplete, isDismissed: isChecklistDismissed } =
      useGettingStarted();

    return {
      isAdmin,
      isSetupComplete,
      isChecklistDismissed,
    };
  },
  computed: {
    ...mapGetters({
      currentChat: 'getSelectedChat',
      allConversations: 'getAllConversations',
      inboxesList: 'inboxes/getInboxes',
      uiFlags: 'inboxes/getUIFlags',
      loadingChatList: 'getChatListLoadingStatus',
    }),
    isLoading() {
      return this.uiFlags.isFetching || this.loadingChatList;
    },
    hasInboxes() {
      return this.inboxesList.length > 0;
    },
    showChecklist() {
      if (!this.isAdmin || this.isLoading) return false;
      // Without an inbox there is nothing else to show, so the checklist cannot be hidden.
      if (!this.hasInboxes) return true;
      return (
        !this.isOnExpandedLayout &&
        !this.isChecklistDismissed &&
        !this.isSetupComplete
      );
    },
    loadingIndicatorMessage() {
      if (this.uiFlags.isFetching) {
        return this.$t('CONVERSATION.LOADING_INBOXES');
      }
      return this.$t('CONVERSATION.LOADING_CONVERSATIONS');
    },
    conversationMissingMessage() {
      if (!this.isOnExpandedLayout) {
        return this.$t('CONVERSATION.SELECT_A_CONVERSATION');
      }
      return this.$t('CONVERSATION.404');
    },
    emptyClassName() {
      if (this.showChecklist) {
        return 'h-full overflow-auto w-full';
      }
      return 'flex-1 min-w-0 px-0 flex flex-col items-center justify-center h-full bg-n-surface-1';
    },
  },
};
</script>

<template>
  <div :class="emptyClassName">
    <woot-loading-state v-if="isLoading" :message="loadingIndicatorMessage" />
    <GettingStartedChecklist
      v-else-if="showChecklist"
      :can-dismiss="hasInboxes"
    />
    <EmptyStateMessage
      v-else-if="!hasInboxes"
      :message="$t('CONVERSATION.NO_INBOX_AGENT')"
    />
    <div v-else class="flex flex-col items-center justify-center h-full">
      <EmptyStateMessage
        v-if="!allConversations.length"
        :message="$t('CONVERSATION.NO_MESSAGE_1')"
      />
      <EmptyStateMessage
        v-else-if="allConversations.length && !currentChat.id"
        :message="conversationMissingMessage"
      />
    </div>
  </div>
</template>
