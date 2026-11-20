
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react'
import './feedback.css'

const ToastContext = createContext(null)

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const counter = useRef(0)
  const timers = useRef(new Map())

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setToasts(current => current.filter(item => item.id !== id))
  }, [])

  const notify = useCallback((type, message, title = '') => {
    const id = ++counter.current

    setToasts(current => [
      ...current.slice(-3),
      { id, type, title, message }
    ])

    const timeout = setTimeout(() => {
      dismiss(id)
    }, type === 'error' ? 8000 : 5000)

    timers.current.set(id, timeout)
    return id
  }, [dismiss])

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach(clearTimeout)
      activeTimers.clear()
    }
  }, [])

  const toast = {
    success: (message, title = 'Success') =>
      notify('success', message, title),
    error: (message, title = 'Something went wrong') =>
      notify('error', message, title),
    warning: (message, title = 'Attention needed') =>
      notify('warning', message, title),
    info: (message, title = 'Information') =>
      notify('info', message, title),
    dismiss
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      <div className="bg-toast-container" aria-label="Notifications">
        {toasts.map(item => {
          const Icon = icons[item.type]

          return (
            <div
              key={item.id}
              className={`bg-toast bg-toast-${item.type}`}
              role={item.type === 'error' ? 'alert' : 'status'}
            >
              <Icon className="bg-toast-icon" size={21} />

              <div className="bg-toast-content">
                <strong>{item.title}</strong>
                <p>{item.message}</p>
              </div>

              <button
                type="button"
                className="bg-toast-close"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
              >
                <X size={17} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }

  return context
}
