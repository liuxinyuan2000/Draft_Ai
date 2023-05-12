import Canvas from "components/canvas";
import PromptForm from "components/prompt-form";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import Predictions from "components/predictions";
import Error from "components/error";
import uploadFile from "lib/upload";
import naughtyWords from "naughty-words";
import Script from "next/script";
import seeds from "lib/seeds";
import pkg from "../package.json";
import sleep from "lib/sleep";

const HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

// 2. 在组件中定义多个状态，包括 error、submissionCount、predictions、isProcessing、scribbleExists、seed、initialPrompt 和 scribble 等，并且使用 useState Hook 初始化这些状态。
export default function Home() {
  const [error, setError] = useState(null);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [predictions, setPredictions] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [scribbleExists, setScribbleExists] = useState(false);
  const [seed] = useState(seeds[Math.floor(Math.random() * seeds.length)]);
  const [initialPrompt] = useState(seed.prompt);
  const [scribble, setScribble] = useState(null);
// 3. 定义 handleSubmit 函数，用于提交用户填写的表单数据，并将涂鸦转化为真实图片。其中，该函数涉及到以下步骤：
  console.log('enter Home');
  const handleSubmit = async (e) => {
// - 防止表单默认提交行为，并增加请求计数器。
    e.preventDefault();
    console.log('scribble', scribble);
    // track submissions so we can show a spinner while waiting for the next prediction to be created
    setSubmissionCount(submissionCount + 1);
// - 对表单数据进行处理，包括在用户输入涂鸦的同时，将表单的提示中的不良语言替换为 something 。
    const prompt = e.target.prompt.value
      .split(/\s+/)
      .map((word) => (naughtyWords.en.includes(word) ? "something" : word))
      .join(" ");

    setError(null);
    setIsProcessing(true);
// - 调用 uploadFile 函数将用户得到涂鸦上传到服务器，获取涂鸦的 url。
    const fileUrl = await uploadFile(scribble);
    const body = {
      prompt,
      image: fileUrl,
      structure: "scribble",
    };
    console.log('fileUrl', fileUrl);
// - 通过 POST 请求方法，将表单数据和涂鸦 url 传递给 API 端点进行处理，并等待响应结果。
// - 将响应结果解析为 JSON 格式，并将其添加到 predictions 状态中。
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    let prediction = await response.json();

    setPredictions((predictions) => ({
      ...predictions,
      [prediction.id]: prediction,
    }));

    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(500);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      setPredictions((predictions) => ({
        ...predictions,
        [prediction.id]: prediction,
      }));
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
    }
// - 在响应结果成功返回时，将 isProcessing 设为 false 。
    setIsProcessing(false);
  };

  return (
    <>
      <Head>
        <title>{pkg.appName}</title>
        <meta name="description" content={pkg.appMetaDescription} />
        <meta property="og:title" content={pkg.appName} />
        <meta property="og:description" content={pkg.appMetaDescription} />
        <meta
          property="og:image"
          content={`${HOST}/og-b7xwc4g4wrdrtneilxnbngzvti.jpg`}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <main className="container max-w-[1024px] mx-auto p-5 ">
        <div className="container max-w-[512px] mx-auto">
          <hgroup>
            <h1 className="text-center text-5xl font-bold m-4">
              {pkg.appName}
            </h1>
            <p className="text-center text-xl opacity-60 m-4">
              {pkg.appSubtitle}
            </p>
          </hgroup>

          <div className="text-center lil-text mt-8 mb-8">
            <div className="inline-block py-3 px-4 bg-brand text-black rounded-lg">
              🍿 This is a project from{" "}
              <Link
                href="https://replicate.com?utm_source=project&utm_campaign=scribblediffusion"
                target="_blank"
              >
                Replicate
              </Link>
              . Want to build an app like this?{" "}<br />
              <Link
                href="https://github.com/replicate/scribble-diffusion"
                target="_blank"
              >
                Fork it on GitHub
              </Link>{" "}
              or check out the{" "}
              <Link href="https://youtu.be/6z07OdbrWOs" target="_blank">
                video tutorial
              </Link>
              .
            </div>
          </div>

          <Canvas
            startingPaths={seed.paths}
            onScribble={setScribble}
            scribbleExists={scribbleExists}
            setScribbleExists={setScribbleExists}
          />

          <PromptForm
            initialPrompt={initialPrompt}
            onSubmit={handleSubmit}
            isProcessing={isProcessing}
            scribbleExists={scribbleExists}
          />

          <Error error={error} />
        </div>

        <Predictions
          predictions={predictions}
          isProcessing={isProcessing}
          submissionCount={submissionCount}
        />
      </main>

      <Script src="https://js.upload.io/upload-js-full/v1" />
    </>
  );
}

// 这段代码定义了一个名为 Home 的 React 函数组件，该组件是整个网站的主页，其作用是渲染一个带有 Canvas 画布和表单的页面，让用户根据给定的提示（或自行输入的提示）进行涂鸦，然后通过 AI 算法将用户的涂鸦转化为真实图片，并随机生成一个标题。具体来说，这段代码实现了以下功能：

// 1. 导入所需的第三方模块和自定义函数及数据。


// 4. 渲染页面的主体结构，并使用 Canvas 组件绘制随机生成的初始涂鸦。同时，也使用 PromptForm 组件渲染表单，允许用户输入涂鸦的提示信息，并在表单提交时触发 handleSubmit 函数进行涂鸦的 AI 处理。此外，还使用 Error 组件用于显示 API 端点返回的错误信息。

// 5. 利用 Predictions 组件展示 AI 处理后的结果，并显示涂鸦转换的标题。

// 6. 在页面头部设置标题、描述、图片等元信息，并添加 favicon 和外部脚本以支持表单多文件上传。

// 综上所述，这段代码的主要作用是创建一个交互式、随机生成标题、涂鸦转换成真实图片的应用程序，让用户可以上载他们的涂鸦并获得一个独特的图像。同时，这个应用程序展示了如何使用第三方API和技术栈来构建有趣和实用的 Web 应用程序。