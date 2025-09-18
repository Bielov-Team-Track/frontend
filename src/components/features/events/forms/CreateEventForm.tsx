"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  CreateEvent,
  EventType,
  Location,
  PlayingSurface,
  EventFormat,
} from "@/lib/models/Event";
import { createEvent } from "@/lib/requests/events";
import { useRouter } from "next/navigation";
import { Event } from "@/lib/models/Event";
import "react-datepicker/dist/react-datepicker.css";
import { getDuration } from "@/lib/utils/date";
import { useMutation } from "@tanstack/react-query";
import {
  Button,
  Loader,
  Input,
  Select,
  TextArea,
  Checkbox,
} from "@/components/ui";
import {
  FaChevronLeft,
  FaCalendar,
  FaClock,
  FaMapMarkerAlt,
  FaVolleyballBall,
  FaUsers,
  FaDollarSign,
} from "react-icons/fa";
import { Map } from "@/components";
import AddressAutocomplete from "@/components/ui/address-autocomplete";
import { APIProvider } from "@vis.gl/react-google-maps";

const eventTypeOptions = [
  { value: EventType.CasualPlay, label: "Casual" },
  { value: EventType.Tournament, label: "Tournament" },
];

const eventFormatOptions = [
  { value: EventFormat.Open, label: "Open (No Teams - Individual Join)" },
  { value: EventFormat.OpenTeams, label: "Open Teams (Generic Players)" },
  {
    value: EventFormat.TeamsWithPositions,
    label: "Teams with Positions (Volleyball Positions)",
  },
];

const surfaceOptions = [
  { value: PlayingSurface.Indoor, label: "Indoor" },
  { value: PlayingSurface.Grass, label: "Grass" },
  { value: PlayingSurface.Beach, label: "Beach" },
];

const schema = yup.object().shape({
  startTime: yup
    .date()
    .required("Start time is required")
    .min(new Date(), "Please choose future date and time"),
  endTime: yup
    .date()
    .required("End time is required")
    .min(new Date(), "Please choose future date and time")
    .test(
      "is-greater",
      "End time should be greater than start time",
      function (value) {
        const { startTime } = this.parent as any;
        const start = new Date(startTime);
        const end = new Date(value);
        return end > start;
      }
    ),
  location: yup
    .object()
    .shape({
      name: yup.string().required("Location name is required"),
      address: yup.string().optional(),
      city: yup.string().optional(),
      country: yup.string().optional(),
      postalCode: yup.string().optional(),
      latitude: yup.number().optional(),
      longitude: yup.number().optional(),
    })
    .required("Location is required"),
  name: yup.string().required("Name is required"),
  approveGuests: yup.boolean(),
  teamsNumber: yup.number().when("eventFormat", {
    is: (eventFormat: EventFormat) => eventFormat !== EventFormat.Open,
    then: (schema) =>
      schema
        .required("Number of teams is required")
        .min(1, "Number of teams should be greater than 0"),
    otherwise: (schema) => schema.notRequired(),
  }),
  courtsNumber: yup
    .number()
    .required("Courts number is required")
    .min(1, "Courts should be at least 1"),
  type: yup
    .mixed<EventType>()
    .oneOf(Object.values(EventType) as EventType[])
    .required("Type is required"),
  eventFormat: yup
    .mixed<EventFormat>()
    .oneOf(Object.values(EventFormat) as EventFormat[])
    .required("Event format is required"),
  surface: yup
    .mixed<PlayingSurface>()
    .oneOf(Object.values(PlayingSurface) as PlayingSurface[])
    .required("Surface is required"),
  isPrivate: yup.boolean().required(),
  capacity: yup
    .number()
    .nullable()
    .transform((v, o) => (o === "" ? null : v))
    .min(1, "Must be at least 1")
    .optional(),
  costToEnter: yup
    .number()
    .required("Cost is required")
    .min(0, "Cost should be non-negative"),
  description: yup.string().optional(),
  payToEnter: yup.boolean().required("Pay to enter is required").default(false),
});

