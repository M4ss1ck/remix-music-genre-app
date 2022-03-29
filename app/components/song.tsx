import { Link, Form } from "remix";
import type { Song } from "@prisma/client";
import { useTranslation, Trans } from "react-i18next";

export function SongDisplay({
  song,
  isOwner,
  canDelete = true,
}: {
  song: Pick<
    Song & {
      artist: string;
      genre: string;
    },
    "title" | "info" | "artist" | "genre"
  >;
  isOwner: boolean;
  canDelete?: boolean;
}) {
  return (
    <>
      <p>
        <Trans>Here's your song:</Trans>
      </p>
      <p>{song.genre}</p>
      <p>{song.artist}</p>
      <p>{song.title}</p>
      <Link to=".">{song.title} Permalink</Link>
      {isOwner ? (
        <Form method="post">
          <input type="hidden" name="_method" value="delete" />
          <button
            type="submit"
            className="my-2 rounded-lg border border-transparent px-2 py-1 shadow-sm shadow-current hover:border-current hover:shadow-md hover:shadow-current"
            disabled={!canDelete}
          >
            <Trans>Delete</Trans>
          </button>
        </Form>
      ) : null}
    </>
  );
}
