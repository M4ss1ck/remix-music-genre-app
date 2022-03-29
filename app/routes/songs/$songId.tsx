import type { LoaderFunction, ActionFunction, MetaFunction } from "remix";
import { json, useLoaderData, useCatch, redirect, useParams } from "remix";
import type { Song } from "@prisma/client";

import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";
import { SongDisplay } from "~/components/song";

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  if (!data) {
    return {
      title: "No song",
      description: "No song found",
    };
  }
  return {
    title: `"${data.song.title}"`,
    description: `Enjoy the "${data.song.title}" song and much more`,
  };
};

type LoaderData = {
  song: Pick<
    Song & {
      artist: string;
      genre: string;
    },
    "title" | "info" | "artist" | "genre"
  >;
  isOwner: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await getUserId(request);
  //console.log("params: \n", params);
  const dbsong = await db.song.findUnique({
    where: { id: params.songId },
    include: {
      artist: true,
      genres: true,
    },
  });
  if (!dbsong) {
    throw new Response("Ups! Not found.", {
      status: 404,
    });
  }
  const title = dbsong.title;
  const info = dbsong.info;
  const artist = dbsong.artist[0].name;
  const genre = dbsong.genres[0].name;
  const song = { title, info, artist, genre };

  const data: LoaderData = {
    song,
    isOwner: userId === dbsong.ownerId,
  };
  return json(data);
};

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  if (form.get("_method") !== "delete") {
    throw new Response(`The _method ${form.get("_method")} is not supported`, {
      status: 400,
    });
  }
  const userId = await requireUserId(request);
  const song = await db.song.findUnique({
    where: { id: params.songId },
    include: {
      artist: true,
      genres: true,
    },
  });
  if (!song) {
    throw new Response("Can't delete what does not exist", {
      status: 404,
    });
  }
  if (song.ownerId !== userId) {
    throw new Response("Pssh, nice try. That's not your song", {
      status: 401,
    });
  }
  await db.song.delete({ where: { id: params.songId } });
  return redirect("/songs");
};

export default function SongRoute() {
  const data = useLoaderData<LoaderData>();

  return <SongDisplay song={data.song} isOwner={data.isOwner} />;
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  switch (caught.status) {
    case 400: {
      return (
        <div className="error-container">
          What you're trying to do is not allowed.
        </div>
      );
    }
    case 404: {
      return (
        <div className="error-container">
          Huh? What the heck is {params.songId}?
        </div>
      );
    }
    case 401: {
      return (
        <div className="error-container">
          Sorry, but {params.songId} is not your song.
        </div>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  const { songId } = useParams();
  return (
    <div className="error-container">{`There was an error loading song by the id ${songId}. Sorry.`}</div>
  );
}
