'use client'

import GameEngine, { GameState } from '@/lib/gameEngine';
import React, { useEffect, useRef, useState } from 'react'
import { loadTeams } from '@/lib/requests/teams';
import { Team } from '@/lib/models/Team';
import { Team as GameTeam } from "@/lib/gameEngine"

function GamesPage({ params }: { params: { eventId: string; }; }) {
  const eventId = params.eventId;
  const [teams, setTeams] = useState<Team[]>()
  const [gameEngine, setGameEngine] = useState<GameEngine>();

  useEffect(() => {
    if (!eventId) {
      return
    }

    loadTeams(eventId).then(teams => setTeams(teams))
  }, [eventId])

  useEffect(() => {
    if (!teams) {
      return
    }

    setGameEngine(new GameEngine(teams[0], teams[1]))
  }, [teams])


  const maindiv = useRef<HTMLDivElement>(null);
  const startGames = () => {
    if (!maindiv.current) {
      return
    }
    maindiv.current.requestFullscreen();
  }

  return (
    <div>
      <div>
        <button className='btn w-full' onClick={startGames}>Start Games</button>
      </div>
      <div ref={maindiv} className='w-[100vw] h-[100vh]'>
        {gameEngine && <Score gameEngine={gameEngine} />}
      </div>
    </div>
  )
}

function Score({ gameEngine }: { gameEngine: GameEngine }) {
  const [gameState, setGameState] = useState<GameState>(gameEngine.getGameState())

  const scorePoint = (teamName: string) => {
    const currentGameState = gameEngine.scorePoint(teamName)
    setGameState(currentGameState!)
  }

  return (
    <div className='w-full h-full flex flex-col [&>*:nth-child(odd)]:bg-primary [&>*:nth-child(even)]:bg-secondary'>
      <ScoreTile team={gameState.team1} onPointScored={scorePoint} />
      <ScoreTile team={gameState.team2} onPointScored={scorePoint} />
    </div>
  )
}

function ScoreTile({ team, onPointScored }: { team: GameTeam, onPointScored: Function }) {
  return (
    <div className='h-1/2 w-full flex justify-center items-center text-[20vh] relative' onClick={() => onPointScored(team.name)}>
      {team.points}
      <div className='text-base font-bold absolute bottom-4 flex flex-col'>
        {team.rotation.map((p, idx) => <span key={p.id}>{idx + 1} {p.name}</span>)}
      </div>
    </div>)
}

export default GamesPage