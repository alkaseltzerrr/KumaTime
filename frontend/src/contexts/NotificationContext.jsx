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
  const [permission, setPermission] = useState('default')
  
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    }
    return Notification.permission
  }, [])

  const showNotification = useCallback((title, options = {}) => {
    try {
      if ('Notification' in window && permission === 'granted') {
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
          hasNotification: 'Notification' in window, 
          permission 
        })
      }
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
    return null
  }, [permission])

  const value = {
    permission,
    requestPermission,
    showNotification,
    isSupported: 'Notification' in window
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}