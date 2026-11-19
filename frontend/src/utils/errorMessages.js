
export function getFriendlyError(error, fallback = 'Something went wrong. Please try again.') {
  const message = String(error?.message || error || '').toLowerCase()
  const code = String(error?.code || '').toLowerCase()
  const status = Number(error?.status || error?.statusCode || 0)

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'You appear to be offline. Check your internet connection and try again.'
  }

  if (status === 429 || message.includes('rate limit') || message.includes('too many requests')) {
    return 'Too many requests. Please wait a moment before trying again.'
  }

  if (message.includes('invalid login credentials')) {
    return 'Incorrect email or password. Please try again.'
  }

  if (message.includes('email not confirmed')) {
    return 'Please verify your email address before signing in.'
  }

  if (message.includes('already registered') || message.includes('user already exists')) {
    return 'An account with this email already exists.'
  }

  if (status === 401 || message.includes('jwt expired') || message.includes('session expired')) {
    return 'Your session has expired. Please sign in again.'
  }

  if (status === 403 || code === '42501' || message.includes('permission denied')) {
    return "You don't have permission to perform this action."
  }

  if (status === 413 || message.includes('payload too large')) {
    return 'The uploaded file is too large. Please choose a smaller file.'
  }

  if (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network request failed') ||
    message.includes('timeout') ||
    message.includes('timed out')
  ) {
    return 'Unable to connect to the server. Please check your connection and try again.'
  }

  if (status >= 500 || message.includes('internal server error')) {
    return 'Our server encountered a problem. Please try again shortly.'
  }

  if (code === '23505') {
    return 'This record already exists. Please check your information.'
  }

  if (code === '23503') {
    return 'This action could not be completed because related information is missing.'
  }

  // Do not expose database details, stack traces or raw server errors.
  return fallback
}
