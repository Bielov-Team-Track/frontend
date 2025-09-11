// "use client";

// import React, { useEffect, useState } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { Location } from "@/lib/models/Event";
// import { createEvent as saveEventRequest } from "@/lib/requests/events";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { Event } from "@/lib/models/Event";
// import Avatar from "@/components/ui/avatar";
// import useUser from "@/hooks/useUser";
// import { UserProfile } from "@/lib/models/User";

// const schema = yup.object().shape({
//   startTime: yup.date().required("Start time is required"),
//   endTime: yup
//     .date()
//     .required("End time is required")
//     .test(
//       "is-greater",
//       "End time should be greater than start time",
//       function (value) {
//         const { startTime } = this.parent;
//         return value > startTime;
//       }
//     ),
//   location: yup.string().required("Location is required"),
//   name: yup.string().required("Name is required"),
//   approveGuests: yup.boolean(),
//   admins: yup.array().of(
//     yup.object().shape({
//       userId: yup.string().required(),
//       name: yup.string().required(),
//       email: yup.string().required().email(),
//     })
//   ),
// });

// function EventEditForm({ locations, event, children }: EventFormProps) {
//   const { userProfile } = useUser();

//   const defaultLocation = event?.location || locations[0];

//   const {
//     control,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       startTime: event?.startTime,
//       endTime: event?.endTime,
//       location: defaultLocation?.name ?? "",
//       name: defaultLocation?.name,
//       approveGuests: true,
//       admins: [] as UserProfile[],
//     },
//   });

//   const values = watch();

//   useEffect(() => {
//     if (
//       userProfile &&
//       values.admins &&
//       !values.admins?.find((a) => a?.email === userProfile?.email)
//     ) {
//       setValue("admins", [...values.admins, userProfile]);
//     }
//   }, [userProfile]);

//   const router = useRouter();

//   const saveEvent = async (data: any) => {
//     const event = {
//       startTime: data.startTime,
//       endTime: data.endTime,
//       location: locations.find((l) => l.id === data.location),
//       name: data.name,
//       approveGuests: data.approveGuests,
//       admins: data.admins,
//     };

//     await saveEventRequest(event);
//     router.push("/admin/events");
//   };

//   const getDuration = (startTime: string, endTime: string) => {
//     const start = new Date(`01/01/2000 ${startTime}`).getTime();
//     const end = new Date(`01/01/2000 ${endTime}`).getTime();
//     const diff = end - start;

//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

//     return `${hours}h ${minutes}m`;
//   };

//   return (
//     <form className="form" onSubmit={handleSubmit(saveEvent)}>
//       <div className="flex flex-col gap-2">
//         <label className="font-bold">Date</label>
//         <Controller
//           name="date"
//           control={control}
//           render={({ field }) => (
//             <input
//               {...field}
//               className="input input-bordered w-full"
//               type="date"
//             />
//           )}
//         />
//         {errors.date && <p className="text-error">{errors.date.message}</p>}
//       </div>
//       <div className="flex flex-col gap-2">
//         <label className="font-bold">Start time</label>
//         <Controller
//           name="startTime"
//           control={control}
//           render={({ field }) => (
//             <input
//               {...field}
//               className="input input-bordered w-full"
//               type="time"
//             />
//           )}
//         />
//         {errors.startTime && (
//           <p className="text-error">{errors.startTime.message}</p>
//         )}
//       </div>
//       <div className="flex flex-col gap-2">
//         <label className="font-bold">End time</label>
//         <Controller
//           name="endTime"
//           control={control}
//           render={({ field }) => (
//             <input
//               {...field}
//               className="input input-bordered w-full"
//               type="time"
//             />
//           )}
//         />
//         {errors.endTime && (
//           <p className="text-error">{errors.endTime.message}</p>
//         )}
//       </div>
//       {values.startTime && values.endTime && (
//         <div>Duration: {getDuration(values.startTime, values.endTime)}</div>
//       )}
//       <div className="flex flex-col gap-2">
//         <div className="flex justify-between">
//           <label className="font-bold">Location</label>
//           <Link href={"/locations/create"} className="link">
//             Create new
//           </Link>
//         </div>
//         <Controller
//           name="location"
//           control={control}
//           render={({ field }) => (
//             <select {...field} className="select select-bordered w-full">
//               {locations.map((l) => (
//                 <option key={l.id} value={l.id}>
//                   {l.name}
//                 </option>
//               ))}
//             </select>
//           )}
//         />
//         {errors.location && (
//           <p className="text-error">{errors.location.message}</p>
//         )}
//       </div>
//       <div className="flex flex-col gap-2">
//         <label className="font-bold">Name</label>
//         <Controller
//           name="name"
//           control={control}
//           render={({ field }) => (
//             <input
//               {...field}
//               className="input input-bordered w-full"
//               type="text"
//             />
//           )}
//         />
//         {errors.name && <p className="text-error">{errors.name.message}</p>}
//       </div>
//       <div className="flex flex-col gap-2">
//         <label className="font-bold">Admins</label>
//         <div>
//           {values.admins && values.admins.length > 0 ? (
//             values.admins.map((admin) => (
//               <div
//                 key={admin.id}
//                 className="bg-primary/90 text-primary-content rounded-md"
//               >
//                 <div className="collapse-title p-4 h-14 rounded-md bg-primary w-full flex justify-between">
//                   <div className="flex items-center gap-2">
//                     <Avatar profile={admin} />
//                     <span>{admin.name}</span>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div>No admins defined</div>
//           )}
//         </div>
//       </div>
//       <div className="flex items-center gap-2">
//         <Controller
//           name="approveGuests"
//           control={control}
//           render={({ field }) => (
//             <input {...field} className="checkbox" type="checkbox" />
//           )}
//         />
//         <label className="font-bold">Guests have to be approved</label>
//       </div>
//       {children}
//     </form>
//   );
// }

// type EventFormProps = {
//   locations: Location[];
//   event?: Event;
// } & React.PropsWithChildren;

// export default EventEditForm;
