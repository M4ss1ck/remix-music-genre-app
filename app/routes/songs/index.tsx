import type { LoaderFunction } from "remix";
import { json, useLoaderData, Link, useCatch } from "remix";
import type { Song, Artist, Genre } from "@prisma/client";
import { useTranslation, Trans } from "react-i18next";
import { db } from "~/utils/db.server";
import { i18n as i18nserver } from "~/i18n.server";

type LoaderData = {
  randomSong: Song & {
    artist: Artist[];
    genres: Genre[];
  };
  lang: Awaited<ReturnType<typeof i18nserver.getLocale>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const count = await db.song.count();
  const randomRowNumber = Math.floor(Math.random() * count);
  const [randomSong] = await db.song.findMany({
    include: {
      artist: true,
      genres: true,
    },
    take: 1,
    skip: randomRowNumber,
  });
  if (!randomSong) {
    throw new Response("No random song found", {
      status: 404,
    });
  }
  const lang = await i18nserver.getLocale(request);
  const data: LoaderData = { randomSong, lang };
  return json(data);
};

export default function SongsIndexRoute() {
  const data = useLoaderData<LoaderData>();
  //console.log(data);
  return (
    <div>
      <p>
        <Trans>Here's a random song:</Trans>
      </p>
      <div className="flex flex-row items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-2 inline-flex h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
        </svg>
        <p>{data.randomSong.title}</p>
      </div>
      <div className="flex flex-row items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-2 inline-flex h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
            clipRule="evenodd"
          />
        </svg>
        <p>{data.randomSong.artist[0].name}</p>
      </div>

      <div className="flex flex-row items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-2 inline-flex h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z"
            clipRule="evenodd"
          />
        </svg>
        <p>{data.randomSong.genres[0].name}</p>
      </div>

      <Link to={data.randomSong.id}>"{data.randomSong.title}" permalink</Link>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <div className="error-container">
        <Trans>There are no songs to display.</Trans>
      </div>
    );
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
  return (
    <div className="error-container">
      <Trans>I did a whoopsies.</Trans>
    </div>
  );
}
