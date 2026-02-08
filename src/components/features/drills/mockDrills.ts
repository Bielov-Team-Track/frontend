import { Drill, DrillAnimation } from "./types";

// Sample animation for Butterfly Passing drill
const butterflyPassingAnimation: DrillAnimation = {
	speed: 800,
	keyframes: [
		{
			id: "kf1",
			players: [
				// Left line
				{ id: "p1", x: 100, y: 100, color: "#3b82f6", label: "1" },
				{ id: "p2", x: 100, y: 150, color: "#3b82f6", label: "2" },
				{ id: "p3", x: 100, y: 200, color: "#3b82f6", label: "3" },
				// Right line
				{ id: "p4", x: 300, y: 100, color: "#ef4444", label: "4" },
				{ id: "p5", x: 300, y: 150, color: "#ef4444", label: "5" },
				{ id: "p6", x: 300, y: 200, color: "#ef4444", label: "6" },
			],
			ball: { x: 100, y: 100 },
		},
		{
			id: "kf2",
			players: [
				// Player 1 moves right after passing
				{ id: "p1", x: 200, y: 100, color: "#3b82f6", label: "1" },
				{ id: "p2", x: 100, y: 150, color: "#3b82f6", label: "2" },
				{ id: "p3", x: 100, y: 200, color: "#3b82f6", label: "3" },
				// Right line
				{ id: "p4", x: 300, y: 100, color: "#ef4444", label: "4" },
				{ id: "p5", x: 300, y: 150, color: "#ef4444", label: "5" },
				{ id: "p6", x: 300, y: 200, color: "#ef4444", label: "6" },
			],
			ball: { x: 200, y: 100 },
		},
		{
			id: "kf3",
			players: [
				// Player 1 reaches right line
				{ id: "p1", x: 300, y: 250, color: "#3b82f6", label: "1" },
				{ id: "p2", x: 100, y: 150, color: "#3b82f6", label: "2" },
				{ id: "p3", x: 100, y: 200, color: "#3b82f6", label: "3" },
				// Player 4 receives and will pass
				{ id: "p4", x: 300, y: 100, color: "#ef4444", label: "4" },
				{ id: "p5", x: 300, y: 150, color: "#ef4444", label: "5" },
				{ id: "p6", x: 300, y: 200, color: "#ef4444", label: "6" },
			],
			ball: { x: 300, y: 100 },
		},
		{
			id: "kf4",
			players: [
				{ id: "p1", x: 300, y: 250, color: "#3b82f6", label: "1" },
				{ id: "p2", x: 100, y: 150, color: "#3b82f6", label: "2" },
				{ id: "p3", x: 100, y: 200, color: "#3b82f6", label: "3" },
				// Player 4 moves left after passing
				{ id: "p4", x: 200, y: 100, color: "#ef4444", label: "4" },
				{ id: "p5", x: 300, y: 150, color: "#ef4444", label: "5" },
				{ id: "p6", x: 300, y: 200, color: "#ef4444", label: "6" },
			],
			ball: { x: 200, y: 120 },
		},
		{
			id: "kf5",
			players: [
				{ id: "p1", x: 300, y: 250, color: "#3b82f6", label: "1" },
				// Player 2 receives
				{ id: "p2", x: 100, y: 150, color: "#3b82f6", label: "2" },
				{ id: "p3", x: 100, y: 200, color: "#3b82f6", label: "3" },
				// Player 4 reaches left line
				{ id: "p4", x: 100, y: 250, color: "#ef4444", label: "4" },
				{ id: "p5", x: 300, y: 150, color: "#ef4444", label: "5" },
				{ id: "p6", x: 300, y: 200, color: "#ef4444", label: "6" },
			],
			ball: { x: 100, y: 150 },
		},
	],
};

