"use client";

import { setIsAuthenticated, setUser } from "@/redux/features/userSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React, { useEffect } from "react";

import { useLanguage } from "../../context/LanguageContext";

const Header = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { data } = useSession();
  const { locale, setLocale, t } = useLanguage();

  useEffect(() => {
    if (data) {
      dispatch(setUser(data?.user));
      dispatch(setIsAuthenticated(true));
    }
  }, [data]);

  const logoutHandler = () => {
    signOut();
  };

  return (
    <nav className="navbar sticky-top py-2">
      <div className="container">
        <div className="col-6 col-lg-3 p-0">
          <div className="navbar-brand">
            <a href="/">
              <img
                style={{ cursor: "pointer", width: "250px", height: "80px" }}
                src="/images/logo.jpg"
                alt="DTUBOOKING"
              />
            </a>
          </div>
        </div>

        <div className="col-6 col-lg-5 mt-3 mt-md-0 text-end d-flex align-items-center justify-content-end">
          {/* Language Switcher */}
          <div className="dropdown me-4">
            <button
              className="btn btn-sm dropdown-toggle text-dark border d-flex align-items-center shadow-sm"
              type="button"
              id="languageDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ borderRadius: '20px', minWidth: '100px', height: '36px', backgroundColor: '#fff' }}
            >
              <i className="fas fa-globe me-2 text-danger"></i>
              <span className="fw-bold">{t("nav.language_name")}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="languageDropdown">
              <li>
                <button
                  className={`dropdown-item ${locale === 'en' ? 'active' : ''}`}
                  onClick={() => setLocale("en")}
                >
                  English (EN)
                </button>
              </li>
              <li>
                <button
                  className={`dropdown-item ${locale === 'vi' ? 'active' : ''}`}
                  onClick={() => setLocale("vi")}
                >
                  Tiếng Việt (VI)
                </button>
              </li>
            </ul>
          </div>

          {user ? (
            <div className="dropdown d-line">
              <button
                className="btn dropdown-toggle"
                type="button"
                id="dropdownMenuButton1"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <figure className="avatar avatar-nav">
                  <img
                    src={
                      user?.avatar
                        ? user?.avatar?.url
                        : "/images/default_avatar.jpg"
                    }
                    alt={user?.name}
                    className="rounded-circle placeholder-glow"
                    height="50"
                    width="50"
                  />
                </figure>
                <span className="placeholder-glow ps-1"> {user?.name}</span>
              </button>

              <div
                className="dropdown-menu w-100"
                aria-labelledby="dropdownMenuButton1"
              >
                {["admin", "staff"].includes(user?.role) && (
                  <Link href="/admin/dashboard" className="dropdown-item">
                    {t("nav.dashboard")}
                  </Link>
                )}
                <Link href="/bookings/me" className="dropdown-item">
                  {t("nav.my_bookings")}
                </Link>
                <Link href="/me/update" className="dropdown-item">
                  {t("nav.profile")}
                </Link>
                <Link
                  href="/"
                  className="dropdown-item text-danger"
                  onClick={logoutHandler}
                >
                  {t("nav.logout")}
                </Link>
              </div>
            </div>
          ) : (
            <>
              {data === undefined && (
                <div className="placeholder-glow">
                  <figure className="avatar avatar-nv placeholder bg-secondary"></figure>
                  <span className="placeholder w-25 bg-secondary ms-2"></span>
                </div>
              )}
              {data === null && (
                <Link
                  href="/login"
                  className="btn btn-danger px-4 text-white login-header-btn float-right"
                >
                  {t("nav.login")}
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};


export default Header;
