import styles from "~/styles/app.css";
import type { LinksFunction } from "remix";
import { Link } from "remix";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

function LanguageSwitcher() {
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
