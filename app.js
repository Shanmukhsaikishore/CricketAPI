const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'cricketMatchDetails.db')
app.use(express.json())

let db = null
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running')
    })
  } catch (e) {
    console.log(`DB Error ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//API-5

app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getMatchesOfSpecPlayerQuery = `
  select 
  match_details.match_id as matchId,
  match_details.match as match,
  match_details.year as year
  from match_details natural join player_match_score 
  where player_match_score.player_id = ${playerId}`
  const responseArr = await db.all(getMatchesOfSpecPlayerQuery)
  response.send(responseArr)
})

//API-6
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getPlayersOfSpecMatchQuery = `
  select 
  player_details.player_id as playerId,
  player_details.player_name as playerName
  from player_details natural join player_match_score
  where player_match_score.match_id = ${matchId};`
  const responseArr = await db.all(getPlayersOfSpecMatchQuery)
  response.send(responseArr)
})

//API-7

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getStatsQuery = `
  select 
  player_details.player_id as playerId,
  player_details.player_name as playerName,
  sum(player_match_score.score) as totalScore,
  sum(player_match_score.fours) as totalFours,
  sum(player_match_score.sixes) as totalSixes
  from player_details natural join player_match_score
  where player_details.player_id = ${playerId}
  group by player_details.player_id;`

  const responseArr = await db.get(getStatsQuery)
  response.send(responseArr)
})

//API-1
app.get('/players/', async (request, response) => {
  const getQuery = `select player_id as playerId,
  player_name as playerName
  from player_details;`
  const responseArr = await db.all(getQuery)
  response.send(responseArr)
})

//API-2
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getQuery = `select player_id as playerId,
  player_name as playerName
  from player_details 
  where player_id = ${playerId};`
  const responseArr = await db.get(getQuery)
  response.send(responseArr)
})

//API-3
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName} = playerDetails
  const putQuery = `
  update
  player_details
  set
    player_name='${playerName}'
  where player_id = ${playerId};`
  await db.run(putQuery)
  response.send('Player Details Updated')
})

//API-4
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const getQuery = `select match_id as matchId,
  match,
  year
  from match_details 
  where match_id = ${matchId};`
  const responseArr = await db.get(getQuery)
  response.send(responseArr)
})

module.exports = app
