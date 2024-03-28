import type { ExperimentalPPRConfig } from '../../config-shared'

type PPRConfig = {
  /**
   * True if partial prerendering is enabled for this application. This does not
   * determine if the current page supports partial prerendering, only if the
   * feature is enabled for the application. To determine if the current page
   * supports partial prerendering, use `isSupported`.
   */
  readonly enabled: boolean

  /**
   * Returns true if the current page supports partial prerendering. This will
   * only return true if the feature is enabled for the application and the
   * current page is not excluded.
   */
  readonly isSupported: (page: string) => boolean
}

/**
 * Parse the experimental PPR configuration into a PPRConfig object.
 */
export function parsePPRConfig(
  config: ExperimentalPPRConfig | undefined
): PPRConfig {
  if (typeof config === 'undefined' || config === false) {
    return { enabled: false, isSupported: () => false }
  }

  if (config === true || typeof config.matcher === 'undefined') {
    return { enabled: true, isSupported: () => true }
  }

  // Compose the matcher function.
  const matcher =
    typeof config.matcher === 'string'
      ? [new RegExp(config.matcher)]
      : config.matcher.map((pattern) => new RegExp(pattern))

  // If the matcher is defined but empty, partial prerendering is disabled.
  if (matcher.length === 0) {
    return { enabled: false, isSupported: () => false }
  }

  return {
    enabled: true,
    isSupported: (page: string) => {
      // The page is supported if any of the patterns match.
      return matcher.some((pattern) => pattern.test(page))
    },
  }
}
