import { useEffect } from 'react'

/**
 * Brauzer yangilash / yopishda ogohlantirish.
 * Brauzer o'z dialopini ko'rsatadi (matnni o'zgartirish mumkin emas).
 */
export function useUnloadGuard(when: boolean) {
  useEffect(() => {
    if (!when) return

    function onBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [when])
}
