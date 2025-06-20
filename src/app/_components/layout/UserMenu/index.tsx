"use client";
import Link from "next/link";
import { BookOpenIcon, CircleHelpIcon } from "~/lib/utils/icons";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import SkeletonAvatar from "~/components/skeleton/Avatar";

export default function UserMenu() {
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
