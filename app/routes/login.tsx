import type { ActionFunction, LinksFunction, MetaFunction } from "remix";
import { useActionData, json, useSearchParams, Link, Form } from "remix";
import DarkToggle from "~/components/darkToggle";
import { db } from "~/utils/db.server";
import { createUserSession, login, register } from "~/utils/session.server";
import styles from "~/styles/app.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const meta: MetaFunction = () => {
  return {
    title: "WIP music app",
    description:
      "Inicia sesión para agregar canciones con sus géneros musicales.",
  };
};

function validateUsername(username: unknown) {
  if (typeof username !== "string" || username.length < 3) {
    return `Usernames must be at least 3 characters long`;
  }
}

function validatePassword(password: unknown) {
  if (typeof password !== "string" || password.length < 6) {
    return `Passwords must be at least 6 characters long`;
  }
}

type ActionData = {
  formError?: string;
  fieldErrors?: {
    username: string | undefined;
    password: string | undefined;
  };
  fields?: {
    loginType: string;
    username: string;
    password: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const loginType = form.get("loginType");
  const username = form.get("username");
  const password = form.get("password");
  const redirectTo = form.get("redirectTo") || "/songs";
  if (
    typeof loginType !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string"
  ) {
    return badRequest({
      formError: `Form not submitted correctly.`,
    });
  }

  const fields = { loginType, username, password };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean))
    return badRequest({ fieldErrors, fields });

  switch (loginType) {
    case "login": {
      const user = await login({ username, password });
      if (!user) {
        return badRequest({
          fields,
          formError: `Username/Password combination is incorrect`,
        });
      }
      return createUserSession(user.id, redirectTo);
    }
    case "register": {
      const userExists = await db.user.findFirst({
        where: { username },
      });
      if (userExists) {
        return badRequest({
          fields,
          formError: `User with username ${username} already exists`,
        });
      }
      const user = await register({ username, password });
      if (!user) {
        return badRequest({
          fields,
          formError: `Something went wrong trying to create a new user.`,
        });
      }
      return createUserSession(user.id, redirectTo);
    }
    default: {
      return badRequest({
        fields,
        formError: `Login type invalid`,
      });
    }
  }
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  const [searchParams] = useSearchParams();
  return (
    <article className="container m-auto flex h-screen flex-col items-center justify-center text-center">
      <section
        className="m-4 w-1/2 rounded-lg border-2 p-4 shadow-lg shadow-current"
        data-light=""
      >
        <DarkToggle />
        <h1>Login</h1>
        <Form method="post">
          <input
            type="hidden"
            name="redirectTo"
            value={searchParams.get("redirectTo") ?? undefined}
          />
          <fieldset className="w-100 flex flex-row items-center justify-center">
            <legend className="sr-only">Login or Register?</legend>
            <label className="m-2 p-2">
              <input
                className="form-radio"
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === "login"
                }
              />{" "}
              Login
            </label>
            <label className="m-2 p-2">
              <input
                className="form-radio"
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={actionData?.fields?.loginType === "register"}
              />{" "}
              Register
            </label>
          </fieldset>
          <div className="m-2">
            <label htmlFor="username-input">Username</label>{" "}
            <input
              className="form-input rounded-lg border border-current bg-transparent ring ring-transparent focus:ring-current dark:border-light"
              type="text"
              id="username-input"
              name="username"
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(actionData?.fieldErrors?.username)}
              aria-errormessage={
                actionData?.fieldErrors?.username ? "username-error" : undefined
              }
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {actionData.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div className="m-2">
            <label htmlFor="password-input">Password</label>{" "}
            <input
              className="form-input rounded-lg border border-current bg-transparent ring ring-transparent focus:ring-current dark:border-light"
              id="password-input"
              name="password"
              defaultValue={actionData?.fields?.password}
              type="password"
              aria-invalid={
                Boolean(actionData?.fieldErrors?.password) || undefined
              }
              aria-errormessage={
                actionData?.fieldErrors?.password ? "password-error" : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {actionData?.formError ? (
              <p className="form-validation-error" role="alert">
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <button
            type="submit"
            className="my-2 rounded-lg border border-transparent px-2 py-1 shadow-sm shadow-current hover:border-current hover:shadow-md hover:shadow-current"
          >
            Submit
          </button>
        </Form>
      </section>
      <section className="m-4 w-1/2 rounded-lg border-2 p-4 shadow-lg shadow-current">
        <ul className="flex w-full flex-row justify-around">
          <li className="my-2 rounded-lg border border-transparent px-2 py-1 shadow-sm shadow-current hover:border-current hover:shadow-md hover:shadow-current">
            <Link to="/">Inicio</Link>
          </li>
          <li className="my-2 rounded-lg border border-transparent px-2 py-1 shadow-sm shadow-current hover:border-current hover:shadow-md hover:shadow-current">
            <Link to="/songs">Canciones</Link>
          </li>
        </ul>
      </section>
    </article>
  );
}
