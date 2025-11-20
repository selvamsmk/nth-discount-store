import { Link } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "./ui/navigation-menu";

export default function Header() {
	const links = [
		{ to: "/", label: "Home"},
		{ to: "/app/store", label: "Store" },
	] as const;

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<NavigationMenu>
					<NavigationMenuList className="gap-3">
					{links.map(({ to, label }) => {
						return (
							<NavigationMenuItem>
      							<NavigationMenuLink asChild>
									<Link key={to} to={to}>
										{label}
									</Link>
								</NavigationMenuLink>
							</NavigationMenuItem>
						);
					})}
					</NavigationMenuList>
				</NavigationMenu>
				<div className="flex items-center gap-2">
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
			<hr />
		</div>
	);
}
