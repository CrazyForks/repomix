import { onBeforeUnmount, ref } from 'vue';
import { loadTurnstileScript, type TurnstileGlobal } from './useTurnstileScript';

// Cloudflare Turnstile integration. Used by usePackRequest to obtain a 1-shot
// verification token that the server-side turnstileMiddleware verifies before
// running /api/pack.
//
// The script-loading mechanics (script tag injection, READY_CALLBACK,
// retry-on-failure) live in `useTurnstileScript.ts` so this file stays
// focused on widget lifecycle / token requests / abort propagation.
//
// Site key resolution:
// - Build-time env var `VITE_TURNSTILE_SITE_KEY` overrides the default
//   (used for production / staging deploys via VitePress build env).
// - The fall-through is Cloudflare's "always-passes" test key
//   (`1x00000000000000000000AA`) so local dev and contributor builds work
//   without any setup. Using the test key in production would silently let all
//   tokens through — pair the deploy with the matching test secret on the
//   server, or set both to real values together.
const FALLBACK_TEST_SITE_KEY = '1x00000000000000000000AA';

// Upper bound on how long the widget callback can take. Cloudflare's
// `timeout-callback` only fires for interactive challenges, so an invisible
// widget that hangs (CDN stall, iframe never resolves) would otherwise leave
// the caller's promise pending forever and freeze the loading spinner.
const MINT_TIMEOUT_MS = 15_000;

// Cached tokens are treated as expired before Cloudflare's hard 300s ceiling,
// to leave a safety margin for clock skew and network round-trips. A user
// who starts a pack just inside the window won't get a `timeout-or-duplicate`
// from siteverify because they were 1 second from the cliff.
const TOKEN_TTL_MS = 240_000;

interface CachedToken {
  token: string;
  mintedAt: number;
  consumed: boolean;
}

