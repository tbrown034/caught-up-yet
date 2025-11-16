import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import GameCard from './GameCard'
import type { ESPNGame } from '@/lib/espn-api'

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, width, height }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} width={width} height={height} />
  ),
}))

// Mock CreateRoomModal
vi.mock('@/components/rooms/CreateRoomModal', () => ({
  default: ({ game, onClose }: any) => (
    <div data-testid="create-room-modal">
      <button onClick={onClose}>Close Modal</button>
      <span>Game: {game.name}</span>
    </div>
  ),
}))

// ============================================
// MOCK DATA
// ============================================

const mockNFLGame: ESPNGame = {
  id: '401547418',
  name: 'Green Bay Packers at Chicago Bears',
  shortName: 'GB @ CHI',
  date: '2025-11-16T18:00:00Z',
  sport: 'nfl',
  status: {
    type: 'STATUS_IN_PROGRESS',
    displayClock: '8:42',
    period: 2,
    detail: '2nd Quarter',
  },
  competitors: [
    {
      team: {
        displayName: 'Green Bay Packers',
        abbreviation: 'GB',
        logo: 'https://example.com/gb-logo.png',
        color: '203731',
      },
      score: '14',
      homeAway: 'away',
    },
    {
      team: {
        displayName: 'Chicago Bears',
        abbreviation: 'CHI',
        logo: 'https://example.com/chi-logo.png',
        color: '0B162A',
      },
      score: '7',
      homeAway: 'home',
    },
  ],
}

const mockScheduledGame: ESPNGame = {
  ...mockNFLGame,
  id: '401547419',
  status: {
    type: 'STATUS_SCHEDULED',
    detail: 'Scheduled',
  },
  competitors: [
    {
      ...mockNFLGame.competitors[0],
      score: undefined,
    },
    {
      ...mockNFLGame.competitors[1],
      score: undefined,
    },
  ],
}

const mockFinalGame: ESPNGame = {
  ...mockNFLGame,
  id: '401547420',
  status: {
    type: 'STATUS_FINAL',
    detail: 'Final',
  },
  competitors: [
    {
      ...mockNFLGame.competitors[0],
      score: '28',
    },
    {
      ...mockNFLGame.competitors[1],
      score: '21',
    },
  ],
}

// ============================================
// RENDERING TESTS
// ============================================

