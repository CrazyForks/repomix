<template>
  <div class="container">
    <form class="try-it-container" @submit.prevent="handleSubmit">
      <div class="input-row">
        <div class="tab-container">
          <button
            type="button"
            :class="{ active: mode === 'url' }"
            @click="setMode('url')"
          >
            <Link2 size="20" class="icon" />
          </button>
          <button
            type="button"
            :class="{ active: mode === 'folder' }"
            @click="setMode('folder')"
          >
            <FolderOpen size="20" class="icon" />
          </button>
          <button
            type="button"
            :class="{ active: mode === 'file' }"
            @click="setMode('file')"
          >
            <FolderArchive size="20" class="icon" />
          </button>
        </div>

        <div class="input-field">
          <TryItFileUpload
            v-if="mode === 'file'"
            @upload="handleFileUpload"
            :loading="loading"
            :show-button="false"
          />
          <TryItFolderUpload
            v-else-if="mode === 'folder'"
            @upload="handleFileUpload"
            :loading="loading"
            :show-button="false"
          />
          <TryItUrlInput
            v-else
            v-model:url="inputUrl"
            :loading="loading"
            @keydown="handleKeydown"
            @submit="handleSubmit"
            :show-button="false"
          />
        </div>

        <div class="pack-button-wrapper">
          <PackButton
            :loading="loading"
            :isValid="isSubmitValid"
          />
        </div>
      </div>

      <TryItPackOptions
        v-model:format="packOptions.format"
        v-model:include-patterns="packOptions.includePatterns"
        v-model:ignore-patterns="packOptions.ignorePatterns"
        v-model:file-summary="packOptions.fileSummary"
        v-model:directory-structure="packOptions.directoryStructure"
        v-model:remove-comments="packOptions.removeComments"
        v-model:remove-empty-lines="packOptions.removeEmptyLines"
        v-model:show-line-numbers="packOptions.showLineNumbers"
        v-model:output-parsable="packOptions.outputParsable"
        v-model:compress="packOptions.compress"
      />

      <div v-if="hasExecuted">
        <TryItResult
          :result="result"
          :loading="loading"
          :error="error"
          :repository-url="inputRepositoryUrl"
        />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { FolderArchive, FolderOpen, Link2 } from 'lucide-vue-next';
import { nextTick, onMounted } from 'vue';
import { usePackRequest } from '../../composables/usePackRequest';
import { isValidRemoteValue } from '../utils/validation';
import PackButton from './PackButton.vue';
import TryItFileUpload from './TryItFileUpload.vue';
import TryItFolderUpload from './TryItFolderUpload.vue';
import TryItPackOptions from './TryItPackOptions.vue';
import TryItResult from './TryItResult.vue';
import TryItUrlInput from './TryItUrlInput.vue';

// Use composables for state management
const {
  // Pack options
  packOptions,

  // Input states
  inputUrl,
  inputRepositoryUrl,
  mode,
  uploadedFile,

  // Request states
  loading,
  error,
  result,
  hasExecuted,

  // Computed
  isSubmitValid,

  // Actions
  setMode,
  handleFileUpload,
  submitRequest,
} = usePackRequest();

async function handleSubmit() {
  await submitRequest();
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && mode.value === 'url' && isSubmitValid.value && !loading.value) {
    handleSubmit();
  }
}

// Add repository parameter handling when component mounts
onMounted(() => {
  // Get URL parameters from window location
  const urlParams = new URLSearchParams(window.location.search);
  const repoParam = urlParams.get('repo');

  // If repository parameter exists and is valid, set it and trigger packing
  if (repoParam) {
    inputUrl.value = repoParam.trim();

    // If the URL is valid, trigger the pack process
    if (isValidRemoteValue(repoParam.trim())) {
      // Use nextTick to ensure the URL is set before submission
      nextTick(() => {
        handleSubmit();
      });
    }
  }
});
</script>

<style scoped>
.container {
  padding: 0 20px;
  margin: 0 auto;
  max-width: 960px;
}

.try-it-container {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
  border-radius: 12px;
  padding: 24px;
}

.input-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  margin-bottom: 24px;
  align-items: start;
}

.tab-container {
  display: flex;
  flex-direction: row;
  width: 240px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--vp-c-border);
}

.tab-container button {
  flex: 1;
  height: 48px;
  padding: 0 16px;
  background: var(--vp-c-bg);
  cursor: pointer;
  font-size: 16px;
  white-space: nowrap;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.tab-container button:not(:first-child)::before {
  content: '';
  position: absolute;
  left: 0;
  top: 25%;
  height: 50%;
  width: 1px;
  background-color: var(--vp-c-border);
}

.tab-container button:first-child {
  border-radius: 8px 0 0 8px;
}

.tab-container button:last-child {
  border-radius: 0 8px 8px 0;
}

.tab-container button.active {
  background: var(--vp-c-brand-1);
  color: white;
}

.tab-container button.active::before {
  display: none;
}

.tab-container button.active + button::before {
  display: none;
}

.tab-container button .icon {
  color: var(--vp-c-text-1);
}

.tab-container button.active .icon {
  color: white;
}

.input-field {
  align-self: start;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.pack-button-wrapper {
  display: flex;
  align-items: stretch;
  align-self: start;
  flex-shrink: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .input-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .tab-container {
    width: 100%;
  }

  .pack-button-wrapper {
    width: 100%;
  }
}
</style>
