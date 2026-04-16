"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import ButtonLoader from "../layout/ButtonLoader";
import { useLanguage } from "../../context/LanguageContext";

const Login = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const submiHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      toast.error(result.error);
    } else {
      router.replace("/");
    }
  };
  return (
    <div className="row wrapper">
      <div className="col-10 col-lg-5">
        <form className="shadow rounded bg-body" onSubmit={submiHandler}>
          <h1 className="mb-3">{t("auth.login_title")}</h1>
          <div className="mb-3">
            <label className="form-label" htmlFor="email_field">
              {t("auth.email")}
            </label>
            <input
              type="email"
              id="email_field"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="password_field">
              {t("auth.password")}
            </label>
            <input
              type="password"
              id="password_field"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Link href="/password/forgot" className="float-end mt-2">
            {t("auth.forgot_password")}
          </Link>

          <button
            id="login_button"
            type="submit"
            className=" form-btn w-100 py-2"
            disabled={loading}
          >
            {loading ? <ButtonLoader /> : t("nav.login").toUpperCase()}
          </button>

          <div className="mt-3 mb-4 text-end">
            <Link href="/register">
              {t("auth.new_user")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};


export default Login;
