import { useCallback, useRef, useState } from "react"

import { HISTORY_LIMIT } from "@/editor/constants"

interface HistoryState<T> {
  past: T[]
  present: T
  future: T[]
}

export function useHistory<T>(initial: T) {
  const [state, setState] = useState<HistoryState<T>>({ past: [], present: initial, future: [] })
  const presentRef = useRef(initial)
  presentRef.current = state.present
  const snapshot = useRef<T | null>(null)

  const set = useCallback((next: T) => {
    setState((s) => ({
      past: [...s.past, s.present].slice(-HISTORY_LIMIT),
      present: next,
      future: [],
    }))
  }, [])

  const begin = useCallback(() => {
    snapshot.current = presentRef.current
  }, [])

  const preview = useCallback((next: T) => {
    setState((s) => ({ ...s, present: next }))
  }, [])

  const end = useCallback(() => {
    const before = snapshot.current
    snapshot.current = null
    if (before === null) return
    setState((s) =>
      s.present === before
        ? s
        : { past: [...s.past, before].slice(-HISTORY_LIMIT), present: s.present, future: [] },
    )
  }, [])

  const cancel = useCallback(() => {
    const before = snapshot.current
    snapshot.current = null
    if (before === null) return
    setState((s) => ({ ...s, present: before }))
  }, [])

  const undo = useCallback(() => {
    setState((s) => {
      if (s.past.length === 0) return s
      return {
        past: s.past.slice(0, -1),
        present: s.past[s.past.length - 1],
        future: [s.present, ...s.future],
      }
    })
  }, [])

  const redo = useCallback(() => {
    setState((s) => {
      if (s.future.length === 0) return s
      return { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) }
    })
  }, [])

  const reset = useCallback((value: T) => {
    snapshot.current = null
    setState({ past: [], present: value, future: [] })
  }, [])

  return {
    present: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    set,
    begin,
    preview,
    end,
    cancel,
    undo,
    redo,
    reset,
  }
}

export type History<T> = ReturnType<typeof useHistory<T>>
