"use client";

import { useEffect, useState } from "react";

const Header = () => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    localStorage.setItem("theme", theme);

    if (theme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  return (
    <div className="bg-slate-100 dark:bg-slate-900 font-mplus font-semibold shadow-sm py-2">
      <div className="max-w-3xl mx-auto px-5 sm:px-10 flex flex-row justify-between items-center">
        <a href="/">
          <button className="dark:text-white">Hai Tran</button>
        </a>
        <button
          className="bg-orange-400 rounded-3xl p-2 w-15 cursor-pointer"
          id="button"
          onClick={() => {
            if (theme === "dark") {
              setTheme("light");
            } else {
              setTheme("dark");
            }
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={theme === "light" ? "w-6 h-6 hidden" : "w-6 h-6"}
            id="sun"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
            />
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="{1.5}"
            stroke="currentColor"
            className={theme === "dark" ? "w-6 h-6 hidden" : "w-6 h-6"}
            id="moon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Header;
