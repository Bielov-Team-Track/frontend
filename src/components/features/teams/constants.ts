import { VolleyballPosition } from "@/lib/models/Club";

export const VOLLEYBALL_POSITIONS_OPTIONS: {
	value: VolleyballPosition;
	label: string;
}[] = [
	{ value: VolleyballPosition.Setter, label: "Setter" },
	{ value: VolleyballPosition.OutsideHitter, label: "Outside Hitter" },
	{ value: VolleyballPosition.OppositeHitter, label: "Opposite Hitter" },
	{ value: VolleyballPosition.MiddleBlocker, label: "Middle Blocker" },
	{ value: VolleyballPosition.Libero, label: "Libero" },
];

export const COURT_POSITIONS = [
	{ id: "P4", label: "OH1", name: "Outside Hitter 1", x: "20%", y: "30%", position: VolleyballPosition.OutsideHitter },
	{ id: "P3", label: "MB1", name: "Middle Blocker 1", x: "50%", y: "30%", position: VolleyballPosition.MiddleBlocker },
	{ id: "P2", label: "OPP", name: "Opposite Hitter", x: "80%", y: "30%", position: VolleyballPosition.OppositeHitter },
	{ id: "P5", label: "OH2", name: "Outside Hitter 2", x: "20%", y: "70%", position: VolleyballPosition.OutsideHitter },
	{ id: "P6", label: "MB2", name: "Middle Blocker 2", x: "50%", y: "70%", position: VolleyballPosition.MiddleBlocker },
	{ id: "P1", label: "S", name: "Setter", x: "80%", y: "70%", position: VolleyballPosition.Setter },
];
