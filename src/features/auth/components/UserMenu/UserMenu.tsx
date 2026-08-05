"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import SkeletonAvatar from "~/components/ui/SkeletonAvatar";
import { BookOpenIcon, CircleHelpIcon } from "~/lib/utils/icons";

export default function UserMenu() {
	const { isLoaded, user } = useUser();

	if (!isLoaded) return <SkeletonAvatar />;
	if (!user) return null;

	return (
		<div data-reader-component="UserMenu" data-reader-role="user-menu">
			<UserButton fallback={<SkeletonAvatar />}>
				<UserButton.UserProfilePage label="account" />
				<UserButton.UserProfilePage label="security" />
				<UserButton.UserProfilePage
					label="Help"
					labelIcon={<CircleHelpIcon className="text-popover-foreground" />}
					url="help"
				>
					<div>
						<h1>Help</h1>
					</div>
				</UserButton.UserProfilePage>
				<UserButton.MenuItems>
					<UserButton.Link
						label="My library"
						href={`/library/${user?.username}`}
						labelIcon={<BookOpenIcon className="text-popover-foreground" />}
					/>
					<UserButton.Action label="manageAccount" />
					<UserButton.Action
						label="Help"
						open="help"
						labelIcon={<CircleHelpIcon className="text-popover-foreground" />}
					/>
				</UserButton.MenuItems>
			</UserButton>
		</div>
	);
}
