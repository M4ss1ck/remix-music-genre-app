import type { User } from "@prisma/client";
import type { LinksFunction, LoaderFunction } from "remix";
import { json, Link, Outlet, useLoaderData } from "remix";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import styles from "~/styles/app.css";
import Header from "~/components/Header";
import { useTranslation, Trans } from "react-i18next";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  songListItems: Array<{ id: string; title: string }>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const songListItems = await db.song.findMany({
    take: 15,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });
  const user = await getUser(request);

  const data: LoaderData = {
    songListItems,
    user,
  };
  return json(data);
};

export default function SongRoute() {
  const data = useLoaderData<LoaderData>();
  let { t } = useTranslation("common");
  return (
    <>
      <Header />

      <main className="bg-light text-primary dark:bg-dark dark:text-light">
        <article className="container mx-auto grid grid-cols-1 grid-rows-2 gap-2 lg:grid-cols-3 lg:grid-rows-2">
          <section className="col-span-1 row-span-1 m-2 rounded-lg border border-current p-2 shadow-lg shadow-current lg:col-span-1 lg:row-span-2">
            <Link
              to="."
              className="mt-1 mb-4 flex w-fit rounded-lg border border-transparent p-1 px-2 shadow-sm shadow-current hover:border-current hover:shadow-md hover:shadow-current"
            >
              {t("Género de canción al azar")}
            </Link>
            <p className="font-bold">
              {t("Algunas canciones (con su género):")}
            </p>
            <ul className="my-4 flex flex-row flex-wrap justify-start lg:flex-col">
              {data.songListItems.map((song) => (
                <li key={song.id} className="mx-2 p-2">
                  <Link prefetch="intent" to={song.id}>
                    {song.title}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="my-2 flex flex-row justify-between">
              <li className="py-2">
                <Link
                  to="new"
                  className="mx-4 my-2 rounded-lg border border-transparent px-2 py-1 shadow-sm shadow-current hover:border-current hover:shadow-md hover:shadow-current"
                >
                  {t("Agregar")}
                </Link>
              </li>
              <li className="py-2">
                <a className="mx-4 my-2 rounded-lg border border-transparent px-2 py-1 shadow-sm shadow-current hover:border-current hover:shadow-md hover:shadow-current">
                  <Trans>Buscar (WIP)</Trans>
                </a>
              </li>
            </ul>
          </section>

          <section className="col-span-1 row-span-1 m-2 rounded-lg border border-current p-2 text-center shadow-lg shadow-current lg:col-span-2 lg:row-span-2">
            <Outlet />
          </section>
        </article>
      </main>
    </>
  );
}
