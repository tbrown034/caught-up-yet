import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchSportGames, fetchAllSportsGames, type ESPNGame } from './espn-api'

// Mock fetch globally
global.fetch = vi.fn()

// ============================================
// MOCK DATA
// ============================================

const mockESPNNFLResponse = {
  events: [
    {
      id: '401547418',
      name: 'Green Bay Packers at Chicago Bears',
      shortName: 'GB @ CHI',
      date: '2025-11-16T18:00Z',
      status: {
        type: { name: 'STATUS_IN_PROGRESS', detail: '2nd Quarter' },
        displayClock: '8:42',
        period: 2,
      },
      competitions: [
        {
          competitors: [
            {
              homeAway: 'away',
              team: {
                displayName: 'Green Bay Packers',
                abbreviation: 'GB',
                logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png',
                color: '203731',
              },
              score: '14',
            },
            {
              homeAway: 'home',
              team: {
                displayName: 'Chicago Bears',
                abbreviation: 'CHI',
                logo: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png',
                color: '0B162A',
              },
              score: '7',
            },
          ],
        },
      ],
    },
  ],
}

const mockESPNMLBResponse = {
  events: [
    {
      id: '401581234',
      name: 'New York Yankees at Boston Red Sox',
      shortName: 'NYY @ BOS',
      date: '2025-11-16T19:00Z',
      status: {
        type: { name: 'STATUS_IN_PROGRESS', detail: 'Top 5th' },
        displayClock: undefined,
        period: 5,
      },
      competitions: [
        {
          competitors: [
            {
              homeAway: 'away',
              team: {
                displayName: 'New York Yankees',
                abbreviation: 'NYY',
                logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png',
                color: '003087',
              },
              score: '3',
            },
            {
              homeAway: 'home',
              team: {
                displayName: 'Boston Red Sox',
                abbreviation: 'BOS',
                logo: 'https://a.espncdn.com/i/teamlogos/mlb/500/bos.png',
                color: 'BD3039',
              },
              score: '2',
            },
          ],
        },
      ],
    },
  ],
}

const mockESPNEmptyResponse = {
  events: [],
}

// ============================================
// HELPER TESTS
// ============================================

describe('ESPN API date formatting', () => {
  it('should format dates correctly for API', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockESPNEmptyResponse,
    } as Response)

    const testDate = new Date('2025-11-16')
    await fetchSportGames('nfl', testDate)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('dates=20251116'),
      expect.any(Object)
    )
  })

  it('should pad single-digit months and days', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockESPNEmptyResponse,
    } as Response)

    const testDate = new Date('2025-01-05')
    await fetchSportGames('nfl', testDate)

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('dates=20250105'),
      expect.any(Object)
    )
  })
})

// ============================================
// FETCH SPORT GAMES TESTS
// ============================================

describe('fetchSportGames', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('successful fetches', () => {
    it('should fetch NFL games correctly', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockESPNNFLResponse,
      } as Response)

      const testDate = new Date('2025-11-16')
      const games = await fetchSportGames('nfl', testDate)

      // Should call correct ESPN endpoint
      expect(mockFetch).toHaveBeenCalledWith(
        'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=20251116',
        expect.objectContaining({
          next: { revalidate: 60 },
        })
      )

      // Should return correctly formatted game
      expect(games).toHaveLength(1)
      expect(games[0]).toMatchObject({
        id: '401547418',
        name: 'Green Bay Packers at Chicago Bears',
        shortName: 'GB @ CHI',
        sport: 'nfl',
        status: {
          type: 'STATUS_IN_PROGRESS',
          displayClock: '8:42',
          period: 2,
          detail: '2nd Quarter',
        },
      })

      // Should have correct competitors
      expect(games[0].competitors).toHaveLength(2)
      expect(games[0].competitors[0].homeAway).toBe('away')
      expect(games[0].competitors[0].team.abbreviation).toBe('GB')
      expect(games[0].competitors[1].homeAway).toBe('home')
      expect(games[0].competitors[1].team.abbreviation).toBe('CHI')
    })

    it('should fetch MLB games correctly', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockESPNMLBResponse,
      } as Response)

      const testDate = new Date('2025-11-16')
      const games = await fetchSportGames('mlb', testDate)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?dates=20251116',
        expect.any(Object)
      )

      expect(games).toHaveLength(1)
      expect(games[0].sport).toBe('mlb')
      expect(games[0].status.period).toBe(5)
    })

    it('should fetch NBA games correctly', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockESPNEmptyResponse,
      } as Response)

      const testDate = new Date('2025-11-16')
      await fetchSportGames('nba', testDate)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=20251116',
        expect.any(Object)
      )
    })

    it('should fetch NHL games correctly', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockESPNEmptyResponse,
      } as Response)

      const testDate = new Date('2025-11-16')
      await fetchSportGames('nhl', testDate)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=20251116',
        expect.any(Object)
      )
    })

    it('should use 60 second cache revalidation', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockESPNEmptyResponse,
      } as Response)

      await fetchSportGames('nfl', new Date())

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: { revalidate: 60 },
        })
      )
    })
  })

  describe('empty responses', () => {
    it('should return empty array when no events', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: [] }),
      } as Response)

      const games = await fetchSportGames('nfl', new Date())
      expect(games).toEqual([])
    })

    it('should return empty array when events is undefined', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response)

      const games = await fetchSportGames('nfl', new Date())
      expect(games).toEqual([])
    })
  })

  describe('error handling', () => {
    it('should return empty array on fetch error', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const games = await fetchSportGames('nfl', new Date())
      expect(games).toEqual([])
    })

    it('should return empty array on HTTP error', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)

      const games = await fetchSportGames('nfl', new Date())
      expect(games).toEqual([])
    })

    it('should return empty array on 404', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response)

      const games = await fetchSportGames('nfl', new Date())
      expect(games).toEqual([])
    })

    it('should return empty array on JSON parse error', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        },
      } as Response)

      const games = await fetchSportGames('nfl', new Date())
      expect(games).toEqual([])
    })
  })

  describe('data transformation', () => {
    it('should handle missing team colors', async () => {
      const mockFetch = vi.mocked(fetch)
      const responseWithoutColors = {
        events: [
          {
            ...mockESPNNFLResponse.events[0],
            competitions: [
              {
                competitors: [
                  {
                    homeAway: 'away',
                    team: {
                      displayName: 'Team A',
                      abbreviation: 'TEA',
                      logo: 'logo.png',
                      // color missing
                    },
                    score: '0',
                  },
                  {
                    homeAway: 'home',
                    team: {
                      displayName: 'Team B',
                      abbreviation: 'TEB',
                      logo: 'logo.png',
                      // color missing
                    },
                    score: '0',
                  },
                ],
              },
            ],
          },
        ],
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => responseWithoutColors,
      } as Response)

      const games = await fetchSportGames('nfl', new Date())

      expect(games[0].competitors[0].team.color).toBe('000000')
      expect(games[0].competitors[1].team.color).toBe('000000')
    })

    it('should preserve all required fields', async () => {
      const mockFetch = vi.mocked(fetch)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockESPNNFLResponse,
      } as Response)

      const games = await fetchSportGames('nfl', new Date())
      const game = games[0]

      // Check all required fields exist
      expect(game.id).toBeDefined()
      expect(game.name).toBeDefined()
      expect(game.shortName).toBeDefined()
      expect(game.date).toBeDefined()
      expect(game.sport).toBeDefined()
      expect(game.status).toBeDefined()
      expect(game.status.type).toBeDefined()
      expect(game.status.detail).toBeDefined()
      expect(game.competitors).toHaveLength(2)
      expect(game.competitors[0].team.displayName).toBeDefined()
      expect(game.competitors[0].team.abbreviation).toBeDefined()
      expect(game.competitors[0].team.logo).toBeDefined()
      expect(game.competitors[0].team.color).toBeDefined()
    })
  })
})

