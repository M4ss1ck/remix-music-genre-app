import { Link, useLoaderData, Form } from "remix";
import DarkToggle from "~/components/darkToggle";

import { getUser } from "~/utils/session.server";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation, Trans } from "react-i18next";

type LoaderData = {
  user: Awaited<ReturnType<typeof getUser>>;
  songListItems: Array<{ id: string; title: string }>;
};

const Header = () => {
  let { t } = useTranslation("common");
  const data = useLoaderData<LoaderData>();
  return (
    <header className="container mx-auto mb-2 flex w-[calc(100vw-4rem)] flex-row  items-center rounded-lg px-2 py-1 text-primary shadow-md shadow-current dark:text-light">
      <section className="container relative m-auto flex flex-row justify-between p-4">
        <h1 className="mr-auto">
          <Link to="/" title="MusicGenreApp" aria-label="Busca el género">
            <span className="text-2xl font-bold">MGA</span>
          </Link>
        </h1>

        {data.user ? (
          <div className="flex h-8 flex-row items-center">
            <span className="pr-4">{`${t("Conectado como ")} ${
              data.user.username
            }`}</span>
            <Form action="/logout" method="post">
              <button
                type="submit"
                className="my-2 rounded-lg border border-transparent px-2 py-1 shadow-sm shadow-current hover:border-current hover:shadow-md hover:shadow-current"
              >
                <Trans>Desconectarse</Trans>
              </button>
            </Form>
          </div>
        ) : (
          <Link
            to="/login"
            className="my-2 rounded-lg border border-transparent px-2 py-1 shadow-sm shadow-current hover:border-current hover:shadow-md hover:shadow-current"
          >
            <Trans>Iniciar sesión</Trans>
          </Link>
        )}
        <LanguageSwitcher />
        <DarkToggle />
      </section>
    </header>
  );
};

export default Header;
