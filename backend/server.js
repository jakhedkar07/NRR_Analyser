const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { simulateRangeForDesiredPosition } = require('./utils/rankUtils');

const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data', 'iplTable.json');

function loadIPLData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading IPL data:', error);
    return [];
  }
}

function sendResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function handlePredictNRR(req, res) {
  let body = '';

  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', () => {
    try {
      const requestData = JSON.parse(body);
      const {
        yourTeam,
        oppositionTeam,
        totalOvers,
        desiredPosition,
        tossResult,
        runsScored,
        oversFaced,
        oversBowled
      } = requestData;

      if (!yourTeam || !oppositionTeam || !totalOvers || !desiredPosition || !tossResult || runsScored === undefined) {
        sendResponse(res, 400, { error: 'Missing required fields' });
        return;
      }

      const iplTable = loadIPLData();
      const scenario = tossResult === 'Batting First' ? 'battingFirst' : 'bowlingFirst';

      const parsedOversFaced = oversFaced !== undefined && oversFaced !== null && oversFaced !== '' 
        ? parseFloat(oversFaced) 
        : null;
      const parsedOversBowled = oversBowled !== undefined && oversBowled !== null && oversBowled !== '' 
        ? parseFloat(oversBowled) 
        : null;

      const result = simulateRangeForDesiredPosition(
        yourTeam,
        oppositionTeam,
        parseInt(desiredPosition),
        scenario,
        parseInt(runsScored),
        parseFloat(totalOvers),
        iplTable,
        parsedOversFaced,
        parsedOversBowled
      );

      sendResponse(res, 200, result);
    } catch (error) {
      console.error('Error processing request:', error);
      sendResponse(res, 500, { error: error.message });
    }
  });
}

function handleGetTeams(req, res) {
  try {
    const startTime = Date.now();
    const iplTable = loadIPLData();
    
    if (!Array.isArray(iplTable) || iplTable.length === 0) {
      console.error('IPL table is empty or invalid');
      sendResponse(res, 500, { error: 'IPL table data is empty or invalid' });
      return;
    }
    
    const teams = iplTable.map(team => team.team).filter(team => team);
    
    if (teams.length === 0) {
      console.error('No teams found in IPL table');
      sendResponse(res, 500, { error: 'No teams found in IPL table' });
      return;
    }
    
    const duration = Date.now() - startTime;
    console.log(`GET /teams - ${teams.length} teams returned in ${duration}ms`);
    sendResponse(res, 200, { teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    sendResponse(res, 500, { error: `Failed to fetch teams: ${error.message}` });
  }
}

function handleOptions(req, res) {
  sendResponse(res, 200, {});
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${pathname}`);

  if (method === 'OPTIONS') {
    handleOptions(req, res);
    return;
  }

  if (pathname === '/teams' && method === 'GET') {
    handleGetTeams(req, res);
  } else if (pathname === '/predictNRR' && method === 'POST') {
    handlePredictNRR(req, res);
  } else {
    sendResponse(res, 404, { error: 'Not found' });
  }
});

server.on('clientError', (error, socket) => {
  console.error('Client error:', error);
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  
  try {
    const testData = loadIPLData();
    if (testData && testData.length > 0) {
      console.log(`Loaded ${testData.length} teams from IPL table`);
    } else {
      console.warn('Warning: IPL table is empty or could not be loaded');
    }
  } catch (error) {
    console.error('Error loading IPL data on startup:', error);
  }
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the other server or use a different port.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});
