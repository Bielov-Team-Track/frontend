import { Controller } from "react-hook-form";
import { Input } from "@/components/ui";
import { FaCalendar, FaClock } from "react-icons/fa";
import { getDuration } from "@/lib/utils/date";
import { useEventFormContext } from "../context/EventFormContext";

export function TimeAndDateStep() {
  const { form } = useEventFormContext();
  const { control, formState: { errors }, watch } = form;
  const values = watch();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <span className="w-12 h-12 text-[48px] mx-auto mb-3">📅</span>
        <h2 className="text-2xl font-semibold text-base-content mb-2">
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
    </div>
  );
}