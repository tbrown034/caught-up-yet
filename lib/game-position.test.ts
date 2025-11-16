import { describe, it, expect } from 'vitest'
import {
  compareNflPositions,
  compareMlbPositions,
  compareNbaPositions,
  compareNhlPositions,
  isMessageVisible,
  formatNflPosition,
  formatMlbPosition,
  formatNbaPosition,
  formatNhlPosition,
  formatGamePosition,
  getInitialPosition,
  isValidPosition,
} from './game-position'
import type {
  NflPosition,
  MlbPosition,
  NbaPosition,
  NhlPosition,
} from './database.types'

// ============================================
// NFL POSITION COMPARISON TESTS
// ============================================

describe('compareNflPositions', () => {
  it('should return -1 when first position is earlier (different quarters)', () => {
    const a: NflPosition = { quarter: 1, minutes: 10, seconds: 0 }
    const b: NflPosition = { quarter: 2, minutes: 10, seconds: 0 }
    expect(compareNflPositions(a, b)).toBe(-1)
  })

  it('should return 1 when first position is later (different quarters)', () => {
    const a: NflPosition = { quarter: 3, minutes: 10, seconds: 0 }
    const b: NflPosition = { quarter: 2, minutes: 10, seconds: 0 }
    expect(compareNflPositions(a, b)).toBe(1)
  })

  it('should return 0 when positions are equal', () => {
    const a: NflPosition = { quarter: 2, minutes: 8, seconds: 30 }
    const b: NflPosition = { quarter: 2, minutes: 8, seconds: 30 }
    expect(compareNflPositions(a, b)).toBe(0)
  })

  it('should compare time within same quarter (less time = later position)', () => {
    const a: NflPosition = { quarter: 2, minutes: 5, seconds: 0 }
    const b: NflPosition = { quarter: 2, minutes: 10, seconds: 0 }
    expect(compareNflPositions(a, b)).toBe(1) // 5:00 is later than 10:00
  })

  it('should handle seconds correctly within same quarter', () => {
    const a: NflPosition = { quarter: 2, minutes: 8, seconds: 15 }
    const b: NflPosition = { quarter: 2, minutes: 8, seconds: 30 }
    expect(compareNflPositions(a, b)).toBe(1) // 8:15 is later than 8:30
  })

  it('should handle quarter 4 (end of regulation)', () => {
    const a: NflPosition = { quarter: 4, minutes: 0, seconds: 10 }
    const b: NflPosition = { quarter: 4, minutes: 0, seconds: 5 }
    expect(compareNflPositions(a, b)).toBe(-1) // 0:10 is earlier than 0:05
  })

  it('should handle quarter 1 start', () => {
    const a: NflPosition = { quarter: 1, minutes: 15, seconds: 0 }
    const b: NflPosition = { quarter: 1, minutes: 14, seconds: 59 }
    expect(compareNflPositions(a, b)).toBe(-1)
  })
})

// ============================================
// MLB POSITION COMPARISON TESTS
// ============================================

