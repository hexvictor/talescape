"use client";

import Link from "next/link";

type TaleUnauthorizedProps = {
  slug: string;
  status: number;
  creatorUsername: string;
  visibility?: string;
  title?: string;
  type?: string;
  creator?: string;
};

export default function TaleUnauthorized({
  slug,
  status,
  creatorUsername,
  visibility,
  title,
  type,
  creator,
}: TaleUnauthorizedProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black p-6 text-center text-white">
      <h1 className="mb-2 font-bold text-2xl">Sign in to view this tale</h1>

      {title ? (
        <>
          <p className="mb-1 text-lg italic">"{title}"</p>
          <p className="mb-4 text-gray-400 text-sm">
            This tale is <strong>{visibility}</strong> and requires you to log
            in to view.
          </p>
        </>
      ) : (
        <p className="mb-4 text-gray-400 text-sm">
          You must sign in to access this tale.
        </p>
      )}

      <Link
        href="/sign-in"
        className="mt-4 rounded bg-white px-4 py-2 text-black hover:bg-gray-200"
      >
        Sign in
      </Link>

      <div className="mt-6 text-xs opacity-40">
        <p>Slug: {slug}</p>
        <p>Creator Username: {creatorUsername}</p>
        {creator && <p>Owner: {creator}</p>}
        {type && <p>Type: {type}</p>}
      </div>
    </div>
  );
}
