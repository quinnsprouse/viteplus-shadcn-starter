// oxlint-disable-next-line no-restricted-imports
import { useEffect } from "react";

/**
 * One-time setup on mount with explicit cleanup.
 * Use this instead of raw useEffect for external system sync.
 *
 * @see docs/agents/REACT_PATTERNS.md — Rule: no direct useEffect
 */
// oxlint-disable-next-line react-hooks/exhaustive-deps
export function useMountEffect(effect: () => void | (() => void)) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
}
