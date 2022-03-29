import type { LinksFunction, MetaFunction } from "remix";
import { Link } from "remix";
import { json, LoaderFunction } from "remix";
import { i18n } from "~/i18n.server"; // this is the first file you created
import { useTranslation } from "react-i18next";
import styles from "~/styles/app.css";
import DarkToggle from "~/components/darkToggle";
import LanguageSwitcher from "~/components/LanguageSwitcher";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = () => ({
  title: "Busca el género",
  description: "Encuentra el género de esa canción que te gusta",
});

export let loader: LoaderFunction = async ({ request }) => {
  return json({
    i18n: await i18n.getTranslations(request, ["common", "index"]),
  });
};

export default function Index() {
  let { t } = useTranslation("common");
  return (
    <section className="flex h-full min-h-screen w-full flex-col items-start justify-start text-center md:items-center lg:justify-center">
      <div className="m-4 my-16 flex min-h-max min-w-[80vw] flex-col justify-between rounded-lg border-2 p-8 text-lg shadow-lg shadow-current lg:min-w-[50vw]">
        <DarkToggle />
        <LanguageSwitcher />
        <h1 className="mt-8 text-4xl font-extrabold">MGA</h1>
        <small>Music Genre App</small>
        <hr />
        <p>{t("Encuentra el género de esa canción que te gusta")}</p>
        <nav>
          <ul>
            <li className="m-4">
              <Link
                to="songs"
                className="rounded-2xl border border-current px-6 py-2 text-lg font-thin shadow-md shadow-current hover:border-2 hover:border-current hover:font-normal hover:shadow-lg hover:shadow-current"
              >
                {t("Iniciar")}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </section>
  );
}