describe('compareMlbPositions', () => {
  it('should return -1 when first position is earlier (different innings)', () => {
    const a: MlbPosition = { inning: 3, half: 'TOP', outs: 0 }
    const b: MlbPosition = { inning: 5, half: 'TOP', outs: 0 }
    expect(compareMlbPositions(a, b)).toBe(-1)
  })

  it('should return 1 when first position is later (different innings)', () => {
    const a: MlbPosition = { inning: 7, half: 'BOTTOM', outs: 2 }
    const b: MlbPosition = { inning: 5, half: 'TOP', outs: 1 }
    expect(compareMlbPositions(a, b)).toBe(1)
  })

  it('should compare half innings correctly (TOP < BOTTOM)', () => {
    const a: MlbPosition = { inning: 3, half: 'TOP', outs: 0 }
    const b: MlbPosition = { inning: 3, half: 'BOTTOM', outs: 0 }
    expect(compareMlbPositions(a, b)).toBe(-1)
  })

  it('should compare half innings correctly (BOTTOM > TOP)', () => {
    const a: MlbPosition = { inning: 3, half: 'BOTTOM', outs: 0 }
    const b: MlbPosition = { inning: 3, half: 'TOP', outs: 0 }
    expect(compareMlbPositions(a, b)).toBe(1)
  })

  it('should compare outs within same half inning', () => {
    const a: MlbPosition = { inning: 5, half: 'TOP', outs: 1 }
    const b: MlbPosition = { inning: 5, half: 'TOP', outs: 2 }
    expect(compareMlbPositions(a, b)).toBe(-1)
  })

  it('should return 0 when positions are equal', () => {
    const a: MlbPosition = { inning: 4, half: 'BOTTOM', outs: 2 }
    const b: MlbPosition = { inning: 4, half: 'BOTTOM', outs: 2 }
    expect(compareMlbPositions(a, b)).toBe(0)
  })

  it('should handle undefined outs as 0', () => {
    const a: MlbPosition = { inning: 3, half: 'TOP' }
    const b: MlbPosition = { inning: 3, half: 'TOP', outs: 0 }
    expect(compareMlbPositions(a, b)).toBe(0)
  })

  it('should handle extra innings', () => {
    const a: MlbPosition = { inning: 10, half: 'BOTTOM', outs: 2 }
    const b: MlbPosition = { inning: 9, half: 'BOTTOM', outs: 2 }
    expect(compareMlbPositions(a, b)).toBe(1)
  })

  it('should handle 9th inning bottom (game-ending scenario)', () => {
    const a: MlbPosition = { inning: 9, half: 'BOTTOM', outs: 2 }
    const b: MlbPosition = { inning: 9, half: 'TOP', outs: 2 }
    expect(compareMlbPositions(a, b)).toBe(1)
  })
})

// ============================================
// NBA POSITION COMPARISON TESTS
// ============================================

describe('compareNbaPositions', () => {
  it('should return -1 when first position is earlier', () => {
    const a: NbaPosition = { quarter: 1, minutes: 10, seconds: 0 }
    const b: NbaPosition = { quarter: 2, minutes: 10, seconds: 0 }
    expect(compareNbaPositions(a, b)).toBe(-1)
  })

  it('should compare time correctly within quarter', () => {
    const a: NbaPosition = { quarter: 3, minutes: 6, seconds: 45 }
    const b: NbaPosition = { quarter: 3, minutes: 8, seconds: 0 }
    expect(compareNbaPositions(a, b)).toBe(1) // 6:45 is later than 8:00
  })

  it('should return 0 when positions are equal', () => {
    const a: NbaPosition = { quarter: 4, minutes: 2, seconds: 30 }
    const b: NbaPosition = { quarter: 4, minutes: 2, seconds: 30 }
    expect(compareNbaPositions(a, b)).toBe(0)
  })

  it('should handle quarter 4 final seconds', () => {
    const a: NbaPosition = { quarter: 4, minutes: 0, seconds: 5 }
    const b: NbaPosition = { quarter: 4, minutes: 0, seconds: 1 }
    expect(compareNbaPositions(a, b)).toBe(-1)
  })
})

// ============================================
// NHL POSITION COMPARISON TESTS
// ============================================

describe('compareNhlPositions', () => {
  it('should return -1 when first position is earlier', () => {
    const a: NhlPosition = { period: 1, minutes: 15, seconds: 0 }
    const b: NhlPosition = { period: 2, minutes: 15, seconds: 0 }
    expect(compareNhlPositions(a, b)).toBe(-1)
  })

  it('should compare time correctly within period', () => {
    const a: NhlPosition = { period: 2, minutes: 10, seconds: 30 }
    const b: NhlPosition = { period: 2, minutes: 12, seconds: 0 }
    expect(compareNhlPositions(a, b)).toBe(1) // 10:30 is later than 12:00
  })

  it('should return 0 when positions are equal', () => {
    const a: NhlPosition = { period: 3, minutes: 5, seconds: 45 }
    const b: NhlPosition = { period: 3, minutes: 5, seconds: 45 }
    expect(compareNhlPositions(a, b)).toBe(0)
  })

  it('should handle period 3 final seconds', () => {
    const a: NhlPosition = { period: 3, minutes: 0, seconds: 10 }
    const b: NhlPosition = { period: 3, minutes: 0, seconds: 1 }
    expect(compareNhlPositions(a, b)).toBe(-1)
  })
})

// ============================================
// MESSAGE VISIBILITY TESTS (CRITICAL!)
// ============================================

