"use client";

import Link from "next/link";
import {
	FaVolleyballBall,
	FaChevronDown,
	FaChevronRight,
} from "react-icons/fa";
import { navigationItems } from "../shared/nav-items";
import { useNavigation } from "../shared/useNavigation";

const Sidebar = () => {
	const {
		pathname,
		toggleExpanded,
		isItemOrSubItemActive,
		isExpanded,
		isActive,
	} = useNavigation();

	return (
		<aside className="xl:w-60 w-18 h-full z-30 rounded-lg">
			<div className="py-8 px-2">
				<div className="hidden xl:flex items-center gap-2 justify-center font-bold w-full text-5xl text-center text-accent mb-4 ">
					<FaVolleyballBall />
					<span className=""> Volleyer</span>
				</div>
				<div className="font-bold w-full xl:hidden text-5xl flex items-center justify-center text-accent mb-4">
					<FaVolleyballBall />
				</div>

				<nav className="space-y-1">
					{navigationItems.map((item) => {
						const Icon = item.icon;
						const isActive = isItemOrSubItemActive(item);
						const itemExpanded = isExpanded(item, navigationItems);

						return (
							<div key={item.name}>
								{/* Main Navigation Item */}
								<div
									className={`flex items-center justify-center lg:justify-start space-x-3 px-3 py-2 rounded-md text-xl font-medium transition-colors cursor-pointer ${
										isActive
											? "bg-background-light"
											: "text-muted hover:bg-background-light hover:text-white"
									}`}
									onClick={() => {
										if (item.subItems) {
											toggleExpanded(item.name);
										}
									}}
								>
									{item.subItems ? (
										<>
											<Icon className="self-center" />
											<span className="hidden xl:block flex-1">
												{item.name}
											</span>
											<div className="hidden xl:block">
												{itemExpanded ? <FaChevronDown /> : <FaChevronRight />}
											</div>
										</>
									) : (
										<Link
											href={item.href}
											className="flex items-center space-x-3 w-full"
										>
											<Icon className="self-center" />
											<span className="hidden xl:block">{item.name}</span>
										</Link>
									)}
								</div>

								{/* Sub Items */}
								{item.subItems && itemExpanded && (
									<div className="ml-6 mt-1 space-y-1 hidden xl:block">
										{item.subItems.map((subItem) => {
											const SubIcon = subItem.icon;
											const isSubActive = pathname === subItem.href;

											return (
												<Link
													key={subItem.name}
													href={subItem.href}
													className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
														isSubActive
															? "bg-background-light text-white"
															: "text-muted hover:bg-background-light hover:text-white"
													}`}
												>
													<SubIcon className="self-center text-sm" />
													<span>{subItem.name}</span>
												</Link>
											);
										})}
									</div>
								)}
							</div>
						);
					})}
				</nav>
			</div>
		</aside>
	);
};

export default Sidebar;
