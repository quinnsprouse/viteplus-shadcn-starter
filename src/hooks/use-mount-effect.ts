import { useEffect } from "react";

/**
 * One-time setup on mount with explicit cleanup.
 * Use this instead of raw useEffect for external system sync.
 *
 * Return a cleanup whenever the effect starts a timer, listener, or subscription
 * (enforced by rodeo/mount-effect-cleanup).
 *
 * @see docs/agents/REACT_PATTERNS.md — Rule: no direct useEffect
 */
export function useMountEffect(effect: () => void | (() => void)) {
  // Intentionally runs once. The lint exceptions for this file live in vite.config.ts overrides.
  useEffect(effect, []);
}
