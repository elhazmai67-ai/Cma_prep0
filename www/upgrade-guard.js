'use strict';
// Keep an exact, one-time copy before any feature can write to the existing key.
(() => {
  const key = window.CMA_BUILD?.android ? 'cma-prep-android-v1' : 'cma-prep-studio-demo-v1';
  const status = { key, backupKey: key + '-before-upgrade-2', blocked: false, message: '' };
  window.CMA_UPGRADE = status;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data?.levels || !['inter', 'final'].includes(data.level) ||
        !Array.isArray(data.levels.inter?.subjects) || !Array.isArray(data.levels.final?.subjects)) {
      throw Error('Your saved data could not be opened safely.');
    }
    if (data.upgradeVersion !== 2 && !localStorage.getItem(status.backupKey)) {
      localStorage.setItem(status.backupKey, raw);
    }
  } catch (error) {
    status.blocked = true;
    status.message = 'Your existing data has been kept unchanged. Export it before restoring a backup or freeing device storage.';
  }
})();
