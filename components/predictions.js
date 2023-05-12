import copy from "copy-to-clipboard";
import { Copy as CopyIcon, PlusCircle as PlusCircleIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import Loader from "components/loader";
// 这个代码定义了一个 Predictions 组件和一个 Prediction 子组件，用于在页面上显示笔画转换的结果。代码中使用了 Next.js 提供的 Image 组件，
//用来加载图片并自动优化质量和性能。


// Predictions 组件接收 predictions 和 submissionCount 两个 props，用于从父组件传递笔画转换的结果和提交数量。
export default function Predictions({ predictions, submissionCount }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (submissionCount > 0) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [predictions, submissionCount]);

  //在组件中，它会根据 submissionCount 的值来判断是否需要显示加载器并滚动到页面底部。如果 submissionCount 为 0，则返回空。
  if (submissionCount === 0) return;

  return (
    <section className="w-full my-10">
      <h2 className="text-center text-3xl font-bold m-6">Results</h2>

      {submissionCount > Object.keys(predictions).length && (
        <div className="pb-10 mx-auto w-full text-center">
          <div className="pt-10" ref={scrollRef} />
          <Loader />
        </div>
      )}

      {Object.values(predictions)
        .slice()
        .reverse()
        .map((prediction, index) => (
          <Fragment key={prediction.id}>
            {index === 0 &&
              submissionCount == Object.keys(predictions).length && (
                <div ref={scrollRef} />
              )}
            <Prediction prediction={prediction} />
          </Fragment>
        ))}
    </section>
  );
}

// Prediction 组件接收 prediction 和 showLinkToNewScribble 两个 props，用于从父组件传递单个笔画转换结果和是否显示创建新笔画的链接。
//在组件中，它会渲染转换前后的图片和转换时使用的提示文本，以及一个用于复制结果链接的按钮和一个用于创建新笔画的按钮。
export function Prediction({ prediction, showLinkToNewScribble = false }) {
  const [linkCopied, setLinkCopied] = useState(false);

  const copyLink = () => {
    const url =
      window.location.origin +
      "/scribbles/" +
      (prediction.uuid || prediction.id); // if the prediction is from the Replicate API it'll have `id`. If it's from the SQL database, it'll have `uuid`
    copy(url);
    setLinkCopied(true);
  };

// 整个代码中还使用了一些 React 的特性，如 useRef、useState、useEffect 和 Fragment 等。
//其中 useEffect 用于在组件渲染后执行滚动操作和清除“已复制”消息。
//useState 用于在组件中定义一个状态变量 linkCopied 以判断是否复制了链接。
//useRef 用于在组件中定义一个 ref 引用用于滚动到页面底部。
//Fragment 用于在组件中返回多个子元素。
  // Clear the "Copied!" message after 4 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setLinkCopied(false);
    }, 4 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  if (!prediction) return null;

  return (
    <div className="mt-6 mb-12">
      <div className="shadow-lg border my-5 p-5 bg-white flex">
        <div className="w-1/2 aspect-square relative border">
          <img
            src={prediction.input.image}
            alt="input scribble"
            className="w-full aspect-square"
          />
        </div>
        <div className="w-1/2 aspect-square relative">
          {prediction.output?.length ? (
            <img
              src={prediction.output[prediction.output.length - 1]}
              alt="output image"
              className="w-full aspect-square"
            />
          ) : (
            <div className="grid h-full place-items-center">
              <Loader />
            </div>
          )}
        </div>
      </div>
      <div className="text-center px-4 opacity-60 text-xl">
        &ldquo;{prediction.input.prompt}&rdquo;
      </div>
      <div className="text-center py-2">
        <button className="lil-button" onClick={copyLink}>
          <CopyIcon className="icon" />
          {linkCopied ? "Copied!" : "Copy link"}
        </button>

        {showLinkToNewScribble && (
          <Link href="/">
            <button className="lil-button" onClick={copyLink}>
              <PlusCircleIcon className="icon" />
              Create a new scribble
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}
