import { loadEventsByFilter } from "@/lib/api/events";
import { getUserProfile } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Activity,
    ArrowUpRight,
    Calendar,
    ChevronRight,
    Clock,
    Crown,
    MapPin,
    MoreHorizontal,
    Plus,
    Search,
    TrendingUp,
    Trophy,
    Users,
    Zap
} from "lucide-react";
import Image from "next/image";

// --- Components ---

function StatCard({ title, value, subtext, icon: Icon, trend }: any) {
    return (
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-accent/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-lg bg-white/5 text-muted group-hover:text-accent group-hover:bg-accent/10 transition-colors">
                    <Icon size={20} />
                </div>
                {trend && (
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1 bg-emerald-400/10 px-2 py-1 rounded-full">
                        <TrendingUp size={12} /> {trend}
                    </span>
                )}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-muted">{title}</div>
            {subtext && <div className="text-xs text-muted/60 mt-2">{subtext}</div>}
        </div>
    );
}

function EventCard({ event, isHosting }: { event: any; isHosting?: boolean }) {
    const date = new Date(event.startDate);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const time = date.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' });

    return (
        <Link href={`/dashboard/events/${event.id}`} className="block">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/[0.07] hover:border-white/10 transition-all group cursor-pointer">
                {/* Date Badge */}
                <div className="flex flex-col items-center justify-center min-w-[3.5rem] h-14 rounded-lg bg-background-dark border border-white/10 group-hover:border-accent/30 transition-colors">
                    <span className="text-lg font-bold text-white leading-none">{day}</span>
                    <span className="text-[10px] font-bold text-muted uppercase mt-0.5">{month}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white truncate group-hover:text-accent transition-colors">
                            {event.title}
                        </h4>
                        {isHosting && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent/20 text-accent border border-accent/20">
                                HOST
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1">
                            <Clock size={12} /> {time}
                        </span>
                        {event.location && (
                            <span className="flex items-center gap-1 truncate max-w-[150px]">
                                <MapPin size={12} /> {event.location.name || "TBD"}
                            </span>
                        )}
                    </div>
                </div>

                {/* Avatar Stack (Placeholder) */}
                <div className="hidden sm:flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-background-dark bg-white/10 flex items-center justify-center text-[10px] text-white font-bold">
                            {/* Placeholder for user avatars */}
                        </div>
                    ))}
                </div>
                
                <ChevronRight size={18} className="text-muted group-hover:text-white transition-colors" />
            </div>
        </Link>
    );
}

