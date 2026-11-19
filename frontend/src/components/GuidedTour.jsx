
import { useEffect, useState } from 'react'
import { Joyride, ACTIONS, EVENTS, STATUS } from 'react-joyride'

const steps = [
  {
    target: '[data-tour="overview"]',
    title: 'Welcome to BrandGuard',
    content:
      'This is your command center. Access your workspace and manage your brand.',
    placement: 'right'
  },
  {
    target: '[data-tour="guidelines"]',
    title: 'Define Your Brand',
    content:
      'Create your brand guidelines, including tone, messaging, and identity rules.',
    placement: 'right'
  },
  {
    target: '[data-tour="reviews"]',
    title: 'AI Content Analysis',
    content:
      'Analyze content using Google Gemini and receive brand compliance feedback.',
    placement: 'right'
  },
  {
    target: '[data-tour="insights"]',
    title: 'Brand Insights',
    content:
      'Explore analysis results and understand your brand compliance performance.',
    placement: 'right'
  },
  {
    target: '[data-tour="members"]',
    title: 'Team Collaboration',
    content:
      'Invite team members and collaborate within your workspace.',
    placement: 'right'
  },
  {
    target: '[data-tour="settings"]',
    title: 'Workspace Settings',
    content:
      'Manage your workspace settings. You can restart this tour anytime.',
    placement: 'right'
  }
]

export default function GuidedTour({
  userId,
  workspaceId,
  restartSignal = 0,
  onRunningChange
}) {
  const [run, setRun] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const storageKey =
    `brandguard-tour-v1:${userId}:${workspaceId}`

  useEffect(() => {
    if (!userId || !workspaceId) return

    const completed =
      localStorage.getItem(storageKey) === 'completed'

    const shouldRun = !completed || restartSignal > 0

    setStepIndex(0)
    setRun(shouldRun)
    onRunningChange?.(shouldRun)
  }, [userId, workspaceId, restartSignal, storageKey])

  function handleCallback(data) {
    const { action, index, status, type } = data

    if (
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      action === ACTIONS.CLOSE
    ) {
      localStorage.setItem(storageKey, 'completed')
      setRun(false)
      onRunningChange?.(false)
      return
    }

    if (
      type === EVENTS.STEP_AFTER ||
      type === EVENTS.TARGET_NOT_FOUND
    ) {
      setStepIndex(
        Math.max(
          0,
          index + (action === ACTIONS.PREV ? -1 : 1)
        )
      )
    }
  }

  if (!userId || !workspaceId) return null

  return (
    <Joyride
      run={run}
      steps={steps}
      stepIndex={stepIndex}
      continuous
      onEvent={handleCallback}
      options={{
        buttons: ['back', 'skip', 'primary'],
        showProgress: true,
        skipBeacon: true,
        overlayClickAction: false,
        primaryColor: '#23724c',
        backgroundColor: '#f5f8f4',
        textColor: '#172b23',
        arrowColor: '#f5f8f4',
        overlayColor: 'rgba(0, 0, 0, 0.75)',
        spotlightPadding: 8,
        zIndex: 10000
      }}
      styles={{
        tooltip: {
          borderRadius: 16,
          padding: 20
        },
        buttonPrimary: {
          borderRadius: 8,
          fontWeight: 600
        },
        buttonBack: {
          color: '#23724c'
        }
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        next: 'Next',
        skip: 'Skip tour',
        last: 'Finish tour'
      }}
    />
  )
}