// Sample animation for Pepper Drill
const pepperDrillAnimation: DrillAnimation = {
	speed: 700,
	keyframes: [
		{
			id: "kf1",
			players: [
				{ id: "p1", x: 150, y: 150, color: "#3b82f6", label: "A" },
				{ id: "p2", x: 250, y: 150, color: "#ef4444", label: "B" },
			],
			ball: { x: 150, y: 130 },
		},
		{
			id: "kf2",
			players: [
				{ id: "p1", x: 150, y: 150, color: "#3b82f6", label: "A" },
				{ id: "p2", x: 250, y: 150, color: "#ef4444", label: "B" },
			],
			ball: { x: 200, y: 100 }, // Ball in air toward B
		},
		{
			id: "kf3",
			players: [
				{ id: "p1", x: 150, y: 150, color: "#3b82f6", label: "A" },
				{ id: "p2", x: 250, y: 140, color: "#ef4444", label: "B" }, // B moves to receive
			],
			ball: { x: 250, y: 130 }, // B digs
		},
		{
			id: "kf4",
			players: [
				{ id: "p1", x: 150, y: 150, color: "#3b82f6", label: "A" },
				{ id: "p2", x: 250, y: 150, color: "#ef4444", label: "B" },
			],
			ball: { x: 250, y: 90 }, // B sets to self
		},
		{
			id: "kf5",
			players: [
				{ id: "p1", x: 150, y: 150, color: "#3b82f6", label: "A" },
				{ id: "p2", x: 250, y: 145, color: "#ef4444", label: "B" }, // B attacks
			],
			ball: { x: 200, y: 100 }, // Ball going to A
		},
		{
			id: "kf6",
			players: [
				{ id: "p1", x: 150, y: 140, color: "#3b82f6", label: "A" }, // A digs
				{ id: "p2", x: 250, y: 150, color: "#ef4444", label: "B" },
			],
			ball: { x: 150, y: 130 },
		},
	],
};

