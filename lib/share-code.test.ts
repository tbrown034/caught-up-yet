import { describe, it, expect, vi } from 'vitest'
import {
  generateShareCode,
  isValidShareCode,
  normalizeShareCode,
  formatShareCode,
} from './share-code'

// ============================================
// SHARE CODE GENERATION TESTS
// ============================================

describe('generateShareCode', () => {
  it('should generate a 6-character code', () => {
    const code = generateShareCode()
    expect(code.length).toBe(6)
  })

  it('should only use allowed characters (no I, O, 0, 1)', () => {
    const allowedChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

    // Generate multiple codes to test randomness
    for (let i = 0; i < 100; i++) {
      const code = generateShareCode()

      // Each character should be in the allowed set
      for (const char of code) {
        expect(allowedChars).toContain(char)
      }

      // Should not contain confusing characters
      expect(code).not.toMatch(/[IO01]/)
    }
  })

  it('should generate uppercase codes', () => {
    for (let i = 0; i < 20; i++) {
      const code = generateShareCode()
      expect(code).toBe(code.toUpperCase())
    }
  })

  it('should generate different codes (randomness)', () => {
    const codes = new Set()

    // Generate 100 codes
    for (let i = 0; i < 100; i++) {
      codes.add(generateShareCode())
    }

    // Should have generated many unique codes (allow for some collisions)
    expect(codes.size).toBeGreaterThan(95)
  })

  it('should only use alphanumeric characters', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateShareCode()
      expect(code).toMatch(/^[A-Z0-9]{6}$/)
    }
  })
})

// ============================================
// SHARE CODE VALIDATION TESTS
// ============================================

describe('isValidShareCode', () => {
  describe('valid codes', () => {
    it('should accept valid 6-character uppercase codes', () => {
      expect(isValidShareCode('BEARS7')).toBe(true)
      expect(isValidShareCode('PACK3R')).toBe(true)
      expect(isValidShareCode('ABCDEF')).toBe(true)
      expect(isValidShareCode('123456')).toBe(true)
      expect(isValidShareCode('A1B2C3')).toBe(true)
    })

    it('should accept codes with numbers', () => {
      expect(isValidShareCode('ABC123')).toBe(true)
      expect(isValidShareCode('999999')).toBe(true)
    })

    it('should accept codes with only letters', () => {
      expect(isValidShareCode('ABCDEF')).toBe(true)
      expect(isValidShareCode('SPORTS')).toBe(true)
    })
  })

  describe('invalid codes - length', () => {
    it('should reject codes shorter than 6 characters', () => {
      expect(isValidShareCode('ABC')).toBe(false)
      expect(isValidShareCode('A1')).toBe(false)
      expect(isValidShareCode('12345')).toBe(false)
      expect(isValidShareCode('')).toBe(false)
    })

    it('should reject codes longer than 6 characters', () => {
      expect(isValidShareCode('ABCDEFG')).toBe(false)
      expect(isValidShareCode('1234567')).toBe(false)
      expect(isValidShareCode('TOOLONG9')).toBe(false)
    })
  })

  describe('invalid codes - format', () => {
    it('should reject lowercase codes', () => {
      expect(isValidShareCode('abcdef')).toBe(false)
      expect(isValidShareCode('abc123')).toBe(false)
      expect(isValidShareCode('AbCdEf')).toBe(false)
    })

    it('should reject codes with special characters', () => {
      expect(isValidShareCode('ABC-EF')).toBe(false)
      expect(isValidShareCode('ABC_EF')).toBe(false)
      expect(isValidShareCode('ABC EF')).toBe(false)
      expect(isValidShareCode('ABC@EF')).toBe(false)
      expect(isValidShareCode('ABC!23')).toBe(false)
    })

    it('should reject codes with spaces', () => {
      expect(isValidShareCode(' ABCDE')).toBe(false)
      expect(isValidShareCode('ABCDE ')).toBe(false)
      expect(isValidShareCode('AB CD')).toBe(false)
    })
  })

  describe('invalid codes - type', () => {
    it('should reject null and undefined', () => {
      // @ts-expect-error - testing invalid input
      expect(isValidShareCode(null)).toBe(false)
      // @ts-expect-error - testing invalid input
      expect(isValidShareCode(undefined)).toBe(false)
    })

    it('should reject non-string types', () => {
      // @ts-expect-error - testing invalid input
      expect(isValidShareCode(123456)).toBe(false)
      // @ts-expect-error - testing invalid input
      expect(isValidShareCode({ code: 'ABC123' })).toBe(false)
      // @ts-expect-error - testing invalid input
      expect(isValidShareCode(['A', 'B', 'C', '1', '2', '3'])).toBe(false)
    })

    it('should reject empty string', () => {
      expect(isValidShareCode('')).toBe(false)
    })
  })
})

// ============================================
// SHARE CODE NORMALIZATION TESTS
// ============================================