// ============================================
// FETCH ALL SPORTS GAMES TESTS
// ============================================

describe('fetchAllSportsGames', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch games from all 4 sports in parallel', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockESPNNFLResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockESPNMLBResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockESPNEmptyResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockESPNEmptyResponse,
      } as Response)

    const testDate = new Date('2025-11-16')
    const games = await fetchAllSportsGames(testDate)

    // Should have called fetch 4 times (once per sport)
    expect(mockFetch).toHaveBeenCalledTimes(4)

    // Should have games from both sports that returned data
    expect(games).toHaveLength(2)
    expect(games.some(g => g.sport === 'nfl')).toBe(true)
    expect(games.some(g => g.sport === 'mlb')).toBe(true)
  })

  it('should sort games by date', async () => {
    const mockFetch = vi.mocked(fetch)

    const earlyGame = {
      ...mockESPNNFLResponse.events[0],
      date: '2025-11-16T13:00Z',
    }
    const lateGame = {
      ...mockESPNMLBResponse.events[0],
      date: '2025-11-16T20:00Z',
    }

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: [lateGame] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ events: [earlyGame] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockESPNEmptyResponse,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockESPNEmptyResponse,
      } as Response)

    const games = await fetchAllSportsGames(new Date('2025-11-16'))

    // Games should be sorted by date
    expect(games).toHaveLength(2)
    expect(new Date(games[0].date).getTime()).toBeLessThan(
      new Date(games[1].date).getTime()
    )
  })

  it('should handle all sports returning empty arrays', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockESPNEmptyResponse,
    } as Response)

    const games = await fetchAllSportsGames(new Date())
    expect(games).toEqual([])
  })

  it('should handle some sports failing', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockESPNNFLResponse,
      } as Response)
      .mockRejectedValueOnce(new Error('MLB API down'))
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockESPNEmptyResponse,
      } as Response)

    const games = await fetchAllSportsGames(new Date())

    // Should still return games from successful fetches
    expect(games).toHaveLength(1)
    expect(games[0].sport).toBe('nfl')
  })

  it('should call API with correct date for all sports', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockESPNEmptyResponse,
    } as Response)

    const testDate = new Date('2025-12-25')
    await fetchAllSportsGames(testDate)

    // All 4 calls should have the same date
    expect(mockFetch).toHaveBeenCalledTimes(4)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('dates=20251225'),
      expect.any(Object)
    )
  })
})

// ============================================
// TYPE SAFETY TESTS
// ============================================

describe('type safety', () => {
  it('should return properly typed ESPNGame objects', async () => {
    const mockFetch = vi.mocked(fetch)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockESPNNFLResponse,
    } as Response)

    const games: ESPNGame[] = await fetchSportGames('nfl', new Date())

    // TypeScript should ensure these properties exist
    games.forEach(game => {
      expect(typeof game.id).toBe('string')
      expect(typeof game.name).toBe('string')
      expect(typeof game.sport).toBe('string')
      expect(['nfl', 'mlb', 'nba', 'nhl']).toContain(game.sport)
      expect(game.competitors).toBeInstanceOf(Array)
      expect(['home', 'away']).toContain(game.competitors[0].homeAway)
    })
  })
})
