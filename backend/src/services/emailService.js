
async function sendInvitationEmail({ email, role, invitationLink, workspaceName }) {
  const apiKey = process.env.BREVO_API_KEY
  const senderEmail = process.env.BREVO_SENDER_EMAIL
  const senderName = process.env.BREVO_SENDER_NAME || 'Unwind BrandGuard'

  if (!apiKey || !senderEmail) {
    throw new Error('Brevo email configuration is incomplete.')
  }

  const safeEmail = String(email).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char])

  const safeRole = String(role).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char])

  const safeWorkspace = String(workspaceName || 'your workspace')
    .replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char])

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: {
        name: senderName,
        email: senderEmail
      },
      to: [
        {
          email: safeEmail
        }
      ],
      subject: `You're invited to join ${safeWorkspace} on Unwind BrandGuard`,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:32px;color:#172222;background:#f5f9f8;border-radius:12px;">
          <h2 style="color:#087f70;">Unwind BrandGuard</h2>
          <h3>You've been invited!</h3>
          <p>You have been invited to join <strong>${safeWorkspace}</strong>.</p>
          <p>Your assigned workspace role is <strong>${safeRole}</strong>.</p>
          <p>Accept your invitation using the button below:</p>
          <div style="margin:32px 0;">
            <a href="${invitationLink}" style="background:#087f70;color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:8px;font-weight:bold;">
              Accept Invitation
            </a>
          </div>
          <p style="font-size:13px;color:#667777;">
            This invitation expires in 7 days and can only be used once.
          </p>
          <p style="font-size:12px;color:#889999;">
            If you weren't expecting this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
      textContent: `You've been invited to join ${workspaceName || 'your workspace'} on Unwind BrandGuard.

Your assigned role is ${role}.

Accept your invitation here:
${invitationLink}

This invitation expires in 7 days and can only be used once.`
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Brevo email error (${response.status}): ${errorText}`)
  }

  return await response.json()
}

module.exports = { sendInvitationEmail }
