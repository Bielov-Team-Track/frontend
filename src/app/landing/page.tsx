"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
	Users,
	Calendar,
	Trophy,
	MapPin,
	ChevronRight,
	Star,
	Zap,
	CreditCard,
	Menu,
	X,
	Dumbbell,
	ClipboardList,
	UserCheck,
	Target,
	Play,
	Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Hero Section
function HeroSection() {
	return (
		<section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
			{/* Animated Background */}
			<div className="absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
				<div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
			</div>

			{/* Volleyball Court Lines (decorative) */}
			<div className="absolute inset-0 -z-10 opacity-5">
				<svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
					<line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" />
					<circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="0.5" />
				</svg>
			</div>

			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl mx-auto text-center">
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
						<span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
							<Zap className="w-4 h-4" />
							The Complete Volleyball Management Platform
						</span>
					</motion.div>

					<motion.h1
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
						Train Smarter.
						<br />
						<span className="text-primary">Compete Better.</span>
						<br />
						Win Together.
					</motion.h1>

					<motion.p
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
						From drill libraries to tournament brackets, Spike gives volleyball clubs everything they need to develop players, organize events, and
						build winning teams.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="flex flex-col sm:flex-row gap-4 justify-center">
						<Button asChild size="lg" className="text-base px-8 py-6">
							<Link href="/sign-up">
								Start Free Trial
								<ChevronRight className="w-5 h-5 ml-1" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg" className="text-base px-8 py-6">
							<Link href="/clubs">Explore Clubs</Link>
						</Button>
					</motion.div>

					{/* Stats */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.5 }}
						className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
						<div className="text-center">
							<div className="text-3xl sm:text-4xl font-bold text-primary">500+</div>
							<div className="text-sm text-muted-foreground mt-1">Drills</div>
						</div>
						<div className="text-center">
							<div className="text-3xl sm:text-4xl font-bold text-primary">50+</div>
							<div className="text-sm text-muted-foreground mt-1">Clubs</div>
						</div>
						<div className="text-center">
							<div className="text-3xl sm:text-4xl font-bold text-primary">1000+</div>
							<div className="text-sm text-muted-foreground mt-1">Players</div>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Scroll indicator */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 1, duration: 0.5 }}
				className="absolute bottom-8 left-1/2 -translate-x-1/2">
				<div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
					<motion.div
						animate={{ y: [0, 8, 0] }}
						transition={{ repeat: Infinity, duration: 1.5 }}
						className="w-1.5 h-1.5 rounded-full bg-primary"
					/>
				</div>
			</motion.div>
		</section>
	);
}

// Features Section
const features = [
	{
		icon: Dumbbell,
		title: "Drills Library",
		description: "500+ volleyball drills with animations, video demos, and equipment lists. Filter by skill, intensity, and category.",
		href: "/landing/features/drills",
		color: "bg-blue-500/10 text-blue-500",
	},
	{
		icon: ClipboardList,
		title: "Training Plans",
		description: "Build reusable training templates with sections, timing, and coach notes. Share plans across your club.",
		href: "/landing/features/training-plans",
		color: "bg-green-500/10 text-green-500",
	},
	{
		icon: Trophy,
		title: "Tournaments",
		description: "Organize group stages and elimination brackets with live scoring, standings, and automatic advancement.",
		href: "/landing/features/tournaments",
		color: "bg-yellow-500/10 text-yellow-500",
	},
	{
		icon: CreditCard,
		title: "Payments",
		description: "Collect event fees via Stripe or track cash. Multiple pricing models with automatic reminders.",
		href: "/landing/features/payments",
		color: "bg-purple-500/10 text-purple-500",
	},
	{
		icon: UserCheck,
		title: "Attendance Tracking",
		description: "Track participation across events with streak warnings, payment status, and detailed member statistics.",
		href: "/landing/features/attendance",
		color: "bg-orange-500/10 text-orange-500",
	},
	{
		icon: Users,
		title: "Club Management",
		description: "Manage members, teams, and groups with role-based permissions. Custom registration forms and invitations.",
		href: "/landing/features/clubs",
		color: "bg-teal-500/10 text-teal-500",
	},
	{
		icon: Calendar,
		title: "Event Scheduling",
		description: "Create matches, practices, and social events. Players can join, claim positions, and receive notifications.",
		href: "/landing/features/events",
		color: "bg-pink-500/10 text-pink-500",
	},
	{
		icon: MapPin,
		title: "Venue Management",
		description: "Save courts with addresses, directions, and photos. Assign venues to events with one click.",
		href: "/landing/features/venues",
		color: "bg-indigo-500/10 text-indigo-500",
	},
];

