
import { AlertTriangle, RefreshCw } from 'lucide-react'
import './feedback.css'

export default function ErrorState({
  title = 'Unable to load this section',
  message = 'Something went wrong. Please try again.',
  onRetry,
  retrying = false
}) {
  return (
    <div className="bg-error-state" role="alert">
      <div className="bg-error-icon">
        <AlertTriangle size={26} />
      </div>

      <h2>{title}</h2>
      <p>{message}</p>

      {onRetry && (
        <button
          type="button"
          className="bg-retry-button"
          onClick={onRetry}
          disabled={retrying}
        >
          <RefreshCw size={16} className={retrying ? 'bg-spin' : ''} />
          {retrying ? 'Trying again...' : 'Try again'}
        </button>
      )}
    </div>
  )
}
