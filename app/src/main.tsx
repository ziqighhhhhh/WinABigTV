declare global {
  interface Window {
    __appBundleStarted?: boolean;
    __appMounted?: boolean;
    __showStartupError?: (message: unknown) => void;
  }
}

window.__appBundleStarted = true;

import('./app-entry')
  .then(({ mountApp }) => {
    mountApp();
    window.__appMounted = true;
  })
  .catch((error: unknown) => {
    const message =
      error instanceof Error ? error.stack || error.message : String(error);
    window.__showStartupError?.(message);
  });