describe('isMessageVisible', () => {
  describe('NFL spoiler protection', () => {
    it('should show message when user is ahead of message position', () => {
      const messagePos: NflPosition = { quarter: 1, minutes: 10, seconds: 0 }
      const userPos: NflPosition = { quarter: 2, minutes: 5, seconds: 0 }
      expect(isMessageVisible(messagePos, userPos, 'nfl')).toBe(true)
    })

    it('should show message when user is at same position', () => {
      const messagePos: NflPosition = { quarter: 2, minutes: 8, seconds: 30 }
      const userPos: NflPosition = { quarter: 2, minutes: 8, seconds: 30 }
      expect(isMessageVisible(messagePos, userPos, 'nfl')).toBe(true)
    })

    it('should hide message when user is behind message position', () => {
      const messagePos: NflPosition = { quarter: 3, minutes: 5, seconds: 0 }
      const userPos: NflPosition = { quarter: 2, minutes: 10, seconds: 0 }
      expect(isMessageVisible(messagePos, userPos, 'nfl')).toBe(false)
    })

    it('should hide message when 1 second behind', () => {
      const messagePos: NflPosition = { quarter: 2, minutes: 8, seconds: 29 }
      const userPos: NflPosition = { quarter: 2, minutes: 8, seconds: 30 }
      expect(isMessageVisible(messagePos, userPos, 'nfl')).toBe(false)
    })
  })

  describe('MLB spoiler protection', () => {
    it('should show message when user is ahead', () => {
      const messagePos: MlbPosition = { inning: 3, half: 'TOP', outs: 1 }
      const userPos: MlbPosition = { inning: 5, half: 'BOTTOM', outs: 2 }
      expect(isMessageVisible(messagePos, userPos, 'mlb')).toBe(true)
    })

    it('should hide message when user is behind', () => {
      const messagePos: MlbPosition = { inning: 7, half: 'BOTTOM', outs: 2 }
      const userPos: MlbPosition = { inning: 5, half: 'TOP', outs: 0 }
      expect(isMessageVisible(messagePos, userPos, 'mlb')).toBe(false)
    })

    it('should handle half inning transitions', () => {
      const messagePos: MlbPosition = { inning: 4, half: 'BOTTOM', outs: 0 }
      const userPos: MlbPosition = { inning: 4, half: 'TOP', outs: 2 }
      expect(isMessageVisible(messagePos, userPos, 'mlb')).toBe(false)
    })

    it('should show message at exact same position', () => {
      const messagePos: MlbPosition = { inning: 6, half: 'TOP', outs: 1 }
      const userPos: MlbPosition = { inning: 6, half: 'TOP', outs: 1 }
      expect(isMessageVisible(messagePos, userPos, 'mlb')).toBe(true)
    })
  })

  describe('NBA spoiler protection', () => {
    it('should show message when user is ahead', () => {
      const messagePos: NbaPosition = { quarter: 1, minutes: 8, seconds: 0 }
      const userPos: NbaPosition = { quarter: 3, minutes: 5, seconds: 0 }
      expect(isMessageVisible(messagePos, userPos, 'nba')).toBe(true)
    })

    it('should hide message when user is behind', () => {
      const messagePos: NbaPosition = { quarter: 4, minutes: 2, seconds: 0 }
      const userPos: NbaPosition = { quarter: 3, minutes: 10, seconds: 0 }
      expect(isMessageVisible(messagePos, userPos, 'nba')).toBe(false)
    })
  })

  describe('NHL spoiler protection', () => {
    it('should show message when user is ahead', () => {
      const messagePos: NhlPosition = { period: 1, minutes: 15, seconds: 0 }
      const userPos: NhlPosition = { period: 2, minutes: 10, seconds: 0 }
      expect(isMessageVisible(messagePos, userPos, 'nhl')).toBe(true)
    })

    it('should hide message when user is behind', () => {
      const messagePos: NhlPosition = { period: 3, minutes: 5, seconds: 0 }
      const userPos: NhlPosition = { period: 2, minutes: 18, seconds: 0 }
      expect(isMessageVisible(messagePos, userPos, 'nhl')).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should return false for invalid sport', () => {
      const pos: NflPosition = { quarter: 1, minutes: 10, seconds: 0 }
      // @ts-expect-error - testing invalid sport
      expect(isMessageVisible(pos, pos, 'invalid')).toBe(false)
    })
  })
})