function CreateEventForm({ locations, event }: CreateEventFormProps) {
  const [step, setStep] = useState(1);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    trigger,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      startTime: event?.startTime || new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
      endTime:
        event?.endTime ||
        new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // Default to tomorrow + 2 hours
      location: {
        name: "",
        address: "",
        city: "",
        country: "",
        postalCode: "",
        latitude: undefined,
        longitude: undefined,
      },
      name: event?.name ?? "",
      approveGuests: false,
      teamsNumber: 3,
      courtsNumber: 1,
      costToEnter: 0,
      type: EventType.CasualPlay,
      eventFormat: EventFormat.TeamsWithPositions,
      surface: PlayingSurface.Indoor,
      isPrivate: false,
      capacity: null,
      description: "",
    },
  });

  const values = watch();

  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const parseAddressComponents = (place: google.maps.places.PlaceResult) => {
    const components = place.address_components || [];
    const locationData: Partial<Location> = {
      name: place.name || "",
    };

    components.forEach((component) => {
      const types = component.types;
      const longName = component.long_name;
      const shortName = component.short_name;

      if (types.includes("street_number")) {
        locationData.address =
          longName + (locationData.address ? " " + locationData.address : "");
      } else if (types.includes("route")) {
        locationData.address =
          (locationData.address ? locationData.address + " " : "") + longName;
      } else if (types.includes("locality")) {
        locationData.city = longName;
      } else if (types.includes("country")) {
        locationData.country = longName;
      } else if (types.includes("postal_code")) {
        locationData.postalCode = longName;
      }
    });

    // Set coordinates if available
    if (place.geometry?.location) {
      locationData.latitude = place.geometry.location.lat();
      locationData.longitude = place.geometry.location.lng();
    }

    return locationData;
  };

  const handleAddressSelected = (address: string) => {
    // This is kept for backward compatibility with simple address string
    setValue("location.name", address.split(",")[0]);
    setValue("location.address", address);
  };

  const handleMapPositionChanged = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    setValue("location.latitude", lat);
    setValue("location.longitude", lng);
    console.log("Map position changed:", lat, lng);
  };

  // Creator will be auto-added as admin by backend

  const router = useRouter();
  const {
    mutate: submitEvent,
    isPending,
    isError,
  } = useMutation({
    mutationFn: async (eventData: CreateEvent) => {
      return await createEvent(eventData);
    },
  });

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const handlePopState = () => {
        setStep((prevStep) => Math.max(1, prevStep - 1));
      };

      window.addEventListener("popstate", handlePopState);

      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, []);

  const saveEvent = async (data: any) => {
    const payload: CreateEvent = {
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
      name: data.name,
      approveGuests: !!data.approveGuests,
      teamsNumber:
        data.eventFormat === EventFormat.Open ? 0 : Number(data.teamsNumber),
      eventFormat: data.eventFormat,
      courtsNumber: Number(data.courtsNumber),
      cost: Number(data.costToEnter),
      type: data.type,
      surface: data.surface,
      isPrivate: !!data.isPrivate,
      capacity: data.capacity === "" ? null : Number(data.capacity),
      payToEnter: !!data.payToEnter,
    };

    submitEvent(payload, {
      onSuccess: () => {
        router.push("/dashboard/events/my");
      },
    });
  };

  const nextStep = async (e: any) => {
    e.preventDefault();
    const stepValidationFields: { [key: number]: any[] } = {
      1: ["name", "type", "surface"],
      2: ["startTime", "endTime"],
      3: ["location"],
      4: ["eventFormat", "courtsNumber", "cost"],
    };

    let fieldsToValidate = stepValidationFields[step];
    console.log("Current values:", values);

    console.log("Fields being validated:", fieldsToValidate);
    // For step 4, add teamsNumber validation only if eventFormat is not Open
    if (step === 4 && Number(values.eventFormat) !== EventFormat.Open) {
      fieldsToValidate = [...fieldsToValidate, "teamsNumber"];
    }

    const isValid = await trigger(fieldsToValidate);

    // Debug validation
    if (!isValid) {
      console.log("Validation failed for step", step);
      console.log("Current errors:", errors);
    }

    if (isValid) {
      setStep(step + 1);
      router.push(`#step${step + 1}`);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      router.push(`#step${step - 1}`); // Update the URL with the previous step
    }
  };

  const getLocationName = (id: string) => {
    const location = locations.find((l) => l.id === id);
    return location?.name;
  };

  const renderValues = () => {
    return (
      <div className="space-y-2">
        {values.startTime && step > 2 && (
          <div className="flex items-center gap-2">
            <span>🕐</span>
            <span>Start: {new Date(values.startTime).toLocaleString()}</span>
          </div>
        )}
        {values.endTime && step > 2 && (
          <div className="flex items-center gap-2">
            <span>🕐</span>
            <span>End: {new Date(values.endTime).toLocaleString()}</span>
          </div>
        )}
        {values.endTime && values.startTime && step > 2 && (
          <div className="flex items-center gap-2">
            <span>⏱️</span>
            <span>
              Duration: {getDuration(values.startTime, values.endTime)}
            </span>
          </div>
        )}
        {values.location?.address && step > 3 && (
          <div className="flex items-center gap-2">
            <span>🗺️</span>
            <span>
              Location: {values.location.name || values.location.address}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-hidden">
      {/* Progress Bar */}
      <div className="p-12">
        <div className="flex justify-between text-xs text-base-content/60 mb-2">
          <span>Event Details</span>
          <span>Time & Date</span>
          <span>Location</span>
          <span>Settings</span>
          <span>Review</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-accent h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      <form className="relative p-6" onSubmit={handleSubmit(saveEvent)}>
        {isPending && (
          <Loader className="absolute inset-0 bg-black/55 rounded-xl z-50" />
        )}

        {isError && (
          <div className="bg-error/10 border border-error/20 text-error p-4 rounded-lg mb-6">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm opacity-80">
              We&apos;re working on it. Please try again.
            </p>
          </div>
        )}

        {/* Step 1: Event Details */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FaVolleyballBall className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-base-content mb-2">
                Event Details
              </h2>
              <p className="text-base-content/60">
                Let&apos;s start with the basic information about your event
              </p>
            </div>

            <div className="grid gap-6">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    label="Event Name"
                    placeholder="e.g., Sunday Beach Volleyball Tournament"
                    leftIcon={<FaVolleyballBall />}
                    error={errors.name?.message}
                    helperText="Give your event a catchy and descriptive name"
                    required
                  />
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Event Type"
                      placeholder="Select event type"
                      leftIcon={<FaVolleyballBall />}
                      options={eventTypeOptions}
                      error={errors.type?.message}
                      required
                    />
                  )}
                />

                <Controller
                  name="surface"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Playing Surface"
                      placeholder="Select surface"
                      options={surfaceOptions}
                      error={errors.surface?.message}
                      required
                    />
                  )}
                />
              </div>

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    label="Description (Optional)"
                    placeholder="Describe your event, rules, what to bring, etc..."
                    maxLength={500}
                    showCharCount
                    minRows={3}
                    helperText="Help participants know what to expect"
                  />
                )}
              />
            </div>

            <div className="flex justify-end pt-6">
              <Button
                variant="primary"
                size="lg"
                onClick={nextStep}
                rightIcon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                }
              >
                Next Step
              </Button>
            </div>
          </div>
        )}
        {/* Step 2: Time & Date */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <FaCalendar className="w-12 h-12 text-primary mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-base-content mb-2">
                Time & Date
              </h2>
              <p className="text-base-content/60">
                When will your event start and end?
              </p>
            </div>

            <div className="grid gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="startTime"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="datetime-local"
                      label="Start Date & Time"
                      leftIcon={<FaCalendar />}
                      error={errors.startTime?.message}
                      helperText="Choose when your event begins"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      required
                    />
                  )}
                />

                <Controller
                  name="endTime"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="datetime-local"
                      label="End Date & Time"
                      leftIcon={<FaClock />}
                      error={errors.endTime?.message}
                      helperText="Choose when your event ends"
                      value={
                        field.value
                          ? new Date(field.value).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                      required
                    />
                  )}
                />
              </div>

              {values.startTime && values.endTime && (
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary-content">
                      <FaCalendar className="w-5 h-5" />
                      <span className="font-semibold">
                        Start: {new Date(values.startTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-primary-content">
                      <FaClock className="w-5 h-5" />
                      <span className="font-semibold">
                        End: {new Date(values.endTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-primary-content">
                      <FaClock className="w-5 h-5" />
                      <span className="font-semibold">
                        Duration:{" "}
                        {getDuration(
                          new Date(values.startTime),
                          new Date(values.endTime)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-6">
              <Button
                variant="ghost"
                size="md"
                onClick={prevStep}
                leftIcon={<FaChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={nextStep}
                rightIcon={
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                }
              >
                Next Step
              </Button>
            </div>
          </div>
        )}
        {/* Steps 3-5: Simplified remaining steps */}
        {step >= 3 && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              {step === 3 && (
                <FaMapMarkerAlt className="w-12 h-12 text-primary mx-auto mb-3" />
              )}
              {step === 4 && (
                <FaUsers className="w-12 h-12 text-primary mx-auto mb-3" />
              )}
              {step === 5 && (
                <FaVolleyballBall className="w-12 h-12 text-primary mx-auto mb-3" />
              )}
              <h2 className="text-xl font-semibold text-base-content mb-2">
                {step === 3 && "Location"}
                {step === 4 && "Event Settings"}
                {step === 5 && "Review & Create"}
              </h2>
              <p className="text-base-content/60">
                {step === 3 && "Where will your event take place?"}
                {step === 4 && "Configure teams, participants, and pricing"}
                {step === 5 && "Review your event details and create"}
              </p>
            </div>

            {step === 3 && (
              <>
                <div className="grid gap-6">
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <APIProvider
                        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
                      >
                        <AddressAutocomplete
                          value={field.value?.address || ""}
                          onChange={(address) => {
                            handleAddressSelected(address);
                          }}
                          onPlaceSelected={(place) => {
                            const locationData = parseAddressComponents(place);

                            // Set all location fields from parsed data
                            Object.entries(locationData).forEach(
                              ([key, value]) => {
                                if (value !== undefined) {
                                  setValue(`location.${key}` as any, value);
                                }
                              }
                            );

                            // Update map position if place has geometry
                            if (place.geometry?.location) {
                              const lat = place.geometry.location.lat();
                              const lng = place.geometry.location.lng();
                              handleMapPositionChanged(lat, lng);
                              console.log(
                                "Selected place with parsed data:",
                                locationData
                              );
                            }
                          }}
                          label="Address"
                          placeholder="e.g., 12 Taylors Court, London"
                          error={errors.location?.address?.message}
                          required
                        />
                      </APIProvider>
                    )}
                  />
                </div>
                <div>
                  <span className="text-sm text-primary-content/60">
                    You can select the exact location by clicking on the map
                  </span>
                  <Map
                    defaultAddress={values.location?.address}
                    onAddressSelected={handleAddressSelected}
                    onPositionChanged={handleMapPositionChanged}
                  />
                </div>
              </>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <Controller
                  name="eventFormat"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      label="Event Format"
                      placeholder="Select event format"
                      leftIcon={<FaVolleyballBall />}
                      options={eventFormatOptions}
                      error={errors.eventFormat?.message}
                    />
                  )}
                />
                {Number(values.eventFormat) !== EventFormat.Open && (
                  <Controller
                    name="teamsNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        label="Number of Teams"
                        leftIcon={<FaUsers />}
                        error={errors.teamsNumber?.message}
                        min="1"
                      />
                    )}
                  />
                )}

                <Controller
                  name="costToEnter"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      label="Event Cost ($)"
                      leftIcon={<FaDollarSign />}
                      error={errors.costToEnter?.message}
                      min="0"
                      step="0.01"
                      helperText="Set to 0 for free events"
                      required
                    />
                  )}
                />

                <Controller
                  name="payToEnter"
                  control={control}
                  render={() => (
                    <Checkbox
                      label="Pay to enter event"
                      error={errors.payToEnter?.message}
                      helperText="Check if participants need to pay to join this event"
                    />
                  )}
                />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="bg-base-50 rounded-lg p-6 space-y-4">
                  <h3 className="font-semibold text-lg text-base-content mb-4">
                    Event Summary
                  </h3>
                  {renderValues()}
                </div>

                {/* Event Timeline */}
                <div className="bg-base-50 rounded-lg p-6">
                  <h3 className="font-semibold text-lg text-base-content mb-4">
                    Event Timeline
                  </h3>
                  <div className="bg-white rounded-lg p-4 border border-base-300">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-primary" />
                        <span className="font-medium">
                          {values.startTime.toLocaleDateString("en-GB", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-base-content/70">
                      <div className="flex items-center gap-1">
                        <FaClock className="text-primary" />
                        <span>
                          {values.startTime.toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {values.endTime.toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <span>
                        Duration:{" "}
                        {getDuration(values.startTime, values.endTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Map */}
                {values.location?.address && (
                  <div className="bg-base-50 rounded-lg p-6">
                    <h3 className="font-semibold text-lg text-base-content mb-4">
                      Event Location
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 border border-base-300">
                        <div className="flex items-start gap-3">
                          <FaMapMarkerAlt className="text-primary mt-1" />
                          <div>
                            <h4 className="font-medium text-base-content">
                              {values.location.name}
                            </h4>
                            <p className="text-sm text-base-content/70">
                              {values.location.address}
                            </p>
                            <p className="text-sm text-base-content/70">
                              {[
                                values.location.city,
                                values.location.postalCode,
                              ]
                                .filter(Boolean)
                                .join(", ")}
                            </p>
                            {values.location.country && (
                              <p className="text-sm text-base-content/70">
                                {values.location.country}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <Map
                        defaultAddress={values.location.address}
                        readonly={true}
                      />
                    </div>
                  </div>
                )}

                <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg">
                  <p className="text-warning-content text-sm">
                    <strong>Please review:</strong> Make sure all information is
                    correct before creating your event. You can edit some
                    details later, but major changes may affect participants.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                variant="ghost"
                size="md"
                onClick={prevStep}
                leftIcon={<FaChevronLeft className="w-4 h-4" />}
              >
                Previous
              </Button>

              {step < 5 ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={nextStep}
                  rightIcon={
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  }
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  disabled={isPending}
                  loading={isPending}
                  rightIcon={<FaVolleyballBall className="w-4 h-4" />}
                >
                  {isPending ? "Creating..." : "Create Event"}
                </Button>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

type CreateEventFormProps = {
  locations: Location[];
  event?: Event;
} & React.PropsWithChildren;

export default CreateEventForm;
