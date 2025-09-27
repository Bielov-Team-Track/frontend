import { CreateEvent, EventFormat, EventType, PlayingSurface, SurfaceOptions } from "@/lib/models/Event";
import { Unit, PricingModel } from "@/lib/models/EventBudget";
import { EventFormData } from "../validation/eventValidationSchema";

export function transformFormDataToCreateEvent(data: EventFormData): CreateEvent {
  return {
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime),
    location: {
      name: data.location.name,
      address: data.location.address,
      city: data.location.city,
      country: data.location.country,
      postalCode: data.location.postalCode,
      latitude: data.location.latitude,
      longitude: data.location.longitude,
    },
    budget: {
      cost: data.budget.cost,
      payToJoin: data.budget.payToJoin,
      pricingModel: data.budget.pricingModel,
      dropoutDeadlineHours: data.budget.dropoutDeadlineHours,
      minUnitsForBudget: data.budget.minUnitsForBudget,
    },
    name: data.name,
    approveGuests: !!data.approveGuests,
    teamsNumber:
      data.eventFormat === EventFormat.Open ? 0 : Number(data.teamsNumber),
    eventFormat: data.eventFormat,
    registrationUnit: data.registrationUnit,
    type: data.type,
    surface: data.surface,
    isPrivate: !!data.isPrivate,
  };
}

export function getDefaultFormValues() {
  return {
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Tomorrow + 2 hours
    location: {
      name: "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
      latitude: undefined,
      longitude: undefined,
    },
    name: "",
    approveGuests: false,
    teamsNumber: 3,
    courtsNumber: 1,
    costToEnter: 0,
    type: EventType.CasualPlay,
    eventFormat: EventFormat.TeamsWithPositions,
    registrationUnit: Unit.Individual,
    surface: PlayingSurface.Indoor,
    isPrivate: false,
    capacity: null,
    description: "",
    payToEnter: false,
    ignoreBudget: false,
    budget: {
      pricingModel: PricingModel.Individual,
      cost: 0,
      payToJoin: false,
      minUnitsForBudget: undefined,
      dropoutDeadlineHours: undefined,
    },
  };
}