export const MOCK_DRILLS: Drill[] = [
	{
		id: "d1",
		name: "Butterfly Passing",
		duration: 15,
		category: "Warmup",
		intensity: "Low",
		skills: ["Passing", "Conditioning"],
		description: "Two lines facing each other, continuous passing in a butterfly pattern.",
		instructions: [
			"Set up two lines of players facing each other, about 5-6 meters apart",
			"Player 1 passes to Player 2 across from them, then moves to the end of the opposite line",
			"Player 2 catches and passes to the next person in line, then follows their pass",
			"Continue the pattern creating a butterfly movement",
		],
		coachingPoints: [
			"Focus on platform angle and contact point",
			"Call the ball before passing",
			"Move quickly after passing - don't admire your pass",
			"Keep knees bent and stay low throughout",
		],
		variations: [
			"Increase distance between lines",
			"Add a setter in the middle for setting touch",
			"Use two balls for more intensity",
		],
		minPlayers: 6,
		maxPlayers: 16,
		animations: [butterflyPassingAnimation],
	},
	{
		id: "d2",
		name: "Box Hitting",
		duration: 20,
		category: "Technical",
		intensity: "Medium",
		skills: ["Attacking"],
		description: "Hitters rotate through different zones, attacking sets from various positions.",
		instructions: [
			"Set up hitting zones at positions 4, 3, and 2",
			"Setter at position 2/3 with a basket of balls",
			"Hitters line up and rotate through each position",
			"Each hitter gets 3-4 swings at each position before rotating",
		],
		coachingPoints: [
			"Emphasize proper approach footwork (left-right-left for right-handers)",
			"Arm swing should be high and fast",
			"Contact ball at highest point",
			"Follow through toward target",
		],
		variations: [
			"Add blockers for realistic game situation",
			"Call shot placement before hitting",
			"Vary set height and tempo",
		],
		equipment: [
			{ id: "e1", name: "Ball cart", isOptional: false, order: 0 },
			{ id: "e2", name: "Antenna markers", isOptional: true, order: 1 },
		],
		minPlayers: 4,
		maxPlayers: 12,
	},
	{
		id: "d3",
		name: "King of the Court",
		duration: 30,
		category: "Game",
		intensity: "High",
		skills: ["Attacking", "Defense"],
		description: "Competitive game where winning team stays on court, losers rotate off.",
		instructions: [
			"One side is the 'King' side, other side is the challenger side",
			"Rally is initiated with a free ball or down ball",
			"If King side wins, they stay and earn a point",
			"If challenger wins, they become the new King (no point yet)",
			"First team to reach target points wins",
		],
		coachingPoints: [
			"Emphasize competitive mentality",
			"Quick transitions between offense and defense",
			"Communication is key",
			"Play smart - keep ball in play",
		],
		variations: [
			"3v3 or 4v4 variations",
			"Start with serve instead of free ball",
			"Add specific rules (must hit to score, etc.)",
		],
		minPlayers: 6,
		maxPlayers: 18,
	},
	{
		id: "d4",
		name: "Serving Under Pressure",
		duration: 10,
		category: "Technical",
		intensity: "Medium",
		skills: ["Serving"],
		description: "Target serving with consequences for misses. Builds mental toughness.",
		instructions: [
			"Place targets in different zones of the court",
			"Players serve in sequence, aiming for specific targets",
			"Missing targets or serving errors result in consequences (sprints, pushups)",
			"Track successful serves to create competitive environment",
		],
		coachingPoints: [
			"Consistent toss is fundamental",
			"Breathe and have a routine before each serve",
			"Focus on contact point, not the target",
			"Simulate game pressure situations",
		],
		variations: [
			"Team competition format",
			"Progressive difficulty targets",
			"Time pressure - serve within 8 seconds",
		],
		equipment: [
			{ id: "e3", name: "Target cones", isOptional: false, order: 0 },
			{ id: "e4", name: "Hoops or towels for targets", isOptional: true, order: 1 },
		],
		minPlayers: 2,
		maxPlayers: 12,
	},
	{
		id: "d5",
		name: "3-Man Weave",
		duration: 15,
		category: "Warmup",
		intensity: "Medium",
		skills: ["Passing", "Conditioning", "Footwork"],
		description: "Classic warmup drill with three players passing and moving in a weave pattern.",
		instructions: [
			"Three players start at one end of the court",
			"Middle player starts with the ball",
			"Pass to one side, then run behind that player",
			"Continue weaving pattern down the court",
			"Finish with an attack or target pass",
		],
		coachingPoints: [
			"Lead the receiver with your pass",
			"Sprint after passing - don't jog",
			"Communicate with teammates",
			"Keep the ball moving quickly",
		],
		variations: [
			"Add a setting touch",
			"Finish with a quick attack",
			"Use two balls for advanced teams",
		],
		minPlayers: 3,
		maxPlayers: 15,
	},
	{
		id: "d6",
		name: "Block Transition",
		duration: 20,
		category: "Technical",
		intensity: "High",
		skills: ["Blocking", "Defense", "Footwork"],
		description: "Blockers practice transitioning from block to defensive positions.",
		instructions: [
			"Blocker starts at the net in blocking position",
			"Coach or player hits/tips ball in different directions",
			"Blocker lands and transitions to dig the ball",
			"Reset and repeat from different blocking positions",
		],
		coachingPoints: [
			"Land balanced with shoulders square to court",
			"Eyes find the hitter immediately after landing",
			"First step should be explosive and toward the ball",
			"Stay low during transition",
		],
		variations: [
			"Add a setter for transition attack",
			"Multiple blockers working together",
			"Random tip vs hard driven balls",
		],
		equipment: [
			{ id: "e5", name: "Hitting platform", isOptional: true, order: 0 },
		],
		minPlayers: 2,
		maxPlayers: 8,
	},
	{
		id: "d7",
		name: "Setter Decision Making",
		duration: 25,
		category: "Tactical",
		intensity: "Medium",
		skills: ["Setting"],
		description: "Setters practice reading blockers and making quick distribution decisions.",
		instructions: [
			"Set up with blockers showing different formations",
			"Passer sends ball to setter",
			"Blockers show their position just before the set",
			"Setter must read and set to the open hitter",
			"Rotate through different scenarios",
		],
		coachingPoints: [
			"Eyes on the block while hands receive the ball",
			"Quick decision - don't hold the ball",
			"Disguise your sets with consistent hand position",
			"Communicate with hitters pre-play",
		],
		variations: [
			"Add time pressure with a whistle",
			"Randomize pass quality",
			"Include back row options",
		],
		minPlayers: 5,
		maxPlayers: 10,
	},
	{
		id: "d8",
		name: "Pepper Drill",
		duration: 10,
		category: "Warmup",
		intensity: "Low",
		skills: ["Passing", "Setting", "Attacking"],
		description: "Partner drill cycling through pass, set, hit sequence.",
		instructions: [
			"Partners face each other about 4 meters apart",
			"Player A attacks (controlled) at Player B",
			"Player B digs to themselves, sets to themselves, attacks back",
			"Continue the rally as long as possible",
		],
		coachingPoints: [
			"Control over power - keep the ball playable",
			"Work on platform angles for digging",
			"Set high enough to give yourself time",
			"Wrist snap for controlled attacks",
		],
		variations: [
			"Add movement - slide after each contact",
			"One player only defends, other attacks",
			"Triangle pepper with three players",
		],
		minPlayers: 2,
		maxPlayers: 20,
		animations: [pepperDrillAnimation],
	},
	{
		id: "d9",
		name: "Six vs Six Scrimmage",
		duration: 30,
		category: "Game",
		intensity: "High",
		skills: ["Attacking", "Defense", "Blocking", "Serving", "Passing", "Setting"],
		description: "Full game scrimmage with rotation and scoring.",
		instructions: [
			"Two full teams of 6 players each",
			"Play with standard volleyball rules",
			"Rotate normally after winning serve",
			"Play to a set number of points or time limit",
		],
		coachingPoints: [
			"Apply skills learned in practice",
			"Communicate on every play",
			"Focus on specific team goals",
			"Play with game-like intensity",
		],
		variations: [
			"Wash games (must win by 2 in a row)",
			"Bonus points for specific plays",
			"Constraints (must hit line, no tips, etc.)",
		],
		minPlayers: 12,
		maxPlayers: 14,
	},
	{
		id: "d10",
		name: "Stretching & Cool Down",
		duration: 10,
		category: "Cooldown",
		intensity: "Low",
		skills: ["Conditioning"],
		description: "Dynamic stretches and foam rolling to prevent injury.",
		instructions: [
			"Start with light jogging to gradually lower heart rate",
			"Move through major muscle groups with static stretches",
			"Hold each stretch for 20-30 seconds",
			"Use foam rollers for any tight areas",
			"End with deep breathing and relaxation",
		],
		coachingPoints: [
			"Never stretch cold muscles",
			"Breathe deeply during stretches",
			"Don't bounce - smooth, controlled movements",
			"Focus on areas that were heavily used",
		],
		variations: [
			"Partner stretching for deeper stretches",
			"Yoga-based cool down",
			"Mental review of practice while stretching",
		],
		equipment: [
			{ id: "e6", name: "Foam rollers", isOptional: false, order: 0 },
			{ id: "e7", name: "Yoga mats", isOptional: true, order: 1 },
		],
		minPlayers: 1,
		maxPlayers: 30,
	},
	{
		id: "d11",
		name: "Serve Receive Rotation",
		duration: 20,
		category: "Technical",
		intensity: "Medium",
		skills: ["Passing", "Serving"],
		description: "Full rotation serve receive practice with live serving.",
		instructions: [
			"Set up 3-4 passers in serve receive formation",
			"Servers rotate through serving at different zones",
			"Passers work on calling the ball and passing to target",
			"Rotate passers after set number of serves",
		],
		coachingPoints: [
			"Communication is critical - call the ball early",
			"Move feet to get behind the ball",
			"Angle platform toward target",
			"Track the ball from server's hand",
		],
		equipment: [
			{ id: "e8", name: "Ball cart", isOptional: false, order: 0 },
		],
		minPlayers: 5,
		maxPlayers: 12,
	},
	{
		id: "d12",
		name: "Quick Attack Timing",
		duration: 15,
		category: "Technical",
		intensity: "High",
		skills: ["Setting", "Attacking", "Footwork"],
		description: "Middle hitters work on timing with setter for quick attacks.",
		instructions: [
			"Setter at net with passer feeding balls",
			"Middle hitter practices approach timing",
			"Focus on being in the air as setter contacts ball",
			"Vary between 1s (quick) and slides",
		],
		coachingPoints: [
			"Hitter should be in the air when setter touches ball",
			"Explosive first step toward the setter",
			"Arms back and ready before jumping",
			"Setter keeps sets tight to the net",
		],
		minPlayers: 3,
		maxPlayers: 8,
	},
];

export const getDrillById = (id: string): Drill | undefined => {
	return MOCK_DRILLS.find((drill) => drill.id === id);
};

export const filterDrills = (drills: Drill[], skills: string[]): Drill[] => {
	if (skills.length === 0) return drills;
	return drills.filter((drill) => drill.skills.some((skill) => skills.includes(skill)));
};
