// Football API Service
// Uses the Football-Data.org API (https://www.football-data.org/)

const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
const API_BASE_URL = 'https://api.football-data.org/v4';

// Fallback data in case API calls fail or rate limits are reached
const FALLBACK_DATA = {
  competitions: [
    { id: 2000, name: "FIFA World Cup", code: "WC", emblem: "https://crests.football-data.org/qatar.png" },
    { id: 2001, name: "UEFA Champions League", code: "CL", emblem: "https://crests.football-data.org/CL.png" },
    { id: 2018, name: "European Championship", code: "EC", emblem: "https://crests.football-data.org/EUR.png" },
    { id: 2021, name: "Premier League", code: "PL", emblem: "https://crests.football-data.org/PL.png" },
    { id: 2014, name: "La Liga", code: "PD", emblem: "https://crests.football-data.org/PD.png" }
  ],
  matches: [
    {
      id: 1001,
      competition: { id: 2018, name: "European Championship" },
      utcDate: "2025-06-14T19:00:00Z",
      status: "SCHEDULED",
      homeTeam: { id: 759, name: "Germany", crest: "https://crests.football-data.org/759.png" },
      awayTeam: { id: 773, name: "France", crest: "https://crests.football-data.org/773.png" },
      group: "Group F",
      score: { fullTime: { home: null, away: null } }
    },
    {
      id: 1002,
      competition: { id: 2018, name: "European Championship" },
      utcDate: "2025-06-14T16:00:00Z",
      status: "SCHEDULED",
      homeTeam: { id: 760, name: "Spain", crest: "https://crests.football-data.org/760.png" },
      awayTeam: { id: 768, name: "Italy", crest: "https://crests.football-data.org/768.png" },
      group: "Group E",
      score: { fullTime: { home: null, away: null } }
    },
    {
      id: 1003,
      competition: { id: 2018, name: "European Championship" },
      utcDate: "2025-06-15T19:00:00Z",
      status: "SCHEDULED",
      homeTeam: { id: 770, name: "England", crest: "https://crests.football-data.org/770.png" },
      awayTeam: { id: 8601, name: "Netherlands", crest: "https://crests.football-data.org/8601.png" },
      group: "Group D",
      score: { fullTime: { home: null, away: null } }
    },
    {
      id: 1004,
      competition: { id: 2018, name: "European Championship" },
      utcDate: "2025-06-15T16:00:00Z",
      status: "SCHEDULED",
      homeTeam: { id: 765, name: "Portugal", crest: "https://crests.football-data.org/765.png" },
      awayTeam: { id: 805, name: "Belgium", crest: "https://crests.football-data.org/805.png" },
      group: "Group B",
      score: { fullTime: { home: null, away: null } }
    },
    {
      id: 1005,
      competition: { id: 2018, name: "European Championship" },
      utcDate: "2025-06-16T19:00:00Z",
      status: "SCHEDULED",
      homeTeam: { id: 799, name: "Croatia", crest: "https://crests.football-data.org/799.png" },
      awayTeam: { id: 782, name: "Denmark", crest: "https://crests.football-data.org/782.png" },
      group: "Group C",
      score: { fullTime: { home: null, away: null } }
    },
    {
      id: 1006,
      competition: { id: 2021, name: "Premier League" },
      utcDate: "2025-04-05T14:00:00Z",
      status: "SCHEDULED",
      homeTeam: { id: 57, name: "Arsenal", crest: "https://crests.football-data.org/57.png" },
      awayTeam: { id: 65, name: "Manchester City", crest: "https://crests.football-data.org/65.png" },
      group: null,
      score: { fullTime: { home: null, away: null } }
    },
    {
      id: 1007,
      competition: { id: 2021, name: "Premier League" },
      utcDate: "2025-04-05T16:30:00Z",
      status: "SCHEDULED",
      homeTeam: { id: 66, name: "Manchester United", crest: "https://crests.football-data.org/66.png" },
      awayTeam: { id: 61, name: "Chelsea", crest: "https://crests.football-data.org/61.png" },
      group: null,
      score: { fullTime: { home: null, away: null } }
    },
    {
      id: 1008,
      competition: { id: 2014, name: "La Liga" },
      utcDate: "2025-04-06T19:00:00Z",
      status: "SCHEDULED",
      homeTeam: { id: 86, name: "Real Madrid", crest: "https://crests.football-data.org/86.png" },
      awayTeam: { id: 81, name: "Barcelona", crest: "https://crests.football-data.org/81.png" },
      group: null,
      score: { fullTime: { home: null, away: null } }
    }
  ]
};

class FootballApiService {
  constructor() {
    this.useRealApi = false; // Set to true when you have a valid API key
  }

  // Fetch competitions (tournaments)
  async getCompetitions() {
    if (!this.useRealApi) {
      console.log('Using fallback competition data');
      return FALLBACK_DATA.competitions;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/competitions`, {
        headers: {
          'X-Auth-Token': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.competitions;
    } catch (error) {
      console.error('Error fetching competitions:', error);
      return FALLBACK_DATA.competitions;
    }
  }

  // Fetch matches for a specific competition
  async getMatchesByCompetition(competitionId) {
    if (!this.useRealApi) {
      console.log(`Using fallback match data for competition ${competitionId}`);
      return FALLBACK_DATA.matches.filter(match => match.competition.id === competitionId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/competitions/${competitionId}/matches`, {
        headers: {
          'X-Auth-Token': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.matches;
    } catch (error) {
      console.error(`Error fetching matches for competition ${competitionId}:`, error);
      return FALLBACK_DATA.matches.filter(match => match.competition.id === competitionId);
    }
  }

  // Fetch all upcoming matches across competitions
  async getUpcomingMatches() {
    if (!this.useRealApi) {
      console.log('Using fallback match data for upcoming matches');
      return FALLBACK_DATA.matches;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/matches`, {
        headers: {
          'X-Auth-Token': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.matches;
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      return FALLBACK_DATA.matches;
    }
  }

  // Fetch team information
  async getTeam(teamId) {
    if (!this.useRealApi) {
      console.log(`Using fallback team data for team ${teamId}`);
      // Find the team in our fallback data
      const team = FALLBACK_DATA.matches.find(match => 
        match.homeTeam.id === teamId || match.awayTeam.id === teamId
      );
      
      return team ? (team.homeTeam.id === teamId ? team.homeTeam : team.awayTeam) : null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/teams/${teamId}`, {
        headers: {
          'X-Auth-Token': API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching team ${teamId}:`, error);
      return null;
    }
  }

  // Format match data to our application's format
  formatMatch(match) {
    return {
      id: match.id,
      competition: {
        id: match.competition.id,
        name: match.competition.name,
        emblem: match.competition.emblem
      },
      date: new Date(match.utcDate),
      status: match.status,
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        crest: match.homeTeam.crest
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        crest: match.awayTeam.crest
      },
      group: match.group,
      score: match.score.fullTime
    };
  }
}

// Export a singleton instance
export const footballApiService = new FootballApiService();