describe('normalizeShareCode', () => {
  it('should convert lowercase to uppercase', () => {
    expect(normalizeShareCode('abcdef')).toBe('ABCDEF')
    expect(normalizeShareCode('abc123')).toBe('ABC123')
  })

  it('should convert mixed case to uppercase', () => {
    expect(normalizeShareCode('AbCdEf')).toBe('ABCDEF')
    expect(normalizeShareCode('BeArS7')).toBe('BEARS7')
  })

  it('should trim whitespace', () => {
    expect(normalizeShareCode(' ABCDEF')).toBe('ABCDEF')
    expect(normalizeShareCode('ABCDEF ')).toBe('ABCDEF')
    expect(normalizeShareCode(' ABCDEF ')).toBe('ABCDEF')
    expect(normalizeShareCode('  ABC123  ')).toBe('ABC123')
  })

  it('should trim and uppercase together', () => {
    expect(normalizeShareCode(' abcdef ')).toBe('ABCDEF')
    expect(normalizeShareCode('  BeArS7  ')).toBe('BEARS7')
  })

  it('should leave valid codes unchanged', () => {
    expect(normalizeShareCode('ABCDEF')).toBe('ABCDEF')
    expect(normalizeShareCode('BEARS7')).toBe('BEARS7')
    expect(normalizeShareCode('123456')).toBe('123456')
  })

  it('should preserve numbers', () => {
    expect(normalizeShareCode('abc123')).toBe('ABC123')
    expect(normalizeShareCode('999999')).toBe('999999')
  })

  it('should handle tabs and newlines', () => {
    expect(normalizeShareCode('\tABCDEF\t')).toBe('ABCDEF')
    expect(normalizeShareCode('\nABC123\n')).toBe('ABC123')
  })

  it('should NOT remove internal spaces or special characters', () => {
    // This is expected behavior - normalization doesn't validate
    expect(normalizeShareCode('ABC DEF')).toBe('ABC DEF')
    expect(normalizeShareCode('abc-123')).toBe('ABC-123')
  })
})

// ============================================
// SHARE CODE FORMATTING TESTS
// ============================================

describe('formatShareCode', () => {
  it('should add dash in middle of 6-character code', () => {
    expect(formatShareCode('ABCDEF')).toBe('ABC-DEF')
    expect(formatShareCode('BEARS7')).toBe('BEA-RS7')
    expect(formatShareCode('PACK3R')).toBe('PAC-K3R')
    expect(formatShareCode('123456')).toBe('123-456')
  })

  it('should split code into 3-3 format', () => {
    expect(formatShareCode('SPORTS')).toBe('SPO-RTS')
    expect(formatShareCode('A1B2C3')).toBe('A1B-2C3')
  })

  it('should return code unchanged if not 6 characters', () => {
    expect(formatShareCode('ABC')).toBe('ABC')
    expect(formatShareCode('ABCDEFG')).toBe('ABCDEFG')
    expect(formatShareCode('')).toBe('')
    expect(formatShareCode('12')).toBe('12')
  })

  it('should handle edge cases', () => {
    expect(formatShareCode('AAAAAA')).toBe('AAA-AAA')
    expect(formatShareCode('111111')).toBe('111-111')
    expect(formatShareCode('A1A1A1')).toBe('A1A-1A1')
  })
})

// ============================================
// INTEGRATION TESTS
// ============================================

describe('share code workflow integration', () => {
  it('should work together: generate -> validate -> format', () => {
    const code = generateShareCode()

    // Generated code should be valid
    expect(isValidShareCode(code)).toBe(true)

    // Formatted code should have dash
    const formatted = formatShareCode(code)
    expect(formatted).toContain('-')
    expect(formatted.length).toBe(7) // 6 chars + 1 dash
  })

  it('should work together: normalize -> validate', () => {
    const userInput = ' bears7 '

    // Normalize user input
    const normalized = normalizeShareCode(userInput)
    expect(normalized).toBe('BEARS7')

    // Normalized code should be valid
    expect(isValidShareCode(normalized)).toBe(true)
  })

  it('should handle complete user flow', () => {
    // User enters code with mixed case and spaces
    const userInput = '  BEa-Rs7  '

    // Step 1: Normalize (remove spaces, uppercase)
    const step1 = normalizeShareCode(userInput)
    expect(step1).toBe('BEA-RS7')

    // Step 2: Remove dash (would happen in actual code)
    const step2 = step1.replace('-', '')
    expect(step2).toBe('BEARS7')

    // Step 3: Validate
    const isValid = isValidShareCode(step2)
    expect(isValid).toBe(true)

    // Step 4: Format for display
    const formatted = formatShareCode(step2)
    expect(formatted).toBe('BEA-RS7')
  })

  it('should reject invalid codes after normalization', () => {
    const invalidInputs = [
      'ABC',           // Too short
      'ABCDEFGH',      // Too long
      'ABC@EF',        // Special character
      'abc def',       // Internal space
    ]

    invalidInputs.forEach(input => {
      const normalized = normalizeShareCode(input)
      expect(isValidShareCode(normalized)).toBe(false)
    })
  })

  it('should generate statistically distributed codes', () => {
    const codes = new Set()
    const iterations = 1000

    // Generate many codes
    for (let i = 0; i < iterations; i++) {
      const code = generateShareCode()
      codes.add(code)

      // Each should be valid
      expect(isValidShareCode(code)).toBe(true)
    }

    // Should have high uniqueness (allow <1% collision rate)
    const uniquePercentage = (codes.size / iterations) * 100
    expect(uniquePercentage).toBeGreaterThan(99)
  })
})
