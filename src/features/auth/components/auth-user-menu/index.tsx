"use client";

import { BookOpenIcon, CircleHelpIcon } from "~/lib/utils/icons";
import { UserButton, useUser } from "@clerk/nextjs";
import SkeletonAvatar from "~/components/ui/skeleton-avatar";

export default function AuthUserMenu() {
	const { isLoaded, user } = useUser();

	if (!isLoaded) {
		return <SkeletonAvatar />;
	}
	return (
		<UserButton>
			<UserButton.UserProfilePage label="account" />
			<UserButton.UserProfilePage label="security" />
			<UserButton.UserProfilePage
				label="Help"
				labelIcon={<CircleHelpIcon />}
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
					labelIcon={<BookOpenIcon />}
				/>
				<UserButton.Action label="manageAccount" />
				<UserButton.Action
					label="Help"
					open="help"
					labelIcon={<CircleHelpIcon />}
				/>
			</UserButton.MenuItems>
		</UserButton>
	);
}