function QuickAction({ label, icon: Icon, href, colorClass }: any) {
    return (
        <Link 
            href={href}
            className={`
                flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-dashed border-white/20 
                hover:border-solid hover:bg-white/5 transition-all cursor-pointer group h-full
            `}
        >
            <div className={`p-3 rounded-full ${colorClass} text-white group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <span className="text-sm font-medium text-muted group-hover:text-white transition-colors">{label}</span>
        </Link>
    );
}

export default async function DashboardPage() {
    const userProfile = await getUserProfile();

    if (!userProfile) {
        redirect("/login");
    }

    // Fetch Data
    const [userEvents, adminEvents] = await Promise.all([
        loadEventsByFilter({ participantId: userProfile.userId! }),
        loadEventsByFilter({ organizerId: userProfile.userId! })
    ]);

    const activeEvents = [
        ...(adminEvents || []).map(e => ({ ...e, isHosting: true })),
        ...(userEvents || []).map(e => ({ ...e, isHosting: false }))
    ].filter(e => !e.canceled).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const nextEvent = activeEvents[0];
    const upcomingEvents = activeEvents.slice(1, 4);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 18) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="min-h-full p-6 lg:p-10 space-y-8 font-sans">
            
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                        {getGreeting()}, {userProfile.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-muted mt-1">
                        Here's what's happening with your volleyball schedule today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/events/create" className="btn bg-accent hover:bg-accent/90 text-white border-none shadow-lg shadow-orange-500/20 gap-2">
                        <Plus size={18} /> New Event
                    </Link>
                </div>
            </div>

            {/* --- STATS GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Upcoming Matches" 
                    value={activeEvents.length} 
                    icon={Calendar} 
                    subtext="Next 7 days"
                />
                <StatCard 
                    title="Season Win Rate" 
                    value="68%" 
                    icon={Trophy} 
                    trend="+5.2%"
                    subtext="Last 20 games"
                />
                <StatCard 
                    title="Club Rank" 
                    value="#4" 
                    icon={Crown} 
                    subtext="Falcons A Team"
                />
                <StatCard 
                    title="Player Rating" 
                    value="8.4" 
                    icon={Zap} 
                    subtext="Top 10% in region"
                />
            </div>

            {/* --- MAIN CONTENT SPLIT --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8 h-full">
                
                {/* LEFT COL (Events & Schedule) */}
                <div className="xl:col-span-2 space-y-8">
                    
                    {/* Next Match Highlight */}
                    {nextEvent ? (
                        <div className="rounded-3xl relative overflow-hidden bg-gradient-to-br from-indigo-900 to-purple-900 p-8 text-white border border-white/10 shadow-2xl">
                            <div className="absolute top-0 right-0 p-32 bg-accent/20 blur-[100px] rounded-full pointer-events-none" />
                            
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-md border border-white/10">
                                            UPCOMING
                                        </span>
                                        {nextEvent.isHosting && (
                                            <span className="px-3 py-1 rounded-full bg-accent text-white text-xs font-bold border border-accent">
                                                HOSTING
                                            </span>
                                        )}
                                    </div>
                                    <h2 className="text-3xl font-bold mb-2">{nextEvent.title}</h2>
                                    <div className="flex flex-wrap gap-4 text-white/80 text-sm">
                                        <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
                                            <Calendar size={14} /> 
                                            {new Date(nextEvent.startDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                        </span>
                                        <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
                                            <Clock size={14} /> 
                                            {new Date(nextEvent.startDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {nextEvent.location && (
                                            <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg">
                                                <MapPin size={14} /> 
                                                {nextEvent.location.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <Link href={`/dashboard/events/${nextEvent.id}`} className="btn bg-white text-black hover:bg-gray-200 border-none px-6 shadow-xl whitespace-nowrap">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="p-10 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center bg-white/5">
                            <Calendar size={48} className="text-muted mb-4" />
                            <h3 className="text-xl font-bold text-white">No upcoming events</h3>
                            <p className="text-muted mt-2 mb-6 max-w-sm">
                                You don't have any games scheduled. Join a club or create a new event to get started.
                            </p>
                            <Link href="/dashboard/events/create" className="btn btn-outline text-white border-white/20 hover:bg-white hover:text-black">
                                Schedule a Game
                            </Link>
                        </div>
                    )}

                    {/* Upcoming List */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Activity size={20} className="text-accent" /> Schedule
                            </h3>
                            <Link href="/dashboard/events?view=calendar" className="text-sm text-accent hover:underline flex items-center gap-1">
                                View Calendar <ArrowUpRight size={14} />
                            </Link>
                        </div>
                        
                        <div className="space-y-3">
                            {upcomingEvents.length > 0 ? (
                                upcomingEvents.map(event => (
                                    <EventCard key={event.id} event={event} isHosting={event.isHosting} />
                                ))
                            ) : (
                                <p className="text-muted text-sm italic">No other upcoming events.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COL (Quick Actions & Activity) */}
                <div className="space-y-6">
                    
                    {/* Quick Actions Panel */}
                    <div className="rounded-2xl bg-background-dark/50 border border-white/5 p-5">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 opacity-80">
                            Quick Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <QuickAction 
                                label="Create Team" 
                                icon={Users} 
                                href="/dashboard/teams/create" 
                                colorClass="bg-blue-500/20 text-blue-400" 
                            />
                            <QuickAction 
                                label="Find Club" 
                                icon={Search} 
                                href="/clubs" 
                                colorClass="bg-purple-500/20 text-purple-400" 
                            />
                            <QuickAction 
                                label="Audit Logs" 
                                icon={Activity} 
                                href="/dashboard/audit" 
                                colorClass="bg-emerald-500/20 text-emerald-400" 
                            />
                            <QuickAction 
                                label="Profile" 
                                icon={Trophy} 
                                href="/dashboard/profile" 
                                colorClass="bg-pink-500/20 text-pink-400" 
                            />
                        </div>
                    </div>

                    {/* Recent Activity (Mock) */}
                    <div className="rounded-2xl bg-white/5 border border-white/5 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white">Recent Activity</h3>
                            <button className="text-muted hover:text-white"><MoreHorizontal size={16} /></button>
                        </div>
                        <div className="space-y-6 relative">
                            {/* Connector Line */}
                            <div className="absolute left-[19px] top-2 bottom-2 w-[1px] bg-white/10 z-0" />

                            {[
                                { text: "Joined 'Newcastle Spikers'", time: "2h ago", icon: Users, color: "bg-blue-500" },
                                { text: "Won match vs Durham (3-0)", time: "Yesterday", icon: Trophy, color: "bg-accent" },
                                { text: "Payment processed for 'Autumn Cup'", time: "2 days ago", icon: Activity, color: "bg-emerald-500" },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 relative z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${item.color} text-white shadow-lg`}>
                                        <item.icon size={16} />
                                    </div>
                                    <div className="pt-1">
                                        <p className="text-sm font-medium text-white">{item.text}</p>
                                        <p className="text-xs text-muted mt-0.5">{item.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

// Helper for the quick action icon since I used Search in the component but didn't import it in the main block 
