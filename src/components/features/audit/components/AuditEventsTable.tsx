"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { loadParticipants } from "@/lib/api/events";
import { getFormattedDateWithDay } from "@/lib/utils/date";
import { getFormatedCurrency } from "@/lib/utils/currency";
import { Loader } from "@/components";

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
    const router = useRouter();
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
					
					const paidCount = participants.filter(
						(p) => p.payment?.status === "completed",
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
						error,
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
				cell: (info) => info.getValue(),
				meta: {
					cellClassName: "font-medium text-white",
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
					cellClassName: "hidden xl:table-cell text-muted",
				},
			}),
			columnHelper.accessor("startTime", {
				header: "Date",
				cell: (info) => getFormattedDateWithDay(info.getValue(), "short"),
				sortingFn: "datetime",
				meta: {
					headerClassName: "hidden lg:table-cell",
					cellClassName: "hidden lg:table-cell text-muted",
				},
			}),
			columnHelper.display({
				id: "participants",
				header: "Participants",
				cell: (info) => {
					const row = info.row.original;
					return (
						<span className="text-muted">
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
					const currency = info.row.original.paymentConfig?.currency || "gbp";
					return (
						<span className="font-bold text-yellow-500">
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
					const currency = info.row.original.paymentConfig?.currency || "gbp";
					return (
						<span className="font-bold text-green-500">
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
					const currency = info.row.original.paymentConfig?.currency || "gbp";
					return (
						<div className="flex gap-2">
							<span className="font-bold text-yellow-500">
								{getFormatedCurrency(balance.amountOwed!, currency)}
							</span>
							<span className="text-muted">|</span>
							<span className="font-bold text-green-500">
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
		[],
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
			<div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
                <Loader />
                <p className="text-muted">Loading event data...</p>
			</div>
		);
	}

	if (tableData.length === 0) {
		return (
			<div className="p-12 text-center">
				<div className="text-5xl mb-4 opacity-50">✅</div>
				<h3 className="text-lg font-semibold text-white mb-2">
					No Outstanding Payments
				</h3>
				<p className="text-sm text-muted">
					All your events have been paid in full. Great work!
				</p>
			</div>
		);
	}

	return (
		<div>
			<div className="p-6 border-b border-border">
				<h2 className="text-lg font-semibold text-white">
					Events with Outstanding Balances
				</h2>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className="bg-surface border-b border-border">
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className={`text-xs font-medium text-muted uppercase tracking-wider py-3 px-4 ${
											header.column.columnDef.meta?.headerClassName || ""
										} ${header.column.getCanSort() ? "cursor-pointer hover:text-white" : ""}`}
										onClick={header.column.getToggleSortingHandler()}
									>
										{header.isPlaceholder ? null : (
											<div className="flex items-center gap-2">
												{flexRender(
													header.column.columnDef.header,
													header.getContext(),
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
								className="border-b border-border hover:bg-hover transition-colors cursor-pointer group"
								onClick={() => router.push(`/dashboard/audit/${row.original.id}`)}
							>
								{row.getVisibleCells().map((cell) => (
									<td
										key={cell.id}
										className={`py-4 px-4 text-sm ${
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