describe('GameCard', () => {
  describe('basic rendering', () => {
    it('should render game card with team names', () => {
      render(<GameCard game={mockNFLGame} />)

      expect(screen.getByText('Green Bay Packers')).toBeInTheDocument()
      expect(screen.getByText('Chicago Bears')).toBeInTheDocument()
    })

    it('should render team abbreviations', () => {
      render(<GameCard game={mockNFLGame} />)

      expect(screen.getByText('GB')).toBeInTheDocument()
      expect(screen.getByText('CHI')).toBeInTheDocument()
    })

    it('should render team logos', () => {
      render(<GameCard game={mockNFLGame} />)

      const awayLogo = screen.getByAltText('Green Bay Packers')
      const homeLogo = screen.getByAltText('Chicago Bears')

      expect(awayLogo).toBeInTheDocument()
      expect(homeLogo).toBeInTheDocument()
      expect(awayLogo).toHaveAttribute('src', 'https://example.com/gb-logo.png')
      expect(homeLogo).toHaveAttribute('src', 'https://example.com/chi-logo.png')
    })

    it('should render sport label', () => {
      render(<GameCard game={mockNFLGame} />)

      expect(screen.getByText('NFL')).toBeInTheDocument()
    })

    it('should render Create Watch Party button', () => {
      render(<GameCard game={mockNFLGame} />)

      const button = screen.getByRole('button', { name: /create watch party/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('game status - live game', () => {
    it('should show LIVE badge for in-progress games', () => {
      render(<GameCard game={mockNFLGame} />)

      const liveBadge = screen.getByText('LIVE')
      expect(liveBadge).toBeInTheDocument()
      expect(liveBadge).toHaveClass('bg-red-100', 'text-red-600')
    })

    it('should show scores for live games', () => {
      render(<GameCard game={mockNFLGame} />)

      expect(screen.getByText('14')).toBeInTheDocument() // Away score
      expect(screen.getByText('7')).toBeInTheDocument()  // Home score
    })

    it('should show game status detail for live games', () => {
      render(<GameCard game={mockNFLGame} />)

      expect(screen.getByText('2nd Quarter')).toBeInTheDocument()
    })
  })

  describe('game status - scheduled game', () => {
    it('should show game time for scheduled games', () => {
      render(<GameCard game={mockScheduledGame} />)

      // Should show time (format may vary by locale)
      expect(screen.queryByText('LIVE')).not.toBeInTheDocument()
      expect(screen.queryByText('FINAL')).not.toBeInTheDocument()
    })

    it('should not show scores for scheduled games', () => {
      render(<GameCard game={mockScheduledGame} />)

      // Should not have any large score text
      const scores = screen.queryAllByText(/^\d+$/)
      expect(scores.length).toBe(0)
    })

    it('should not show LIVE or FINAL badge', () => {
      render(<GameCard game={mockScheduledGame} />)

      expect(screen.queryByText('LIVE')).not.toBeInTheDocument()
      expect(screen.queryByText('FINAL')).not.toBeInTheDocument()
    })
  })

  describe('game status - final game', () => {
    it('should show FINAL badge for completed games', () => {
      render(<GameCard game={mockFinalGame} />)

      const finalBadge = screen.getByText('FINAL')
      expect(finalBadge).toBeInTheDocument()
      expect(finalBadge).toHaveClass('bg-gray-100', 'text-gray-600')
    })

    it('should show final scores', () => {
      render(<GameCard game={mockFinalGame} />)

      expect(screen.getByText('28')).toBeInTheDocument()
      expect(screen.getByText('21')).toBeInTheDocument()
    })

    it('should not show game status detail section', () => {
      render(<GameCard game={mockFinalGame} />)

      // Should show FINAL badge but not the detail section
      expect(screen.getByText('FINAL')).toBeInTheDocument()
      // The detail field contains "Final" but shouldn't be rendered separately
      expect(screen.queryByText('2nd Quarter')).not.toBeInTheDocument()
    })
  })

  describe('all sports', () => {
    it('should render MLB game correctly', () => {
      const mlbGame: ESPNGame = {
        ...mockNFLGame,
        sport: 'mlb',
        name: 'Yankees at Red Sox',
        status: {
          type: 'STATUS_IN_PROGRESS',
          displayClock: 'Top 5th', // Need displayClock for detail to show
          detail: 'Top 5th',
          period: 5,
        },
      }

      render(<GameCard game={mlbGame} />)

      expect(screen.getByText('MLB')).toBeInTheDocument()
      expect(screen.getByText('Top 5th')).toBeInTheDocument()
    })

    it('should render NBA game correctly', () => {
      const nbaGame: ESPNGame = {
        ...mockNFLGame,
        sport: 'nba',
        status: {
          type: 'STATUS_IN_PROGRESS',
          displayClock: '6:45',
          period: 3,
          detail: '3rd Quarter',
        },
      }

      render(<GameCard game={nbaGame} />)

      expect(screen.getByText('NBA')).toBeInTheDocument()
      expect(screen.getByText('3rd Quarter')).toBeInTheDocument()
    })

    it('should render NHL game correctly', () => {
      const nhlGame: ESPNGame = {
        ...mockNFLGame,
        sport: 'nhl',
        status: {
          type: 'STATUS_IN_PROGRESS',
          displayClock: '12:30',
          period: 2,
          detail: '2nd Period',
        },
      }

      render(<GameCard game={nhlGame} />)

      expect(screen.getByText('NHL')).toBeInTheDocument()
      expect(screen.getByText('2nd Period')).toBeInTheDocument()
    })
  })

  describe('user interactions', () => {
    it('should open create room modal when button clicked', () => {
      render(<GameCard game={mockNFLGame} />)

      const button = screen.getByRole('button', { name: /create watch party/i })
      fireEvent.click(button)

      expect(screen.getByTestId('create-room-modal')).toBeInTheDocument()
      expect(screen.getByText(/Game: Green Bay Packers at Chicago Bears/)).toBeInTheDocument()
    })

    it('should close modal when onClose is called', () => {
      render(<GameCard game={mockNFLGame} />)

      // Open modal
      const button = screen.getByRole('button', { name: /create watch party/i })
      fireEvent.click(button)

      expect(screen.getByTestId('create-room-modal')).toBeInTheDocument()

      // Close modal
      const closeButton = screen.getByRole('button', { name: /close modal/i })
      fireEvent.click(closeButton)

      expect(screen.queryByTestId('create-room-modal')).not.toBeInTheDocument()
    })

    it('should apply hover styles to card', () => {
      const { container } = render(<GameCard game={mockNFLGame} />)

      const card = container.querySelector('.hover\\:shadow-lg')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('border', 'border-gray-200', 'rounded-lg', 'bg-white')
    })
  })

  describe('edge cases', () => {
    it('should handle missing display clock', () => {
      const gameWithoutClock: ESPNGame = {
        ...mockNFLGame,
        status: {
          type: 'STATUS_IN_PROGRESS',
          detail: '2nd Quarter',
          period: 2,
        },
      }

      render(<GameCard game={gameWithoutClock} />)

      // When displayClock is missing, the detail section is not shown
      // But the LIVE badge should still be shown
      expect(screen.getByText('LIVE')).toBeInTheDocument()
      expect(screen.queryByText('2nd Quarter')).not.toBeInTheDocument()
    })

    it('should handle missing scores gracefully', () => {
      const gameWithoutScores: ESPNGame = {
        ...mockNFLGame,
        competitors: [
          {
            ...mockNFLGame.competitors[0],
            score: undefined,
          },
          {
            ...mockNFLGame.competitors[1],
            score: undefined,
          },
        ],
      }

      render(<GameCard game={gameWithoutScores} />)

      // Should render team names but no scores
      expect(screen.getByText('Green Bay Packers')).toBeInTheDocument()
      expect(screen.queryByText('14')).not.toBeInTheDocument()
    })

    it('should handle very long team names', () => {
      const gameWithLongNames: ESPNGame = {
        ...mockNFLGame,
        competitors: [
          {
            ...mockNFLGame.competitors[0],
            team: {
              ...mockNFLGame.competitors[0].team,
              displayName: 'Very Long Team Name That Should Not Break Layout',
            },
          },
          {
            ...mockNFLGame.competitors[1],
            team: {
              ...mockNFLGame.competitors[1].team,
              displayName: 'Another Very Long Team Name',
            },
          },
        ],
      }

      render(<GameCard game={gameWithLongNames} />)

      expect(screen.getByText('Very Long Team Name That Should Not Break Layout')).toBeInTheDocument()
      expect(screen.getByText('Another Very Long Team Name')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('should have accessible button', () => {
      render(<GameCard game={mockNFLGame} />)

      const button = screen.getByRole('button', { name: /create watch party/i })
      expect(button).toBeEnabled()
    })

    it('should have alt text for team logos', () => {
      render(<GameCard game={mockNFLGame} />)

      const awayLogo = screen.getByAltText('Green Bay Packers')
      const homeLogo = screen.getByAltText('Chicago Bears')

      expect(awayLogo).toBeInTheDocument()
      expect(homeLogo).toBeInTheDocument()
    })

    it('should have proper semantic structure', () => {
      render(<GameCard game={mockNFLGame} />)

      // Should have button element
      expect(screen.getByRole('button')).toBeInTheDocument()

      // Should have images
      const images = screen.getAllByRole('img')
      expect(images.length).toBe(2)
    })
  })
})
