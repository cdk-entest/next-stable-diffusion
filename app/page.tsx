"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { config } from "@/config";

const HomePage = () => {
  const [url, setUrl] = useState<string | null>(null);
  const [modal, setModal] = useState<Boolean>(false);
  const [counter, setCounter] = useState<Number>(25);

  const generateImage = async (prompt: string, style: string) => {
    // const token = localStorage.getItem("IdToken");

    try {
      const { data, status } = await axios.get(config.API_DIFFUSION, {
        // headers: {
        //   Authorization: `Bearer ${token}`,
        //   "Content-Type": "application/json",
        // },
        params: {
          prompt: prompt,
          style: style,
        },
      });

      console.log(data);

      setUrl(data.url);
    } catch (error) {
      console.log(error);
    }

    setModal(false);
  };

  const timer = () => {
    var timeleft = 25;
    var downloadTimer = setInterval(function () {
      if (timeleft <= 0) {
        clearInterval(downloadTimer);
      } else {
      }

      setCounter(timeleft);

      timeleft -= 1;
    }, 1000);
  };

  useEffect(() => {}, [url, modal]);

  useEffect(() => {}, [counter]);

  return (
    <div className="min-h-screen dark:bg-slate-800">
      <div className="mx-auto max-w-3xl dark:bg-slate-800 dark:text-white px-10">
        <div className="mb-5">
          <textarea
            id="prompt"
            name="prompt"
            rows={2}
            placeholder="describe an image you want..."
            className="p-2.5 w-full text-gray-900 bg-slate-200  rounded-lg border border-gray-300 focus:border-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-1 outline-none focus:outline-none"
          ></textarea>
          <select
            id="style"
            className="p-2.5 w-full text-gray-900 bg-slate-200  rounded-lg border border-gray-300 focus:border-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 mb-1 outline-none focus:outline-none"
          >
            <option value="anime" selected>
              anime
            </option>
            <option value="origami">origami</option>
            <option value="comic-book">comic-book</option>
            <option value="fantasy-art">fantasy-art</option>
            <option value="digital-art">digital-art</option>
            <option value="tile-texture">tile-texture</option>
            <option value="pixel-art">pixel-art</option>
            <option value="cinematic">cinematic</option>
          </select>
          <button
            className="bg-orange-400 px-10 py-3 rounded-sm"
            onClick={async () => {
              let prompt = (
                document.getElementById("prompt") as HTMLInputElement
              ).value;

              let style = (document.getElementById("style") as HTMLInputElement)
                .value;

              if (prompt === "") {
                prompt = "a big house";
              }

              if (style === "") {
                style = "anime";
              }

              setUrl(null);
              setCounter(25);
              setModal(true);
              timer();
              await generateImage(prompt, style);
              // console.log(style);
            }}
          >
            Submit
          </button>
        </div>
        {url ? (
          <div>
            <img src={url} alt="test"></img>
          </div>
        ) : (
          ""
        )}

        {modal === true ? (
          <div
            className="fixed top-0 bottom-0 left-0 right-0 bg-slate-500 bg-opacity-70"
            id="modal"
          >
            <div className="mx-auto max-w-3xl sm:p-10 p-5">
              <div className="justify-center items-center flex bg-white py-20 px-10 rounded-lg relative">
                <h1 className="text-black" id="countdown">
                  Please wait {String(counter)} for generating your image
                </h1>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};
export default HomePage;