// ============================================
// POSITION FORMATTING TESTS
// ============================================

describe('formatNflPosition', () => {
  it('should format position correctly', () => {
    const pos: NflPosition = { quarter: 3, minutes: 8, seconds: 2 }
    expect(formatNflPosition(pos)).toBe('Q3 08:02')
  })

  it('should pad single digits', () => {
    const pos: NflPosition = { quarter: 1, minutes: 5, seconds: 9 }
    expect(formatNflPosition(pos)).toBe('Q1 05:09')
  })

  it('should handle double digits', () => {
    const pos: NflPosition = { quarter: 4, minutes: 12, seconds: 45 }
    expect(formatNflPosition(pos)).toBe('Q4 12:45')
  })
})

describe('formatMlbPosition', () => {
  it('should format top of inning', () => {
    const pos: MlbPosition = { inning: 5, half: 'TOP', outs: 2 }
    expect(formatMlbPosition(pos)).toBe('Top 5th • 2 outs')
  })

  it('should format bottom of inning', () => {
    const pos: MlbPosition = { inning: 3, half: 'BOTTOM', outs: 1 }
    expect(formatMlbPosition(pos)).toBe('Bottom 3rd • 1 out')
  })

  it('should handle no outs specified', () => {
    const pos: MlbPosition = { inning: 7, half: 'TOP' }
    expect(formatMlbPosition(pos)).toBe('Top 7th')
  })

  it('should format ordinals correctly', () => {
    expect(formatMlbPosition({ inning: 1, half: 'TOP', outs: 0 })).toBe('Top 1st • 0 outs')
    expect(formatMlbPosition({ inning: 2, half: 'TOP', outs: 1 })).toBe('Top 2nd • 1 out')
    expect(formatMlbPosition({ inning: 3, half: 'TOP', outs: 2 })).toBe('Top 3rd • 2 outs')
    expect(formatMlbPosition({ inning: 4, half: 'TOP', outs: 0 })).toBe('Top 4th • 0 outs')
  })

  it('should handle extra innings', () => {
    const pos: MlbPosition = { inning: 12, half: 'BOTTOM', outs: 1 }
    expect(formatMlbPosition(pos)).toBe('Bottom 12th • 1 out')
  })
})

describe('formatNbaPosition', () => {
  it('should format position correctly', () => {
    const pos: NbaPosition = { quarter: 2, minutes: 6, seconds: 45 }
    expect(formatNbaPosition(pos)).toBe('Q2 06:45')
  })

  it('should pad single digits', () => {
    const pos: NbaPosition = { quarter: 4, minutes: 0, seconds: 3 }
    expect(formatNbaPosition(pos)).toBe('Q4 00:03')
  })
})

describe('formatNhlPosition', () => {
  it('should format position correctly', () => {
    const pos: NhlPosition = { period: 2, minutes: 12, seconds: 30 }
    expect(formatNhlPosition(pos)).toBe('P2 12:30')
  })

  it('should pad single digits', () => {
    const pos: NhlPosition = { period: 3, minutes: 5, seconds: 8 }
    expect(formatNhlPosition(pos)).toBe('P3 05:08')
  })
})

describe('formatGamePosition', () => {
  it('should format NFL position', () => {
    const pos: NflPosition = { quarter: 2, minutes: 10, seconds: 0 }
    expect(formatGamePosition(pos, 'nfl')).toBe('Q2 10:00')
  })

  it('should format MLB position', () => {
    const pos: MlbPosition = { inning: 5, half: 'BOTTOM', outs: 2 }
    expect(formatGamePosition(pos, 'mlb')).toBe('Bottom 5th • 2 outs')
  })

  it('should format NBA position', () => {
    const pos: NbaPosition = { quarter: 3, minutes: 8, seconds: 15 }
    expect(formatGamePosition(pos, 'nba')).toBe('Q3 08:15')
  })

  it('should format NHL position', () => {
    const pos: NhlPosition = { period: 1, minutes: 20, seconds: 0 }
    expect(formatGamePosition(pos, 'nhl')).toBe('P1 20:00')
  })

  it('should handle invalid sport', () => {
    const pos: NflPosition = { quarter: 1, minutes: 15, seconds: 0 }
    // @ts-expect-error - testing invalid sport
    expect(formatGamePosition(pos, 'invalid')).toBe('Unknown')
  })
})

