import type { LinksFunction, MetaFunction } from "remix";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useCatch,
  createCookie,
} from "remix";
import { useLoaderData } from "remix";
import clsx from "clsx";
import type { LoaderFunction } from "remix";
import type { Theme } from "~/utils/theme-provider";
import { getThemeSession } from "./utils/theme.server";
import { i18n } from "./i18n.server";
import { useSetupTranslations } from "remix-i18next";
import { useTranslation } from "react-i18next";
import {
  NonFlashOfWrongThemeEls,
  ThemeProvider,
  useTheme,
} from "~/utils/theme-provider";

import styles from "~/styles/app.css";

export type LoaderData = {
  theme: Theme | null;
  locale: string;
  options?: any;
};

export const loader: LoaderFunction = async ({ request }) => {
  const themeSession = await getThemeSession(request);
  let locale = await i18n.getLocale(request);

  const lngInQuery = new URL(request.url).searchParams.get("lng");
  const options = { headers: {} };
  if (lngInQuery) {
    // on language change via lng search param, save selection to cookie
    options.headers = {
      "Set-Cookie": await createCookie("locale").serialize(locale),
    };
  }

  const data: LoaderData = {
    theme: themeSession.getTheme(),
    locale: locale,
    options: options,
  };
  // difer from https://github.com/sergiodxa/remix-i18next
  return data;
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = () => {
  let { t } = useTranslation("common");
  const description = `Encuentra el género de esa canción que te gusta`;
  return {
    charset: "utf-8",
    description,
    keywords: "Remix,jokes",
    //"twitter:image": "https://remix-jokes.lol/social.png",
    //"twitter:card": "summary_large_image",
    "twitter:creator": "@M4ss1ck",
    "twitter:site": "@M4ss1ck",
    "twitter:title": "Busca el género",
    "twitter:description": description,
  };
};

function Document({
  children,
  title = `MusicGenreApp`,
  data,
}: {
  children: React.ReactNode;
  title?: string;
  data: LoaderData;
}) {
  const [theme] = useTheme();
  const { i18n } = useTranslation();
  return (
    <html lang={i18n.language} className={clsx(theme)}>
      <head>
        <Meta />
        <title>{title}</title>
        <Links />
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(data.theme)} />
      </head>
      <body className="bg-light text-primary dark:bg-dark dark:text-light">
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<LoaderData>();
  useSetupTranslations(data.locale);
  return (
    <ThemeProvider specifiedTheme={data.theme}>
      <Document data={data}>
        <Outlet />
      </Document>
    </ThemeProvider>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const data = useLoaderData<LoaderData>();

  return (
    <Document title={`${caught.status} ${caught.statusText}`} data={data}>
      <div className="error-container">
        <h1>
          {caught.status} {caught.statusText}
        </h1>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  const data = useLoaderData<LoaderData>();

  return (
    <Document title="Uh-oh!" data={data}>
      <div className="error-container">
        <h1>App Error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
