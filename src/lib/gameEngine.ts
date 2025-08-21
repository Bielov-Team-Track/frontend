import { Position } from "./models/Position"
import { Team as TeamModel } from "./models/Team"

class TeamManager {
  rotate = (team: Team) => {
    team.rotation.push(team.rotation[0])
    team.rotation = team.rotation.slice(1, team.rotation.length)

    if (team.rotation[3].name == "Libero") {
      const currentMiddle = team.rotation.find(p => p.name.includes("Middle"))
      team.rotation[3] = team.positions.find(p => p.name.includes("Middle") && p.id != currentMiddle?.id)!;
    }
  }

  swapLibero = (team: Team) => {
    if (team.rotation[0].name.includes("Middle")) {
      team.rotation[0] = team.positions.find(p => p.name.includes("Libero"))!
    }
  }

  sortRotation = (team: Team) => {
    for (const positionName of team.initialRotation) {
      const position = team.positions.find(p => p.name == positionName)
      if (!position) {
        continue
      }

      team.rotation.push(position)
    }
  }
}

export class Team {
  initialRotation = ["Middle P1", "Setter", "Outside P1", "Middle P2", "Opposite", "Outside P2"]
  isServing = false
  name = ""
  points = 0
  rotation: Position[] = []
  positions: Position[] = []

  constructor(name: string, positions: Position[]) {
    this.positions = positions
    this.name = name
  }
}

export class GameState {
  team1: Team
  team2: Team

  constructor(team1: Team, team2: Team) {
    this.team1 = team1
    this.team2 = team2
  }
}

export default class GameEngine {
  gameStates: GameState[]
  teamManager = new TeamManager()

  constructor(team1Model: TeamModel, team2Model: TeamModel) {
    const team1 = new Team(team1Model.name, team1Model.positions!)
    const team2 = new Team(team2Model.name, team2Model.positions!)
    this.teamManager.sortRotation(team1)
    this.teamManager.sortRotation(team2)
    this.gameStates = [new GameState(team1, team2)]
  }

  getGameState = () => {
    return this.gameStates[this.gameStates.length - 1]
  }

  scorePoint = (teamName: string) => {
    const gameState = structuredClone(this.getGameState())

    let scoredTeam = gameState.team2
    let lostTeam = gameState.team1

    if (teamName == gameState.team1.name) {
      scoredTeam = gameState.team1
      lostTeam = gameState.team2
    }

    scoredTeam.points = scoredTeam.points + 1

    if (scoredTeam.isServing) {
      this.gameStates.push(gameState)
      return gameState;
    }

    if (this.checkGameEnd()) {
      this.endGame()
    }

    scoredTeam.isServing = true
    lostTeam.isServing = false
    this.teamManager.swapLibero(lostTeam)
    this.teamManager.rotate(scoredTeam)

    this.gameStates.push(gameState)
    return gameState
  }

  checkGameEnd = () => {
    const currentGameState = this.getGameState()
    if (Math.abs(currentGameState.team1.points - currentGameState.team2.points) > 1
      && (currentGameState.team1.points >= 25 || currentGameState.team2.points >= 25)) {
      return true
    }

    return false
  }

  endGame = () => {

  }
}