// ============================================
// INITIAL POSITION TESTS
// ============================================

describe('getInitialPosition', () => {
  it('should return correct NFL start position', () => {
    const pos = getInitialPosition('nfl')
    expect(pos).toEqual({ quarter: 1, minutes: 15, seconds: 0 })
  })

  it('should return correct MLB start position', () => {
    const pos = getInitialPosition('mlb')
    expect(pos).toEqual({ inning: 1, half: 'TOP', outs: 0 })
  })

  it('should return correct NBA start position', () => {
    const pos = getInitialPosition('nba')
    expect(pos).toEqual({ quarter: 1, minutes: 12, seconds: 0 })
  })

  it('should return correct NHL start position', () => {
    const pos = getInitialPosition('nhl')
    expect(pos).toEqual({ period: 1, minutes: 20, seconds: 0 })
  })

  it('should throw error for invalid sport', () => {
    // @ts-expect-error - testing invalid sport
    expect(() => getInitialPosition('invalid')).toThrow('Unsupported sport')
  })
})

// ============================================
// POSITION VALIDATION TESTS
// ============================================

describe('isValidPosition', () => {
  describe('NFL validation', () => {
    it('should validate correct NFL position', () => {
      const pos: NflPosition = { quarter: 2, minutes: 10, seconds: 30 }
      expect(isValidPosition(pos, 'nfl')).toBe(true)
    })

    it('should reject invalid quarter (too low)', () => {
      const pos = { quarter: 0, minutes: 10, seconds: 0 }
      expect(isValidPosition(pos, 'nfl')).toBe(false)
    })

    it('should reject invalid quarter (too high)', () => {
      const pos = { quarter: 5, minutes: 10, seconds: 0 }
      expect(isValidPosition(pos, 'nfl')).toBe(false)
    })

    it('should reject missing fields', () => {
      const pos = { quarter: 2, minutes: 10 }
      expect(isValidPosition(pos, 'nfl')).toBe(false)
    })

    it('should reject non-object', () => {
      expect(isValidPosition(null, 'nfl')).toBe(false)
      expect(isValidPosition(undefined, 'nfl')).toBe(false)
      expect(isValidPosition('invalid', 'nfl')).toBe(false)
    })
  })

  describe('MLB validation', () => {
    it('should validate correct MLB position', () => {
      const pos: MlbPosition = { inning: 5, half: 'TOP', outs: 2 }
      expect(isValidPosition(pos, 'mlb')).toBe(true)
    })

    it('should validate MLB position without outs', () => {
      const pos: MlbPosition = { inning: 3, half: 'BOTTOM' }
      expect(isValidPosition(pos, 'mlb')).toBe(true)
    })

    it('should reject invalid inning', () => {
      const pos = { inning: 0, half: 'TOP' }
      expect(isValidPosition(pos, 'mlb')).toBe(false)
    })

    it('should reject invalid half', () => {
      const pos = { inning: 5, half: 'MIDDLE' }
      expect(isValidPosition(pos, 'mlb')).toBe(false)
    })
  })

  describe('NBA validation', () => {
    it('should validate correct NBA position', () => {
      const pos: NbaPosition = { quarter: 3, minutes: 8, seconds: 45 }
      expect(isValidPosition(pos, 'nba')).toBe(true)
    })

    it('should reject invalid quarter', () => {
      const pos = { quarter: 5, minutes: 10, seconds: 0 }
      expect(isValidPosition(pos, 'nba')).toBe(false)
    })
  })

  describe('NHL validation', () => {
    it('should validate correct NHL position', () => {
      const pos: NhlPosition = { period: 2, minutes: 15, seconds: 30 }
      expect(isValidPosition(pos, 'nhl')).toBe(true)
    })

    it('should reject invalid period (too high)', () => {
      const pos = { period: 4, minutes: 10, seconds: 0 }
      expect(isValidPosition(pos, 'nhl')).toBe(false)
    })

    it('should reject invalid period (too low)', () => {
      const pos = { period: 0, minutes: 10, seconds: 0 }
      expect(isValidPosition(pos, 'nhl')).toBe(false)
    })
  })
})
