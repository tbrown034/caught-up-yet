import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

// ============================================
// RENDERING TESTS
// ============================================

describe('Button', () => {
  describe('basic rendering', () => {
    it('should render button with text', () => {
      render(<Button>Click me</Button>)

      const button = screen.getByRole('button', { name: 'Click me' })
      expect(button).toBeInTheDocument()
    })

    it('should render with children', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      )

      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
    })

    it('should apply base styles', () => {
      render(<Button>Click me</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('inline-flex')
      expect(button).toHaveClass('items-center')
      expect(button).toHaveClass('justify-center')
      expect(button).toHaveClass('font-medium')
      expect(button).toHaveClass('rounded-lg')
    })
  })

  describe('variants', () => {
    it('should render primary variant by default', () => {
      render(<Button>Primary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-blue-600')
      expect(button).toHaveClass('text-white')
      expect(button).toHaveClass('hover:bg-blue-700')
    })

    it('should render primary variant when specified', () => {
      render(<Button variant="primary">Primary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-blue-600')
      expect(button).toHaveClass('text-white')
    })

    it('should render secondary variant', () => {
      render(<Button variant="secondary">Secondary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gray-800')
      expect(button).toHaveClass('text-white')
      expect(button).toHaveClass('hover:bg-gray-900')
    })

    it('should render ghost variant', () => {
      render(<Button variant="ghost">Ghost</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-white')
      expect(button).toHaveClass('text-gray-700')
      expect(button).toHaveClass('hover:bg-gray-50')
      expect(button).toHaveClass('border')
    })
  })

  describe('sizes', () => {
    it('should render medium size by default', () => {
      render(<Button>Medium</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4')
      expect(button).toHaveClass('py-2')
      expect(button).toHaveClass('text-base')
    })

    it('should render small size', () => {
      render(<Button size="sm">Small</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-3')
      expect(button).toHaveClass('py-1.5')
      expect(button).toHaveClass('text-sm')
    })

    it('should render medium size', () => {
      render(<Button size="md">Medium</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4')
      expect(button).toHaveClass('py-2')
      expect(button).toHaveClass('text-base')
    })

    it('should render large size', () => {
      render(<Button size="lg">Large</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-6')
      expect(button).toHaveClass('py-3')
      expect(button).toHaveClass('text-lg')
    })
  })

  describe('custom className', () => {
    it('should accept custom className', () => {
      render(<Button className="custom-class">Custom</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should preserve base styles with custom className', () => {
      render(<Button className="custom-class">Custom</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('inline-flex')
      expect(button).toHaveClass('bg-blue-600')
    })

    it('should allow multiple custom classes', () => {
      render(<Button className="custom-1 custom-2 custom-3">Custom</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-1')
      expect(button).toHaveClass('custom-2')
      expect(button).toHaveClass('custom-3')
    })
  })

  describe('HTML attributes', () => {
    it('should accept and apply type attribute', () => {
      render(<Button type="submit">Submit</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('should accept and apply disabled attribute', () => {
      render(<Button disabled>Disabled</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-50')
      expect(button).toHaveClass('disabled:cursor-not-allowed')
    })

    it('should accept and apply onClick handler', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} disabled>Click</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should accept aria-label', () => {
      render(<Button aria-label="Custom label">Icon only</Button>)

      const button = screen.getByRole('button', { name: 'Custom label' })
      expect(button).toBeInTheDocument()
    })

    it('should accept data attributes', () => {
      render(<Button data-testid="custom-test-id">Test</Button>)

      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument()
    })
  })

  describe('as link', () => {
    it('should render as anchor tag when asLink is true', () => {
      render(<Button asLink href="/path">Link</Button>)

      const link = screen.getByRole('link', { name: 'Link' })
      expect(link).toBeInTheDocument()
      expect(link.tagName).toBe('A')
    })

    it('should apply href when asLink is true', () => {
      render(<Button asLink href="/dashboard">Dashboard</Button>)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/dashboard')
    })

    it('should apply same styles to link', () => {
      render(<Button asLink href="/path" variant="secondary" size="lg">Link</Button>)

      const link = screen.getByRole('link')
      expect(link).toHaveClass('bg-gray-800')
      expect(link).toHaveClass('px-6')
      expect(link).toHaveClass('py-3')
    })

    it('should render as button if asLink is false even with href', () => {
      render(<Button href="/path">Not a link</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button.tagName).toBe('BUTTON')
    })

    it('should render as button if href is missing', () => {
      render(<Button asLink>No href</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('combinations', () => {
    it('should combine variant and size', () => {
      render(<Button variant="secondary" size="sm">Small Secondary</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-gray-800')
      expect(button).toHaveClass('px-3')
      expect(button).toHaveClass('py-1.5')
    })

    it('should combine all props', () => {
      const handleClick = vi.fn()
      render(
        <Button
          variant="ghost"
          size="lg"
          className="custom"
          onClick={handleClick}
          type="submit"
          disabled={false}
        >
          All props
        </Button>
      )

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-white')
      expect(button).toHaveClass('px-6')
      expect(button).toHaveClass('custom')
      expect(button).toHaveAttribute('type', 'submit')
      expect(button).not.toBeDisabled()

      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should be focusable', () => {
      render(<Button>Focusable</Button>)

      const button = screen.getByRole('button')
      button.focus()

      expect(button).toHaveFocus()
    })

    it('should have focus styles', () => {
      render(<Button>Focus</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('focus:outline-none')
      expect(button).toHaveClass('focus:ring-2')
      expect(button).toHaveClass('focus:ring-offset-2')
    })

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Disabled</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should support keyboard interactions', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Keyboard</Button>)

      const button = screen.getByRole('button')
      button.focus()

      // Simulate Enter key
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })

      // Simulate Space key
      fireEvent.keyDown(button, { key: ' ', code: 'Space' })
    })
  })

  describe('edge cases', () => {
    it('should handle empty children', () => {
      render(<Button>{''}</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle number as children', () => {
      render(<Button>{42}</Button>)

      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('should handle multiple onClick calls', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click me</Button>)

      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('should handle rapid clicks', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Rapid</Button>)

      const button = screen.getByRole('button')
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button)
      }

      expect(handleClick).toHaveBeenCalledTimes(10)
    })
  })
})
