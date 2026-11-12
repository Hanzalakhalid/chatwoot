<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStoreGetters } from 'dashboard/composables/store';
import { useGettingStarted } from 'dashboard/composables/useGettingStarted';
import Button from 'dashboard/components-next/button/Button.vue';
import Icon from 'dashboard/components-next/icon/Icon.vue';

const props = defineProps({
  canDismiss: {
    type: Boolean,
    default: false,
  },
});

const getters = useStoreGetters();
const { t } = useI18n();
const { steps, completedCount, totalCount, fetchStepData, dismiss } =
  useGettingStarted();

const globalConfig = computed(() => getters['globalConfig/get'].value);
const currentUser = computed(() => getters.getCurrentUser.value);

const greetingMessage = computed(() => {
  const hours = new Date().getHours();
  let translationKey;
  if (hours < 12) {
    translationKey = 'ONBOARDING.GREETING_MORNING';
  } else if (hours < 18) {
    translationKey = 'ONBOARDING.GREETING_AFTERNOON';
  } else {
    translationKey = 'ONBOARDING.GREETING_EVENING';
  }
  return t(translationKey, {
    name: currentUser.value.name,
    installationName: globalConfig.value.installationName,
  });
});

// The first unfinished step is highlighted so the admin always knows what to do next.
const nextStepKey = computed(() => steps.value.find(step => !step.isDone)?.key);

onMounted(fetchStepData);
</script>

<template>
  <div class="w-full h-full overflow-auto bg-n-surface-1">
    <div class="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <p
          class="text-xl font-semibold text-n-slate-12 font-interDisplay tracking-[0.3px]"
        >
          {{ greetingMessage }}
        </p>
        <p class="text-base text-n-slate-11">
          {{ $t('ONBOARDING.CHECKLIST.DESCRIPTION') }}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex items-center justify-between text-sm">
          <span class="font-medium text-n-slate-12">
            {{ $t('ONBOARDING.CHECKLIST.TITLE') }}
          </span>
          <span class="text-n-slate-11">
            {{
              $t('ONBOARDING.CHECKLIST.PROGRESS', {
                completed: completedCount,
                total: totalCount,
              })
            }}
          </span>
        </div>
        <div class="flex gap-1">
          <div
            v-for="step in steps"
            :key="step.key"
            class="h-1.5 flex-1 rounded-full transition-colors duration-300"
            :class="step.isDone ? 'bg-n-brand' : 'bg-n-alpha-2'"
          />
        </div>
      </div>

      <ol class="flex flex-col gap-3 list-none m-0 p-0">
        <li
          v-for="(step, index) in steps"
          :key="step.key"
          class="flex items-start gap-4 p-4 rounded-xl border"
          :class="
            step.key === nextStepKey
              ? 'border-n-brand bg-n-surface-2'
              : 'border-n-weak bg-n-surface-1'
          "
        >
          <div
            class="flex items-center justify-center flex-shrink-0 rounded-full size-8 text-sm font-semibold"
            :class="
              step.isDone
                ? 'bg-n-teal-9 text-white'
                : 'bg-n-alpha-2 text-n-slate-11'
            "
          >
            <Icon v-if="step.isDone" icon="i-lucide-check" class="size-4" />
            <span v-else>{{ index + 1 }}</span>
          </div>

          <div class="flex flex-col flex-1 min-w-0 gap-1">
            <div class="flex items-center gap-2">
              <Icon :icon="step.icon" class="size-4 text-n-slate-11" />
              <p
                class="mb-0 text-sm font-medium"
                :class="
                  step.isDone
                    ? 'text-n-slate-11 line-through'
                    : 'text-n-slate-12'
                "
              >
                {{ step.title }}
              </p>
            </div>
            <p class="mb-0 text-sm text-n-slate-11">
              {{ step.description }}
            </p>
          </div>

          <router-link v-if="!step.isDone" :to="{ name: step.route }">
            <Button
              :label="step.actionLabel"
              size="sm"
              :variant="step.key === nextStepKey ? 'solid' : 'faded'"
              :color="step.key === nextStepKey ? 'blue' : 'slate'"
            />
          </router-link>
        </li>
      </ol>

      <div v-if="props.canDismiss" class="flex justify-center">
        <Button
          :label="$t('ONBOARDING.CHECKLIST.DISMISS')"
          size="sm"
          variant="link"
          color="slate"
          @click="dismiss"
        />
      </div>
    </div>
  </div>
</template>