function FeaturesSection() {
	return (
		<section id="features" className="py-20 sm:py-28 bg-muted/30">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center max-w-3xl mx-auto mb-16">
					<motion.span
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						className="text-primary font-medium text-sm uppercase tracking-wider">
						Features
					</motion.span>
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
						className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
						Everything Your Club Needs
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
						className="text-muted-foreground text-lg">
						From training sessions to tournament finals, Spike handles it all.
					</motion.p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
					{features.map((feature, index) => (
						<motion.div
							key={feature.title}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.05 }}>
							<Link
								href={feature.href}
								className="group block p-6 rounded-xl bg-card hover:bg-card/80 border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer h-full">
								<div
									className={cn(
										"w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
										feature.color
									)}>
									<feature.icon className="w-6 h-6" />
								</div>
								<h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
								<p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
								<div className="mt-4 flex items-center text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity">
									Learn more <ChevronRight className="w-4 h-4 ml-1" />
								</div>
							</Link>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

// Highlight Features Section
function HighlightSection() {
	const highlights = [
		{
			title: "Visual Drill Animations",
			description:
				"Create step-by-step animations showing player movements, ball paths, and equipment placement. Perfect for explaining complex plays.",
			icon: Play,
		},
		{
			title: "Smart Training Templates",
			description:
				"Build training plans with sections like warmup, main work, and cooldown. Customize duration and notes per drill, then reuse across events.",
			icon: Layers,
		},
		{
			title: "Live Tournament Scoring",
			description:
				"Real-time score updates, automatic standings calculation, and bracket advancement. Spectators see results as they happen.",
			icon: Target,
		},
	];

	return (
		<section className="py-20 sm:py-28">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center max-w-3xl mx-auto mb-16">
					<motion.span
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						className="text-primary font-medium text-sm uppercase tracking-wider">
						Highlights
					</motion.span>
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
						className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
						Built for Volleyball
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
						className="text-muted-foreground text-lg">
						Features designed specifically for how volleyball clubs operate.
					</motion.p>
				</div>

				<div className="space-y-24">
					{highlights.map((highlight, index) => (
						<motion.div
							key={highlight.title}
							initial={{ opacity: 0, y: 40 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: 0.1 }}
							className={cn("grid grid-cols-1 lg:grid-cols-2 gap-12 items-center", index % 2 === 1 && "lg:flex-row-reverse")}>
							<div className={cn("space-y-6", index % 2 === 1 && "lg:order-2")}>
								<div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
									<highlight.icon className="w-7 h-7 text-primary" />
								</div>
								<h3 className="text-2xl sm:text-3xl font-bold">{highlight.title}</h3>
								<p className="text-muted-foreground text-lg leading-relaxed">{highlight.description}</p>
							</div>
							<div className={cn("relative", index % 2 === 1 && "lg:order-1")}>
								{/* Image Placeholder */}
								<div className="aspect-video rounded-2xl bg-gradient-to-br from-muted to-muted/50 border border-border/50 flex items-center justify-center">
									<div className="text-center p-8">
										<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
											<highlight.icon className="w-8 h-8 text-primary" />
										</div>
										<p className="text-muted-foreground text-sm">Feature screenshot placeholder</p>
									</div>
								</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

// How It Works Section
const steps = [
	{
		number: "01",
		title: "Create Your Club",
		description: "Set up your club with logo, venues, and custom registration forms. Invite coaches and admins to help manage.",
	},
	{
		number: "02",
		title: "Build Your Drill Library",
		description: "Add drills with instructions, animations, and equipment. Browse community drills or create your own.",
	},
	{
		number: "03",
		title: "Plan Training Sessions",
		description: "Create training templates with sections and timing. Load plans into events with one click.",
	},
	{
		number: "04",
		title: "Run Events & Tournaments",
		description: "Schedule matches, track attendance, collect payments, and run tournaments with live scoring.",
	},
];

function HowItWorksSection() {
	return (
		<section id="how-it-works" className="py-20 sm:py-28 bg-muted/30">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center max-w-3xl mx-auto mb-16">
					<motion.span
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						className="text-primary font-medium text-sm uppercase tracking-wider">
						How It Works
					</motion.span>
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
						className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
						From Setup to Spike
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
						className="text-muted-foreground text-lg">
						Get your club up and running in minutes.
					</motion.p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{steps.map((step, index) => (
						<motion.div
							key={step.number}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.1 }}
							className="relative">
							{/* Connector line */}
							{index < steps.length - 1 && (
								<div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
							)}
							<div className="text-5xl font-bold text-primary/20 mb-4">{step.number}</div>
							<h3 className="font-semibold text-xl mb-2">{step.title}</h3>
							<p className="text-muted-foreground">{step.description}</p>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

// Testimonials Section
const testimonials = [
	{
		quote: "The drill library and training plan features have transformed how we prepare for practice. Our coaches save hours every week.",
		author: "Maria K.",
		role: "Club Director",
		rating: 5,
	},
	{
		quote: "Running tournaments used to be chaos. Now with live scoring and automatic brackets, everything just works.",
		author: "Alex T.",
		role: "Tournament Organizer",
		rating: 5,
	},
	{
		quote: "Payment collection and attendance tracking in one place. No more spreadsheets, no more chasing people for money.",
		author: "David L.",
		role: "Club Treasurer",
		rating: 5,
	},
];

function TestimonialsSection() {
	return (
		<section className="py-20 sm:py-28">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center max-w-3xl mx-auto mb-16">
					<motion.span
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						className="text-primary font-medium text-sm uppercase tracking-wider">
						Testimonials
					</motion.span>
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.1 }}
						className="text-3xl sm:text-4xl font-bold mt-3 mb-4">
						Trusted by Clubs
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
						className="text-muted-foreground text-lg">
						See what volleyball organizations are saying about Spike.
					</motion.p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{testimonials.map((testimonial, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ delay: index * 0.1 }}
							className="p-6 rounded-xl bg-card border border-border/50">
							<div className="flex gap-1 mb-4">
								{[...Array(testimonial.rating)].map((_, i) => (
									<Star key={i} className="w-5 h-5 fill-primary text-primary" />
								))}
							</div>
							<blockquote className="text-foreground mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</blockquote>
							<div>
								<div className="font-medium">{testimonial.author}</div>
								<div className="text-sm text-muted-foreground">{testimonial.role}</div>
							</div>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
}

// CTA Section
function CTASection() {
	return (
		<section className="py-20 sm:py-28">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-12 lg:p-16 text-center">
					{/* Decorative elements */}
					<div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
					<div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />

					<div className="relative z-10">
						<h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">Ready to Elevate Your Club?</h2>
						<p className="text-primary-foreground/90 text-lg max-w-2xl mx-auto mb-8">
							Join volleyball clubs already using Spike to train smarter, compete better, and build winning programs.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button asChild size="lg" variant="secondary" className="text-base px-8 py-6 bg-white text-primary hover:bg-white/90">
								<Link href="/sign-up">
									Start Free Trial
									<ChevronRight className="w-5 h-5 ml-1" />
								</Link>
							</Button>
							<Button
								asChild
								size="lg"
								variant="outline"
								className="text-base px-8 py-6 border-white/30 text-primary-foreground hover:bg-white/10">
								<Link href="/clubs">Explore Clubs</Link>
							</Button>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	);
}

// Navbar
function Navbar() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const navLinks = [
		{ href: "#features", label: "Features" },
		{ href: "#how-it-works", label: "How It Works" },
		{ href: "/clubs", label: "Explore Clubs" },
	];

	return (
		<>
			<nav
				className={cn(
					"fixed top-4 left-4 right-4 z-50 rounded-2xl transition-all duration-300",
					isScrolled ? "bg-background/80 backdrop-blur-lg shadow-lg border border-border/50" : "bg-transparent"
				)}>
				<div className="max-w-7xl mx-auto px-4 sm:px-6">
					<div className="flex items-center justify-between h-16">
						{/* Logo */}
						<Link href="/landing" className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
								<Zap className="w-5 h-5 text-primary-foreground" />
							</div>
							<span className="font-bold text-xl">Spike</span>
						</Link>

						{/* Desktop Navigation */}
						<div className="hidden md:flex items-center gap-8">
							{navLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
									{link.label}
								</Link>
							))}
						</div>

						{/* Desktop CTA */}
						<div className="hidden md:flex items-center gap-3">
							<Button asChild variant="ghost">
								<Link href="/login">Log In</Link>
							</Button>
							<Button asChild>
								<Link href="/sign-up">Get Started</Link>
							</Button>
						</div>

						{/* Mobile Menu Button */}
						<button
							type="button"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
							aria-label="Toggle menu">
							{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
						</button>
					</div>
				</div>
			</nav>

			{/* Mobile Menu */}
			{isMobileMenuOpen && (
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -20 }}
					className="fixed inset-0 z-40 bg-background pt-24 px-4 md:hidden">
					<div className="flex flex-col gap-4">
						{navLinks.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => setIsMobileMenuOpen(false)}
								className="text-lg font-medium py-3 border-b border-border">
								{link.label}
							</Link>
						))}
						<div className="flex flex-col gap-3 pt-4">
							<Button asChild variant="outline" size="lg">
								<Link href="/login">Log In</Link>
							</Button>
							<Button asChild size="lg">
								<Link href="/sign-up">Get Started</Link>
							</Button>
						</div>
					</div>
				</motion.div>
			)}
		</>
	);
}

// Footer
function Footer() {
	const footerLinks = {
		Features: [
			{ label: "Drills Library", href: "/landing/features/drills" },
			{ label: "Training Plans", href: "/landing/features/training-plans" },
			{ label: "Tournaments", href: "/landing/features/tournaments" },
			{ label: "Payments", href: "/landing/features/payments" },
			{ label: "Attendance", href: "/landing/features/attendance" },
		],
		Product: [
			{ label: "All Features", href: "#features" },
			{ label: "How It Works", href: "#how-it-works" },
			{ label: "Pricing", href: "#" },
		],
		Legal: [
			{ label: "Privacy Policy", href: "/privacy-policy" },
			{ label: "Terms of Service", href: "/terms-of-service" },
		],
	};

	return (
		<footer className="border-t border-border/50 bg-muted/20">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-8">
					{/* Brand */}
					<div className="col-span-2 md:col-span-1">
						<Link href="/landing" className="flex items-center gap-2 mb-4">
							<div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
								<Zap className="w-5 h-5 text-primary-foreground" />
							</div>
							<span className="font-bold text-xl">Spike</span>
						</Link>
						<p className="text-sm text-muted-foreground max-w-xs">
							The complete volleyball management platform for clubs, coaches, and players.
						</p>
					</div>

					{/* Links */}
					{Object.entries(footerLinks).map(([category, links]) => (
						<div key={category}>
							<h4 className="font-semibold mb-4">{category}</h4>
							<ul className="space-y-3">
								{links.map((link) => (
									<li key={link.label}>
										<Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>

				<div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
					<p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Spike. All rights reserved.</p>
				</div>
			</div>
		</footer>
	);
}

// Main Landing Page
export default function LandingPage() {
	return (
		<div className="min-h-screen bg-background">
			<Navbar />
			<main>
				<HeroSection />
				<FeaturesSection />
				<HighlightSection />
				<HowItWorksSection />
				<TestimonialsSection />
				<CTASection />
			</main>
			<Footer />
		</div>
	);
}
