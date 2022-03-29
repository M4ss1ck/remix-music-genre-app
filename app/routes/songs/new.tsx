import type { ActionFunction, LoaderFunction, LinksFunction } from "remix";
import {
  useActionData,
  redirect,
  json,
  useCatch,
  Link,
  Form,
  useTransition,
} from "remix";

import { SongDisplay } from "~/components/song";
import { db } from "~/utils/db.server";
import { requireUserId, getUserId } from "~/utils/session.server";
import styles from "~/styles/app.css";

//import type { Artist, Genre } from "@prisma/client";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return json({});
};

function validateSongInfo(content: string) {
  if (content !== "" && content.length < 10) {
    return `That info is too short`;
  }
}

function validateSongTitle(name: string) {
  if (name.length < 3) {
    return `That name is too short`;
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    title: string | undefined;
    info: string | undefined;
    artist: string | undefined;
    genre: string | undefined;
  };
  fields?: {
    title: string;
    info?: string;
    artist: string;
    genre: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const title = form.get("title");
  const info = form.get("info") ?? "";
  const artist = form.get("artist");
  const genre = form.get("genre");
  if (
    typeof title !== "string" ||
    typeof info !== "string" ||
    typeof artist !== "string" ||
    typeof genre !== "string"
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fieldErrors = {
    title: validateSongTitle(title),
    info: validateSongInfo(info),
    artist: validateSongTitle(artist),
    genre: validateSongTitle(genre),
  };
  const fields = { title, info, artist, genre };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const song = await db.song.upsert({
    where: {
      id: "",
    },
    update: {},
    create: {
      title: title,
      info: info,
      ownerId: userId,
      artist: {
        connectOrCreate: {
          where: { name: artist },
          create: { name: artist },
        },
      },
      genres: {
        connectOrCreate: {
          where: { name: genre },
          create: { name: genre },
        },
      },
    },
  });
  return redirect(`/songs/${song.id}`);
};

export default function NewSongRoute() {
  const actionData = useActionData<ActionData>();
  const transition = useTransition();

  if (transition.submission) {
    const title = transition.submission.formData.get("title");
    const info = transition.submission.formData.get("info") ?? "";

    const artist = transition.submission.formData.get("artist");

    const genre = transition.submission.formData.get("genre");
    if (
      typeof title === "string" &&
      typeof info === "string" &&
      typeof artist === "string" &&
      typeof genre === "string" &&
      !validateSongTitle(title)
    ) {
      return (
        <SongDisplay
          song={{ title, info, artist, genre }}
          isOwner={true}
          canDelete={false}
        />
      );
    }
  }

  return (
    <article className="bg-light dark:bg-dark">
      <p className="text-lg ">Add your own song</p>
      <Form method="post" className="">
        <section className="m-2">
          <label>
            Title:{" "}
            <input
              className="form-input rounded-lg border border-current bg-transparent ring ring-transparent focus:ring-current dark:border-light"
              type="text"
              defaultValue={actionData?.fields?.title}
              name="title"
              aria-invalid={
                Boolean(actionData?.fieldErrors?.title) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.title ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.title ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.title}
            </p>
          ) : null}
        </section>

        <section className="m-2">
          <label>
            Artist:{" "}
            <input
              className="form-input rounded-lg border border-current bg-transparent ring ring-transparent focus:ring-current dark:border-light"
              type="text"
              defaultValue={actionData?.fields?.artist}
              name="artist"
              aria-invalid={
                Boolean(actionData?.fieldErrors?.artist) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.artist ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.artist ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.artist}
            </p>
          ) : null}
        </section>

        <section className="m-2">
          <label>
            Genre:{" "}
            <input
              className="form-input rounded-lg border border-current bg-transparent ring ring-transparent focus:ring-current dark:border-light"
              type="text"
              defaultValue={actionData?.fields?.genre}
              name="genre"
              aria-invalid={
                Boolean(actionData?.fieldErrors?.genre) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.genre ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.genre ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.genre}
            </p>
          ) : null}
        </section>

        <section className="m-2 flex flex-col items-center justify-center">
          <label className="flex flex-row items-center">
            Info:&nbsp;
            <textarea
              className="form-textarea rounded-lg border border-current bg-transparent ring ring-transparent focus:ring-current dark:border-light"
              defaultValue={actionData?.fields?.info}
              name="info"
              aria-invalid={Boolean(actionData?.fieldErrors?.info) || undefined}
              aria-errormessage={
                actionData?.fieldErrors?.info ? "content-error" : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.info ? (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"
            >
              {actionData.fieldErrors.info}
            </p>
          ) : null}
        </section>
        <section className="m-2">
          {actionData?.formError ? (
            <p className="form-validation-error" role="alert">
              {actionData.formError}
            </p>
          ) : null}
          <button
            type="submit"
            className="my-2 rounded-lg border border-transparent px-2 py-1 shadow-sm shadow-current hover:border-current hover:shadow-md hover:shadow-current"
          >
            Add
          </button>
        </section>
      </Form>
    </article>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to create a record.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}
