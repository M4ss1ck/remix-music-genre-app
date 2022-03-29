import styles from "~/styles/app.css";
import type { LinksFunction } from "remix";
import { useTranslation } from "react-i18next";
import { Link } from "remix";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

function LanguageSwitcher() {
  const { t, i18n } = useTranslation("common");
  // i18n.language

  return (
    <div className="flex flex-row items-center justify-center">
      <Link className="m-2" to="./?lng=es">
        es
      </Link>
      <Link className="m-2" to="./?lng=en">
        en
      </Link>
    </div>
  );
}

export default LanguageSwitcher;