export function useTurnstile() {
  const widgetId = ref<string | null>(null);
  const containerEl = ref<HTMLElement | null>(null);
  const error = ref<string | null>(null);

  // Resolved when the next widget callback produces a token. Reassigned on
  // every mint so back-to-back submits don't share state.
  let pendingResolve: ((token: string) => void) | null = null;
  let pendingReject: ((error: Error) => void) | null = null;
  // Monotonic generation counter. Each mintToken() call captures a local
  // copy and the timeout/callback closures verify it before mutating shared
  // state. This neutralises three otherwise-leaky scenarios:
  //  - a stale timeout from a previous mint clearing the next call's pending
  //    handlers,
  //  - a delayed widget callback resolving a later request with a stale
  //    token,
  //  - back-to-back mints reusing handlers before the previous timeout has
  //    fired.
  let currentGen = 0;

  // Pre-mint cache. `mintPromise` is the in-flight challenge; `cachedToken`
  // is the resolved token waiting to be consumed. Both clear on consumption,
  // expiry, error, and component unmount.
  let mintPromise: Promise<string> | null = null;
  let cachedToken: CachedToken | null = null;

  // Site key resolution. The production-only safety net lives in
  // `.vitepress/config.ts` (it throws at build time when the Cloudflare Pages
  // production deploy is missing VITE_TURNSTILE_SITE_KEY). We deliberately do
  // *not* duplicate that check here with `import.meta.env.PROD`, because PROD
  // is true for all `vitepress build` outputs — CF Pages preview deploys,
  // local `docs:build`, and CI builds all set PROD=true and are documented to
  // fall through to the test sitekey. Adding a runtime throw scoped to PROD
  // would crash the form in those non-production environments.
  //
  // Defense in depth: the server-side middleware fail-closes when it has a
  // real TURNSTILE_SECRET_KEY but receives a token issued by the test
  // sitekey (action/hostname mismatch), so an actual production deploy that
  // somehow shipped the test sitekey would still 403 every pack.
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY ?? FALLBACK_TEST_SITE_KEY;

  // Single-flight cache for the in-flight ensureWidget promise. Shared by
  // every code path that needs the widget (preMintToken, click-time mint),
  // so concurrent calls can't both pass the `widgetId.value` null check
  // after `await loadTurnstileScript()` resolves and call `turnstile.render()`
  // twice — the first widget id would be overwritten and leak.
  let ensureWidgetPromise: Promise<TurnstileGlobal> | null = null;

  async function ensureWidget(el: HTMLElement): Promise<TurnstileGlobal> {
    if (ensureWidgetPromise) return ensureWidgetPromise;
    ensureWidgetPromise = (async () => {
      const turnstile = await loadTurnstileScript();
      // The component may have unmounted (or the user may have switched away
      // from the form) while the script was loading. Detached DOM elements
      // accept render() but the corresponding remove() in onBeforeUnmount has
      // already run, so the widget would leak. Bail out instead.
      if (containerEl.value !== el) {
        throw new Error('Turnstile container detached during script load');
      }
      if (!widgetId.value) {
        widgetId.value = turnstile.render(el, {
          sitekey: siteKey,
          size: 'invisible',
          action: 'pack',
          execution: 'execute',
          callback: (token: string) => {
            if (pendingResolve) {
              pendingResolve(token);
              pendingResolve = null;
              pendingReject = null;
            }
          },
          'error-callback': (errorCode: string) => {
            const message = `Turnstile error: ${errorCode}`;
            error.value = message;
            if (pendingReject) {
              pendingReject(new Error(message));
              pendingResolve = null;
              pendingReject = null;
            }
          },
          'expired-callback': () => {
            // Token expired before being used. Drop the cache so the next
            // takeToken() refreshes; the widget will issue a fresh token on
            // the next execute() call.
            cachedToken = null;
            if (widgetId.value) turnstile.reset(widgetId.value);
          },
          'timeout-callback': () => {
            if (pendingReject) {
              pendingReject(new Error('Turnstile challenge timed out'));
              pendingResolve = null;
              pendingReject = null;
            }
          },
        });
      }
      return turnstile;
    })();
    try {
      return await ensureWidgetPromise;
    } catch (err) {
      // Drop the cached promise on rejection so a retry (e.g. after a CDN
      // blip cleared by useTurnstileScript's resetForRetry) can re-enter the
      // render path. On success we keep the resolved promise cached: the
      // widgetId guard above turns subsequent calls into a no-op anyway, but
      // returning the same promise avoids a duplicate `loadTurnstileScript()`
      // round-trip in the cached-success case.
      ensureWidgetPromise = null;
      throw err;
    }
  }

  // Run the widget challenge and return a fresh token. Internal primitive
  // shared by preMintToken (background) and takeToken (click-path fallback).
  // The optional `signal` aborts the challenge mid-flight when the surrounding
  // pack request is cancelled — without it, a hung Turnstile iframe would
  // block the cancel response for up to MINT_TIMEOUT_MS.
  async function mintToken(signal?: AbortSignal): Promise<string> {
    error.value = null;
    const checkAborted = () => {
      if (signal?.aborted) throw new Error('Turnstile challenge aborted');
    };
    checkAborted();
    if (!containerEl.value) {
      throw new Error('Turnstile container element not registered');
    }
    // Race the script-load step against the caller's abort signal so a
    // user-initiated cancel during a slow script load (CDN stall, ad
    // blocker, network blip) doesn't have to wait for MINT_TIMEOUT_MS.
    const widgetPromise = ensureWidget(containerEl.value);
    const turnstile = signal
      ? await Promise.race([
          widgetPromise,
          new Promise<never>((_, reject) => {
            const onPreAbort = () => reject(new Error('Turnstile challenge aborted'));
            if (signal.aborted) onPreAbort();
            else signal.addEventListener('abort', onPreAbort, { once: true });
          }),
        ])
      : await widgetPromise;
    checkAborted();
    if (!widgetId.value) {
      throw new Error('Turnstile widget failed to render');
    }

    // Supersede any in-flight request: reject the previous caller before we
    // overwrite pendingResolve/pendingReject below.
    if (pendingReject) {
      pendingReject(new Error('Superseded by new Turnstile request'));
      pendingResolve = null;
      pendingReject = null;
    }

    const myGen = ++currentGen;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let onAbort: (() => void) | undefined;

    const tokenPromise = new Promise<string>((resolve, reject) => {
      // Wrap in gen-checked closures so a delayed widget callback can't
      // resolve a later request with a stale token, and the timeout below
      // clears handlers only if no fresher request has taken over.
      pendingResolve = (token) => {
        if (myGen !== currentGen) return;
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        if (onAbort && signal) signal.removeEventListener('abort', onAbort);
        pendingResolve = null;
        pendingReject = null;
        resolve(token);
      };
      pendingReject = (err) => {
        if (myGen !== currentGen) return;
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        if (onAbort && signal) signal.removeEventListener('abort', onAbort);
        pendingResolve = null;
        pendingReject = null;
        reject(err);
      };
      // Tokens are 1-shot, so reset() before each execute() to clear any
      // stale challenge state inside the widget itself.
      if (widgetId.value) turnstile.reset(widgetId.value);
      if (widgetId.value) turnstile.execute(widgetId.value);
    });

    if (signal) {
      onAbort = () => {
        if (pendingReject) pendingReject(new Error('Turnstile challenge aborted'));
      };
      signal.addEventListener('abort', onAbort, { once: true });
    }

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        if (myGen !== currentGen) return;
        if (onAbort && signal) signal.removeEventListener('abort', onAbort);
        pendingResolve = null;
        pendingReject = null;
        reject(new Error('Turnstile challenge timed out'));
      }, MINT_TIMEOUT_MS);
    });
    return Promise.race([tokenPromise, timeoutPromise]);
  }

  // Single in-flight mint, shared by both pre-mint (background) and
  // takeToken (click path). Without this sharing, a debounced pre-mint
  // that fires while the user has already clicked Pack would call
  // `turnstile.execute()` a second time on the same widget, the
  // generation-counter supersede logic in mintToken() would reject the
  // first call as "Superseded", and the user-initiated submit would
  // surface a `Verification failed` error despite a perfectly valid
  // challenge being in flight.
  //
  // The signal is intentionally not threaded into the shared mint — pre-
  // mint is unaware of any submit lifecycle. takeToken() races the
  // shared promise against the caller's signal so a click-then-cancel
  // unblocks the awaiter without aborting the underlying mint, leaving
  // the resolved token in the cache for the next submit.
  function startMint(): Promise<string> {
    if (mintPromise) return mintPromise;
    mintPromise = mintToken()
      .then((token) => {
        cachedToken = { token, mintedAt: Date.now(), consumed: false };
        return token;
      })
      .catch((err) => {
        // Don't cache failures — let the next takeToken/preMintToken retry.
        cachedToken = null;
        throw err;
      })
      .finally(() => {
        mintPromise = null;
      });
    // Swallow rejections at the boundary so an unawaited preMintToken() (the
    // common case) doesn't trigger an unhandled rejection in the console.
    mintPromise.catch(() => {
      /* surfaces on the actual submit path via takeToken */
    });
    return mintPromise;
  }

  // Background pre-mint: kicks off a challenge and stashes the resulting
  // token for the next takeToken() to consume synchronously. Idempotent —
  // if a mint is already in flight or a fresh token is cached, no extra
  // work is done.
  function preMintToken(): Promise<string> {
    if (cachedToken && !cachedToken.consumed && !isExpired(cachedToken)) {
      return Promise.resolve(cachedToken.token);
    }
    return startMint();
  }

  // Drop any cached token without minting a new one. Called explicitly by
  // usePackRequest after a token has been handed to a submit so the same
  // token can never be reused, regardless of how the request resolved.
  function invalidateCache(): void {
    cachedToken = null;
  }

  function isExpired(entry: CachedToken): boolean {
    return Date.now() - entry.mintedAt > TOKEN_TTL_MS;
  }

  // Acquire a token for an immediate /api/pack submission. Order of
  // preference:
  //   1. Fresh, unconsumed cache from a recent preMintToken() — instant.
  //   2. In-flight mint (own or pre-mint's) — await the shared promise,
  //      racing against the caller's abort signal so a cancel unblocks
  //      the awaiter without killing the underlying mint.
  //   3. Cold path — start a new shared mint via startMint().
  //
  // The returned token is marked consumed before this function returns,
  // so double-clicks can't replay the same token (Cloudflare siteverify
  // would reject it as `timeout-or-duplicate` anyway, but consuming on
  // the client side avoids the wasted server round-trip).
  async function takeToken(signal?: AbortSignal): Promise<string> {
    if (cachedToken && !cachedToken.consumed && !isExpired(cachedToken)) {
      const token = cachedToken.token;
      cachedToken = null;
      return token;
    }
    const sharedMint = startMint();
    const token = await waitWithAbort(sharedMint, signal);
    // The mint resolved into the cache via startMint's `.then`; drop the
    // cache here so a concurrent takeToken (or a follow-up preMintToken)
    // doesn't hand out the same token twice.
    cachedToken = null;
    return token;
  }

  // Race a promise against an AbortSignal. Used by takeToken so a user-
  // initiated cancel unblocks the await without cancelling the shared
  // mint behind it (which may still cache its token for the next submit).
  function waitWithAbort<T>(promise: Promise<T>, signal: AbortSignal | undefined): Promise<T> {
    if (!signal) return promise;
    if (signal.aborted) {
      return Promise.reject(new Error('Turnstile challenge aborted'));
    }
    return new Promise<T>((resolve, reject) => {
      const onAbort = () => reject(new Error('Turnstile challenge aborted'));
      signal.addEventListener('abort', onAbort, { once: true });
      promise.then(
        (value) => {
          signal.removeEventListener('abort', onAbort);
          resolve(value);
        },
        (err) => {
          signal.removeEventListener('abort', onAbort);
          reject(err);
        },
      );
    });
  }

  function setContainer(el: HTMLElement | null) {
    containerEl.value = el;
    // Intentionally do NOT pre-warm the script here. Production telemetry
    // (PR #1541 follow-up) showed that simply loading api.js inflates the
    // Cloudflare dashboard's "challenge issued" counter to roughly the
    // page-view count, regardless of whether `render()` is ever called.
    // Pre-warm now happens only when usePackRequest sees a real intent
    // signal (valid input + user interaction), which gates both the script
    // load and the challenge to visitors who actually plan to submit.
  }

  onBeforeUnmount(() => {
    // Drop the container ref first so any in-flight pre-warm `ensureWidget()`
    // call that resolves AFTER unmount sees `containerEl.value !== el` and
    // skips render(). Without this, a slow script load could complete after
    // the form was unmounted and bind a new widget to a detached DOM node
    // with no remove() left to clean it up.
    containerEl.value = null;
    // Reject any in-flight mint so the awaiting caller doesn't hang forever
    // after the form unmounts (e.g. user navigates away mid-challenge).
    if (pendingReject) {
      pendingReject(new Error('Turnstile widget unmounted'));
      pendingResolve = null;
      pendingReject = null;
    }
    cachedToken = null;
    mintPromise = null;
    if (widgetId.value && window.turnstile) {
      window.turnstile.remove(widgetId.value);
      widgetId.value = null;
    }
  });

  return {
    setContainer,
    preMintToken,
    takeToken,
    invalidateCache,
    error,
  };
}
