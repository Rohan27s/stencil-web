import { fireEvent, render, screen } from '@testing-library/react'
import FAQPage from './index'
import { vi } from 'vitest'
import { useUiConfig } from '@repo/hooks'

describe('FAQ component', () => {
  const config = useUiConfig('component', 'faqs')

  test('renders without crashing', () => {
    render(<FAQPage />)
    // Test that the component renders without crashing
  })

  test('displays "FAQ Title" text', () => {
    const { getByText } = render(<FAQPage />)
    const textElement = getByText(config.title ?? 'Faq')
    expect(textElement).toBeInTheDocument()
  })

  test('displays "Contact description" text', () => {
    const { getByText } = render(<FAQPage />)
    const textElement = getByText(
      config.contactDescriptionText ?? 'contact description'
    )
    expect(textElement).toBeInTheDocument()
  })

  test('renders contact button correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    render(<FAQPage />)
    const buttonElement = screen.getByText(config.contactText ?? 'Contact User')

    // Simulate a button click
    fireEvent.click(buttonElement)

    // Expect the console.log to be called with the expected value
    expect(consoleSpy).toHaveBeenCalledWith(
      config.contactText ?? 'Contact User'
    )
  })

  test('renders Manual User button correctly', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    render(<FAQPage />)
    const buttonElement = screen.getByText(
      config.userManualText ?? 'User Manual'
    )
    fireEvent.click(buttonElement)

    // Expect the console.log to be called with the expected value
    expect(consoleSpy).toHaveBeenCalledWith(
      config.userManualText ?? 'User Manual'
    )
  })
})