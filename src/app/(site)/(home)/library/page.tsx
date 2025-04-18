import React, { Suspense } from "react";
import { UploadImage } from "~/app/_components/forms/UploadImage";
import { Images } from "~/app/_components/Images";
import { HydrateClient } from "~/trpc/server";
import { auth } from "@clerk/nextjs/server";
import BookLibrary from "~/app/(site)/(home)/library/book/_components/BookLibrary/BookLibrary";

async function Library() {
	return <BookLibrary />;
}

export default Library;
