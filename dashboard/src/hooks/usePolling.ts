import { useState, useEffect, useCallback, useRef } from 'react'

export function usePolling<T>(
    fetcher: () => Promise<T>,
    intervalMs: number = 15000,
    deps: unknown[] = []
) {
    const [data, setData] = useState<T | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const load = useCallback(async () => {
        try {
            const result = await fetcher()
            setData(result)
            setError(null)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Unknown error')
        } finally {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    useEffect(() => {
        load()
        timerRef.current = setInterval(load, intervalMs)
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [load, intervalMs])

    return { data, loading, error, refresh: load }
}
