// Animation Editor constants

export const PLAYER_COLORS = [
	"#3b82f6", // blue
	"#ef4444", // red
	"#22c55e", // green
	"#a855f7", // purple
	"#f97316", // orange
	"#06b6d4", // cyan
	"#ec4899", // pink
	"#eab308", // yellow
]

export const PLAYER_LABEL_PRESETS: { label: string; description: string }[] = [
	{ label: "1", description: "Position 1" },
	{ label: "2", description: "Position 2" },
	{ label: "3", description: "Position 3" },
	{ label: "4", description: "Position 4" },
	{ label: "5", description: "Position 5" },
	{ label: "6", description: "Position 6" },
	{ label: "S", description: "Setter" },
	{ label: "OH", description: "Outside Hitter" },
	{ label: "MB", description: "Middle Blocker" },
	{ label: "OP", description: "Opposite" },
	{ label: "L", description: "Libero" },
	{ label: "C", description: "Coach" },
]

// Court dimensions - volleyball court is 9m wide x 18m long (1:2 ratio)
// Viewed from above with net running horizontally
export const COURT_WIDTH = 320
export const COURT_HEIGHT = 640
export const COURT_PADDING = 20
