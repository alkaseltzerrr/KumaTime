import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window
  const [permission, setPermission] = useState('default')
  
  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission)
    } else {
      setPermission('unsupported')
    }
  }, [isSupported])

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      return 'unsupported'
    }

    if (Notification.permission === 'default') {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    }

    setPermission(Notification.permission)
    return Notification.permission
  }, [isSupported])

  const showNotification = useCallback((title, options = {}) => {
    try {
      if (isSupported && permission === 'granted') {
        const notification = new Notification(title, {
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: 'kumatime-notification',
          renotify: true,
          ...options
        })
        
        // Auto-close notification after 5 seconds
        setTimeout(() => {
          notification.close()
        }, 5000)
        
        return notification
      } else {
        console.log('Notifications not available:', { 
          hasNotification: isSupported, 
          permission 
        })
      }
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
    return null
  }, [permission, isSupported])

  const value = {
    permission,
    requestPermission,
    showNotification,
    isSupported
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}