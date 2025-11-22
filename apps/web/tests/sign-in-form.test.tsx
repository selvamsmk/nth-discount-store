import React from 'react'
import { render } from 'vitest-browser-react'
import { vi, test, expect, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/auth-client', () => {
  const email = vi.fn((creds: any, handlers: any) => {
    if (handlers?.onSuccess) handlers.onSuccess()
  })
  return {
    authClient: {
      useSession: () => ({ isPending: false }),
      signIn: { email },
    },
  }
})

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => () => {},
}))

import SignInForm from '@/components/sign-in-form'

test('SignInForm submits credentials and calls authClient.signIn.email', async () => {
  const mocked = await vi.importMock<typeof import('@/lib/auth-client')>('@/lib/auth-client')
  const emailMock = mocked.authClient.signIn.email

  const { getByLabelText, getByRole } = await render(
    <SignInForm onSwitchToSignUp={() => {}} />,
  )

  await getByLabelText(/email/i).fill('test@example.com')
  await getByLabelText(/password/i).fill('password123')
  await getByRole('button', { name: /sign in/i }).click()

  expect(emailMock).toHaveBeenCalledTimes(1)
  expect(emailMock).toHaveBeenCalledWith(
    expect.objectContaining({ email: 'test@example.com', password: 'password123' }),
    expect.any(Object),
  )
})
