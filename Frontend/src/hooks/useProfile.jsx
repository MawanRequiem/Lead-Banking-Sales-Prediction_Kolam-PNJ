import { useCallback, useState } from 'react'

// Simple profile hook — returns a mock user and stub handlers.
export default function useProfile(initial = { name: 'MaskDuku', email: 'maskduku@example.com' }) {
  const [user, setUser] = useState(initial)

  const changeLanguage = useCallback((lang) => {
    // stub: replace with real implementation
    console.log('Change language to', lang)
  }, [])

  const changePassword = useCallback(() => {
    // stub: open change-password modal or route
    console.log('Open change password')
  }, [])

  const openPersonalInfo = useCallback(() => {
    // stub: navigate to profile page or open modal
    console.log('Open personal info')
  }, [])

  const openNotifications = useCallback(() => {
    // dispatch a custom event so NotificationButton or other listeners can react
    try {
      window.dispatchEvent(new CustomEvent('open-notifications'))
    } catch (e) {
      console.log('Open notifications error', e)
    }
  }, [])

  const logout = useCallback(() => {
    // stub: clear session, redirect
    console.log('Logout')
  }, [])

  return {
    user,
    setUser,
    changeLanguage,
    changePassword,
    openPersonalInfo,
    openNotifications,
    logout,
  }
}
