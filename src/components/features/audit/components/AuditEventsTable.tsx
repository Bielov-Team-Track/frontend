"use client";

import { useMemo, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from "@tanstack/react-table";
import { Event } from "@/lib/models/Event";
import { EventParticipant } from "@/lib/models/EventParticipant";
import { loadParticipants } from "@/lib/requests/events";
import { getFormattedDateWithDay } from "@/lib/utils/date";
import { getFormatedCurrency } from "@/lib/utils/currency";
import Link from "@/components/ui/link";
import classNames from "classnames";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    headerClassName?: string;
    cellClassName?: string;
  }
}

type AuditEventsListProps = {
  events: Event[];
};

interface Balance {
  amountOwed?: number;
  amountCollected?: number;
}

interface EventWithAuditData extends Event {
  participants?: EventParticipant[];
  totalParticipants?: number;
  paidParticipants?: number;
  balance?: Balance;
}

const columnHelper = createColumnHelper<EventWithAuditData>();

const AuditEventsTable = ({ events }: AuditEventsListProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [participantsData, setParticipantsData] = useState<
    Record<string, EventParticipant[]>
  >({});
  const [tableData, setTableData] = useState<EventWithAuditData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load participants data and calculate balances
  useMemo(() => {
    const loadData = async () => {
      setIsLoading(true);
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
          console.log("Participants for event", event.id, participants);
          const paidCount = participants.filter(
            (p) => p.payment?.status === "completed"
          ).length;
          const amountOwed = participants.reduce((sum, p) => {
            if (p.payment?.status !== "completed" && p.payment?.amount) {
              return sum + p.payment.amount;
            }
            return sum;
          }, 0);

          const amountCollected = participants.reduce((sum, p) => {
            if (p.payment?.status === "completed" && p.payment?.amount) {
              return sum + p.payment.amount;
            }
            return sum;
          }, 0);

          // Determine if overdue (event is in the past with outstanding payments)
          const isPast = new Date(event.startTime) < new Date();

          eventsWithData.push({
            ...event,
            participants,
            totalParticipants: participants.length,
            paidParticipants: paidCount,
            balance: {
              amountOwed,
              amountCollected,
            },
          });
        } catch (error) {
          console.error(
            `Failed to load participants for event ${event.id}:`,
            error
          );
          eventsWithData.push({
            ...event,
            balance: {
              amountOwed: 0,
              amountCollected: 0,
            },
            totalParticipants: 0,
            paidParticipants: 0,
          });
        }
      }

      setTableData(eventsWithData);
      setIsLoading(false);
    };

    loadData();
  }, [events, participantsData]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Event",
        cell: (info) => (

            info.getValue()

        ),
        meta: {
          cellClassName: "max-w-[100px]",
        },
      }),
      columnHelper.accessor("location.name", {
        header: "Location",
        cell: (info) => (
          <span className="text-ellipsis whitespace-nowrap ">
            {info.getValue() || "TBD"}
          </span>
        ),
        meta: {
          headerClassName: "hidden xl:table-cell",
          cellClassName: "hidden xl:table-cell",
        },
      }),
      columnHelper.accessor("startTime", {
        header: "Date",
        cell: (info) => getFormattedDateWithDay(info.getValue(), "short"),
        sortingFn: "datetime",
      }),
      columnHelper.display({
        id: "participants",
        header: "Participants",
        cell: (info) => {
          const row = info.row.original;
          return (
            <span className="text-neutral/60">
              {row.paidParticipants}/{row.totalParticipants} paid
            </span>
          );
        },
        meta: {
          headerClassName: "hidden lg:table-cell",
          cellClassName: "hidden lg:table-cell",
        },
      }),
      columnHelper.accessor("balance.amountOwed", {
        header: "Amount Owed",
        cell: (info) => {
          const amount = info.getValue() || 0;
          // Get currency from event budget or default to GBP
          const currency = info.row.original.budget?.currency || "gbp";
          return (
            <span className="font-bold text-base text-error">
              {getFormatedCurrency(amount, currency)}
            </span>
          );
        },
        meta: {
          headerClassName: "hidden xl:table-cell",
          cellClassName: "hidden xl:table-cell",
        },
        sortingFn: "basic",
      }),
      columnHelper.accessor("balance.amountCollected", {
        header: "Amount Paid",
        cell: (info) => {
          const amount = info.getValue() || 0;
          // Get currency from event budget or default to GBP
          const currency = info.row.original.budget?.currency || "gbp";
          return (
            <span className="font-bold text-success">
              {getFormatedCurrency(amount, currency)}
            </span>
          );
        },
        meta: {
          headerClassName: "hidden xl:table-cell",
          cellClassName: "hidden xl:table-cell",
        },
        sortingFn: "basic",
      }),
      columnHelper.accessor("balance", {
        header: "Balance",
        cell: (info) => {
          const balance = info.getValue() as Balance;
          // Get currency from event budget or default to GBP
          const currency = info.row.original.budget?.currency || "gbp";
          return (
            <div className="flex ">
              <span className="font-bold text-warning">
                {getFormatedCurrency(balance.amountOwed!, currency)}
              </span>
              <span>|</span>
              <span className="font-bold text-success">
                {getFormatedCurrency(balance.amountCollected!, currency)}
              </span>
            </div>
          );
        },
        meta: {
          headerClassName: "xl:hidden table-cell",
          cellClassName: "xl:hidden table-cell",
        },
        sortingFn: "basic",
      }),
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">
            Events with Outstanding Balances
          </h2>
        </div>
        <div className="overflow-x-auto rounded-md border border-neutral/20">
          <div className="bg-stone-900 bg-neutral/5 p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <span className="loading loading-spinner loading-lg"></span>
              <p className="text-neutral/60">Loading event data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (tableData.length === 0) {
    return (
      <div className="bg-base-200/50 rounded-xl border border-base-300 p-12 text-center">
        <div className="text-5xl mb-4 opacity-50">✅</div>
        <h3 className="text-lg font-semibold text-neutral/80 mb-2">
          No Outstanding Payments
        </h3>
        <p className="text-sm text-neutral/60">
          All your events have been paid in full. Great work!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">
          Events with Outstanding Balances
        </h2>
      </div>

      <div className="overflow-x-auto rounded-md border border-neutral/20">
        <table className="table bg-stone-900 bg-neutral/5 w-full">
          <thead className="bg-stone-900">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`text-xs font-semibold text-neutral/60 uppercase tracking-wider ${
                      header.column.columnDef.meta?.headerClassName || ""
                    } ${header.column.getCanSort() ? "cursor-pointer" : ""}`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
              <tr
                key={row.id}
                className="hover:bg-neutral/10 border border-neutral/20 transition-colors cursor-pointer"
                onClick={() => {
                  window.location.href = `/dashboard/audit/${row.original.id}`;
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`py-5 ${
                      cell.column.columnDef.meta?.cellClassName || ""
                    }`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditEventsTable;
