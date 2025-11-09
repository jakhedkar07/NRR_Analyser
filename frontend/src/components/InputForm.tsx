import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { predictNRR, getTeams, type FormData, type PredictNRRResponse } from '../utils/api';

interface FormDataState {
  yourTeam: string;
  oppositionTeam: string;
  totalOvers: string;
  desiredPosition: string;
  tossResult: string;
  runsScored: string;
  oversFaced: string;
  oversBowled: string;
}

function InputForm() {
  const [teams, setTeams] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormDataState>({
    yourTeam: '',
    oppositionTeam: '',
    totalOvers: '20',
    desiredPosition: '',
    tossResult: '',
    runsScored: '',
    oversFaced: '',
    oversBowled: ''
  });

  const [result, setResult] = useState<PredictNRRResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const hasFetchedTeams = useRef(false);

  useEffect(() => {
    if (hasFetchedTeams.current) return;
    
    hasFetchedTeams.current = true;
    
    async function fetchTeams() {
      try {
        const teamsList = await getTeams();
        setTeams(teamsList);
        setError(null);
      } catch (err) {
        setError('Failed to load teams. Make sure the backend server is running on port 3001.');
        console.error('Error loading teams:', err);
      } finally {
        setLoadingTeams(false);
      }
    }
    fetchTeams();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const submitData: FormData = {
        yourTeam: formData.yourTeam,
        oppositionTeam: formData.oppositionTeam,
        totalOvers: formData.totalOvers,
        desiredPosition: formData.desiredPosition,
        tossResult: formData.tossResult,
        runsScored: formData.runsScored
      };
      
      if (formData.tossResult === 'Batting First' && formData.oversFaced && formData.oversFaced.trim() !== '') {
        submitData.oversFaced = formData.oversFaced;
      }
      if (formData.tossResult === 'Bowling First' && formData.oversBowled && formData.oversBowled.trim() !== '') {
        submitData.oversBowled = formData.oversBowled;
      }
      
      const data = await predictNRR(submitData);
      setResult(data);
      setError(null);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Cannot connect to backend. Make sure the server is running on port 3001.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <h1 style={{ marginBottom: '20px', color: '#333' }}>CricHeroes NRR Predictor</h1>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Your Team
          </label>
          <select
            name="yourTeam"
            value={formData.yourTeam}
            onChange={handleChange}
            required
            disabled={loadingTeams}
            style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">{loadingTeams ? 'Loading teams...' : 'Select your team'}</option>
            {teams.map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Opposition Team
          </label>
          <select
            name="oppositionTeam"
            value={formData.oppositionTeam}
            onChange={handleChange}
            required
            disabled={loadingTeams}
            style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">{loadingTeams ? 'Loading teams...' : 'Select opposition team'}</option>
            {teams.filter(team => team !== formData.yourTeam).map(team => (
              <option key={team} value={team}>{team}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Total Overs per Match
          </label>
          <input
            type="number"
            name="totalOvers"
            value={formData.totalOvers}
            onChange={handleChange}
            required
            min="1"
            max="20"
            step="0.1"
            style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Desired Position in Points Table
          </label>
          <input
            type="number"
            name="desiredPosition"
            value={formData.desiredPosition}
            onChange={handleChange}
            required
            min="1"
            max="8"
            style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            Toss Result
          </label>
          <select
            name="tossResult"
            value={formData.tossResult}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">Select toss result</option>
            <option value="Batting First">Batting First</option>
            <option value="Bowling First">Bowling First</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
            {formData.tossResult === 'Batting First' ? 'Runs Scored' : 'Runs to Chase'}
          </label>
          <input
            type="number"
            name="runsScored"
            value={formData.runsScored}
            onChange={handleChange}
            required
            min="0"
            style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>

        {formData.tossResult === 'Batting First' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Overs Faced (Optional)
              <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal', marginLeft: '5px' }}>
                - Leave empty if used all {formData.totalOvers} overs
              </span>
            </label>
            <input
              type="number"
              name="oversFaced"
              value={formData.oversFaced}
              onChange={handleChange}
              min="0"
              max={formData.totalOvers || 20}
              step="0.1"
              placeholder={`e.g., 14.2 if all out in 14.2 overs (max ${formData.totalOvers || 20})`}
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <small style={{ display: 'block', marginTop: '5px', color: '#666', fontSize: '12px' }}>
              Enter only if your team got all out before using all overs (e.g., 14.2 means 14 overs + 2 balls)
            </small>
          </div>
        )}

        {formData.tossResult === 'Bowling First' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
              Overs Bowled by Your Team (Optional)
              <span style={{ fontSize: '12px', color: '#666', fontWeight: 'normal', marginLeft: '5px' }}>
                - Leave empty if bowled all {formData.totalOvers} overs
              </span>
            </label>
            <input
              type="number"
              name="oversBowled"
              value={formData.oversBowled}
              onChange={handleChange}
              min="0"
              max={formData.totalOvers || 20}
              step="0.1"
              placeholder={`e.g., 18.2 if opponent all out in 18.2 overs (max ${formData.totalOvers || 20})`}
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <small style={{ display: 'block', marginTop: '5px', color: '#666', fontSize: '12px' }}>
              Enter only if opponent got all out before using all overs (e.g., 18.2 means 18 overs + 2 balls)
            </small>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Calculating...' : 'Predict NRR'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fee', color: '#c33', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          {result.message ? (
            <p style={{ color: '#c33' }}>{result.message}</p>
          ) : (
            <>
              <h2 style={{ marginBottom: '15px', color: '#333' }}>Prediction Result</h2>
              {result.scenario === 'battingFirst' ? (
                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
                  <strong>Q-1a:</strong> If {result.team} score {formData.runsScored} runs in {formData.oversFaced || formData.totalOvers} overs
                  {formData.oversFaced && <span style={{ color: '#666', fontSize: '14px' }}> (all out early)</span>},
                  they need to restrict {result.opponent} between <strong>{result.requiredRange[0]}–{result.requiredRange[1]}</strong> runs in {formData.totalOvers} overs.
                  <br />
                  Revised NRR of {result.team}: <strong>{result.revisedNRRRange[0]}–{result.revisedNRRRange[1]}</strong>
                </p>
              ) : (
                <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
                  <strong>Q-1a:</strong> If {result.opponent} score {formData.runsScored} runs in {formData.oversBowled || formData.totalOvers} overs
                  {formData.oversBowled && <span style={{ color: '#666', fontSize: '14px' }}> (all out early)</span>},
                  {result.team} must chase <strong>{parseInt(formData.runsScored) + 1}</strong> runs within <strong>{result.requiredRange[0]}–{result.requiredRange[1]}</strong> overs to reach position {result.targetPosition}.
                  <br />
                  Revised NRR of {result.team}: <strong>{result.revisedNRRRange[0]}–{result.revisedNRRRange[1]}</strong>
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default InputForm;

