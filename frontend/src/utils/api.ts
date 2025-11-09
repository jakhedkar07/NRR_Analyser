interface FormData {
  yourTeam: string;
  oppositionTeam: string;
  totalOvers: string;
  desiredPosition: string;
  tossResult: string;
  runsScored: string;
  oversFaced?: string;
  oversBowled?: string;
}

interface PredictNRRResponse {
  team: string;
  opponent: string;
  scenario: 'battingFirst' | 'bowlingFirst';
  requiredRange: [number, number];
  revisedNRRRange: [number, number];
  targetPosition?: number;
  message?: string;
}

function fetchWithTimeout(url: string, options: RequestInit, timeout = 10000): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]) as Promise<Response>;
}

export async function getTeams(): Promise<string[]> {
  try {
    const response = await fetchWithTimeout('/teams', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }, 5000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to fetch teams: ${response.status}`);
    }

    const data = await response.json();
    return data.teams;
  } catch (err) {
    if (err instanceof Error && err.message === 'Request timeout') {
      throw new Error('Backend server is not responding. Make sure it is running on port 3001.');
    }
    if (err instanceof Error && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      throw new Error('Cannot connect to backend server. Make sure it is running on port 3001.');
    }
    throw err;
  }
}

export async function predictNRR(data: FormData): Promise<PredictNRRResponse> {
  try {
    const response = await fetchWithTimeout('/predictNRR', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }, 30000);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `Failed to predict NRR: ${response.status}`);
    }

    return response.json();
  } catch (err) {
    if (err instanceof Error && err.message === 'Request timeout') {
      throw new Error('Backend server is not responding. Make sure it is running on port 3001.');
    }
    if (err instanceof Error && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
      throw new Error('Cannot connect to backend server. Make sure it is running on port 3001.');
    }
    throw err;
  }
}

export type { FormData, PredictNRRResponse };

