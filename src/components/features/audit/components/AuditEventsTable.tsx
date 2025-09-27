"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Event } from "@/lib/models/Event";
import { EventParticipant } from "@/lib/models/EventParticipant";
import { loadParticipants } from "@/lib/requests/events";
import { getFormattedDateWithDay } from "@/lib/utils/date";
import Link from "@/components/ui/link";
import {
  FaCheck as CheckIcon,
  FaExclamation as ExclamationIcon,
  FaSort as SortIcon,
  FaSortUp as SortUpIcon,
  FaSortDown as SortDownIcon,
} from "react-icons/fa";

type AuditEventsListProps = {
  events: Event[];
};

interface EventWithAuditData extends Event {
  participants?: EventParticipant[];
  balance?: number;
  auditStatus: "closed" | "pending";
}

const columnHelper = createColumnHelper<EventWithAuditData>();

const AuditEventsTable = ({ events }: AuditEventsListProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [participantsData, setParticipantsData] = useState<
    Record<string, EventParticipant[]>
  >({});

  // Load participants data and calculate balances
  const enrichedEvents = useMemo(async () => {
    const eventsWithData: EventWithAuditData[] = [];

    for (const event of events) {
      try {
        let participants = participantsData[event.id];
        if (!participants) {
          participants = await loadParticipants(event.id);
          setParticipantsData((prev) => ({
            ...prev,
            [event.id]: participants,
          }));
        }

        const unpaidParticipants = participants.filter((p) => !p.hasPaid);
        const balance = unpaidParticipants.length * event.costToEnter;
        const auditStatus =
          unpaidParticipants.length === 0 ? "closed" : "pending";

        eventsWithData.push({
          ...event,
          participants,
          balance,
          auditStatus,
        });
      } catch (error) {
        console.error(
          `Failed to load participants for event ${event.id}:`,
          error
        );
        eventsWithData.push({
          ...event,
          balance: 0,
          auditStatus: "pending",
        });
      }
    }

    return eventsWithData;
  }, [events, participantsData]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("auditStatus", {
        header: "",
        cell: (info) => {
          const status = info.getValue();
          return (
            <div className="flex items-center gap-2">
              {status === "closed" ? (
                <CheckIcon className="text-success" />
              ) : (
                <ExclamationIcon className="text-warning" />
              )}
              <span className="capitalize hidden lg:block">{status}</span>
            </div>
          );
        },
        filterFn: "equals",
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <Link
            href={`/dashboard/auditCa/${info.row.original.id}`}
            className="hover:underline !p-0"
          >
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("location.name", {
        header: "Location",
        cell: (info) => info.getValue() || "TBD",
        filterFn: "includesString",
        meta: {
          headerClassName: "hidden md:table-cell",
          cellClassName: "hidden md:table-cell",
        },
      }),
      columnHelper.accessor("startTime", {
        header: "Date",
        cell: (info) => getFormattedDateWithDay(info.getValue(), "short"),
        sortingFn: "datetime",
      }),
      columnHelper.accessor("balance", {
        header: "Balance",
        cell: (info) => {
          const balance = info.getValue();
          return (
            <span
              className={
                balance > 0 ? "text-warning font-semibold" : "text-success"
              }
            >
              ${balance?.toFixed(2) || "0.00"}
            </span>
          );
        },
        sortingFn: "basic",
        meta: {
          headerClassName: "hidden lg:table-cell",
          cellClassName: "hidden lg:table-cell",
        },
      }),
    ],
    []
  );

  const [tableData, setTableData] = useState<EventWithAuditData[]>([]);

  // Use effect to handle async data loading
  useMemo(() => {
    enrichedEvents.then((data) => setTableData(data));
  }, [enrichedEvents]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Events</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Status</label>
          <select
            className="select select-bordered select-sm"
            value={
              (table.getColumn("auditStatus")?.getFilterValue() as string) ?? ""
            }
            onChange={(e) =>
              table
                .getColumn("auditStatus")
                ?.setFilterValue(e.target.value || undefined)
            }
          >
            <option value="">All</option>
            <option value="closed">Closed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Location</label>
          <input
            className="input input-bordered input-sm"
            placeholder="Filter by location..."
            value={
              (table.getColumn("location.name")?.getFilterValue() as string) ??
              ""
            }
            onChange={(e) =>
              table.getColumn("location.name")?.setFilterValue(e.target.value)
            }
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto  bg-foreground rounded-lg">
        <table className="table table-zebra w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`cursor-pointer ${
                      header.column.columnDef.meta?.headerClassName || ""
                    }`}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className="flex items-center gap-2 select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getCanSort() && (
                          <span className="text-xs">
                            {{
                              asc: <SortUpIcon />,
                              desc: <SortDownIcon />,
                            }[header.column.getIsSorted() as string] ?? (
                              <SortIcon />
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cell.column.columnDef.meta?.cellClassName || ""}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {tableData.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No audit events found.
        </div>
      )}
    </div>
  );
};

export default AuditEventsTable;
