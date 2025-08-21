import { Position } from "./Position"
import { Event } from "./Event"

export interface Payment {
  date: Date
  location: string
  positions: Position[]
  eventId: string
}

export interface UserPayment {
  event: Event
  amount: number
}