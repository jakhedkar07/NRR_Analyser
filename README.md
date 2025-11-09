# CricHeroes NRR Predictor

A full-stack web application that predicts Net Run Rate (NRR) requirements for IPL teams to achieve desired positions in the points table.

## Features

- **NRR Prediction**: Calculate required run ranges to achieve target table positions
- **Dual Scenarios**: Support for both batting first and bowling first scenarios
- **Precise Calculations**: Balls-based NRR calculation for accuracy
- **Optional Parameters**: Handle early dismissals and partial overs
- **Real-time Results**: Instant predictions with detailed ranges


## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Node.js (Vanilla HTTP Server)
- **Testing**: Vitest (Frontend), Jest (Backend)
- **Data**: JSON-based points table

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The backend server runs on `http://localhost:3001`

### Frontend Setup

1. Ensure backend is running (see above)

2. Navigate to frontend directory:
```bash
cd frontend
```

3. Install dependencies:
```bash
npm install
```

4. Start development server:
```bash
npm run dev
```

The frontend runs on `http://localhost:3000`

![Setup Instructions](./images/setup.png)

## Usage

1. Start the backend server first
2. Start the frontend development server
3. Open `http://localhost:3000` in your browser
4. Fill in the form:
   - Select your team and opponent
   - Enter total overs per match
   - Enter desired position (1-8)
   - Select toss result (Batting First / Bowling First)
   - Enter runs scored
   - Optionally enter overs faced/bowled if applicable
5. Click "Predict NRR" to see results

![Usage Guide](./images/usage.png)

## API Endpoints

### GET /teams

Returns list of all teams from the points table.

**Response:**
```json
{
  "teams": [
    "Rajasthan Royals",
    "Mumbai Indians",
    "Chennai Super Kings",
    ...
  ]
}
```

### POST /predictNRR

Predicts required run range for desired position.

**Request Body:**
```json
{
  "yourTeam": "Rajasthan Royals",
  "oppositionTeam": "Delhi Capitals",
  "totalOvers": "20",
  "desiredPosition": "3",
  "tossResult": "Batting First",
  "runsScored": "150",
  "oversFaced": "14.2"
}
```

**Response:**
```json
{
  "team": "Rajasthan Royals",
  "opponent": "Delhi Capitals",
  "scenario": "battingFirst",
  "requiredRange": [70, 80],
  "revisedNRRRange": [0.45, 0.48],
  "targetPosition": 3
}
```

## How It Works

The application uses brute-force simulation to find all possible match outcomes that achieve the desired position:

1. **Input Processing**: Validates and parses user inputs
2. **Simulation**: Tests all possible opponent/team scores
3. **NRR Calculation**: Uses balls-based precision for accurate calculations
4. **Ranking**: Sorts teams by points and NRR after each simulation
5. **Range Finding**: Identifies min/max values that achieve target position

## NRR Calculation

Net Run Rate is calculated using the formula:

NRR = (Runs For / Overs Faced) - (Runs Against / Overs Bowled)


The application converts overs to balls internally for precision:
- 18.2 overs = 18 × 6 + 2 = 110 balls
- Ensures accurate decimal calculations

## Testing

### Backend Tests
cd backend
npm test


### Backend
The backend runs directly with Node.js:
cd backend
node server.js


## Features in Detail

### Batting First Scenario
- Enter runs scored by your team
- Optionally enter overs faced if all out early
- System calculates required opponent run range

### Bowling First Scenario
- Enter runs scored by opponent
- Optionally enter overs bowled if opponent all out early
- System calculates required team run range to chase

![Feature Details](./images/features.png)

## Error Handling

The application handles various error scenarios:
- Missing required fields
- Invalid team selections
- Network connectivity issues
- Server errors
- Impossible position targets

**Note**: This application uses in-memory data and does not persist changes. All calculations are performed server-side for accuracy.
