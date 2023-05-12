import { NextResponse } from "next/server";
import Replicate from "replicate";
import packageData from "../../../package.json";

//轮询检测prediction的状态
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: `${packageData.name}/${packageData.version}`,
});

export default async function handler(req) {
  const predictionId = req.nextUrl.searchParams.get("id");
  const prediction = await replicate.predictions.get(predictionId);

  if (prediction?.error) {
    return NextResponse.json({ detail: prediction.error }, { status: 500 });
  }

  return NextResponse.json(prediction);
}

export const config = {
  runtime: "edge",
};

// 这个页面主要用于处理 API 请求，根据请求中的 ID 参数获取指定的 AI 预测结果，并将其以 JSON 格式返回。具体来说，这段代码实现了以下功能：

// 1. 导入所需的第三方模块及自定义函数和数据。

// 2. 创建名为 replicate 的 Replicate 实例，用于连接到 Replicate AI 平台的 API 端点，并设置相关的身份验证凭据和请求头信息等。
//这里使用的身份验证凭据来自环境变量 REPLICATE_API_TOKEN，用于保证对 API 端点的授权。

// 3. 定义 handler 函数作为默认的导出函数，用于处理所有的 API 请求。该函数从请求信息中获取 id 参数，
//然后通过 replicate.predictions.get() 方法获取该 ID 对应的 AI 预测结果。

// 4. 如果成功获取 AI 预测结果，则将之以 JSON 格式返回，同时使用 NextResponse.json() 方法将 HTTP 响应和状态信息一并返回。
//如果获取 AI 预测结果的过程中出现错误，该函数将在响应中返回一个状态码为 500 的错误信息。

// 5. 设置 config 对象，用于指定页面渲染的运行时环境。这里将运行时环境设为 "edge"，也就是使用 Next.js 的最新版本来渲染页面。

// 综上所述，该页面主要用于连接到 Replicate AI 平台的 API 端点，访问对应的预测结果数据，然后将数据以 JSON 格式返回给 API 客户端。
