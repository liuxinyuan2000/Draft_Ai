import { NextResponse } from "next/server";
import Replicate from "replicate";
import packageData from "../../../package.json";


// 2. 创建名为 replicate 的 Replicate 实例，用于连接到 Replicate AI 平台的 API 端点，并设置相关的身份验证凭据和请求头信息等。这里使用的身份验证凭据来自环境变量
// REPLICATE_API_TOKEN，用于保证对 API 端点的授权。
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
  userAgent: `${packageData.name}/${packageData.version}`,
});

// 3. 定义 getObjectFromRequestBodyStream 函数，用于将请求体中的数据流转换为 JSON 对象。具体来说，该函数通过 getReader() 方法获取请求体的阅读器，
//然后读取并解析其中的值，最后返回 JSON 对象。
async function getObjectFromRequestBodyStream(body) {
  const input = await body.getReader().read();
  const decoder = new TextDecoder();
  const string = decoder.decode(input.value);
  return JSON.parse(string);
}
// 4. 定义 WEBHOOK_HOST 常量，用于设置 Webhook 回调地址。该地址将使用环境变量 VERCEL_URL 或 NGROK_HOST 作为主机名，并在其后
//追加 "/api/replicate-webhook" 路径。
const WEBHOOK_HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NGROK_HOST;

// 5. 定义默认导出的 handler 函数，用于处理 Replicate AI 平台发出的 Webhook 请求，触发预测模型并返回预测结果。该函数从请求体中获取输入数据，
//然后使用 replicate.predictions.create() 方法触发 AI 模型的预测，并在 webhook 参数中指定 Webhook 回调地址。具体来说，该函数实现了以下步骤：

// - 首先验证 REPLICATE_API_TOKEN 是否已配置，如果没有配置则抛出一个错误信息。

// - 使用 getObjectFromRequestBodyStream 函数解析请求体中的输入数据，并将其报文主体转化为 JSON 对象。

// - 调用 replicate.predictions.create() 方法创建一个预测任务，并使用已解析的输入数据作为预测任务的输入参数，
//并将 URL 作为 webhook 回调地址以接收预测结果。在参数中，还将 webhook_events_filter 设置为 ["start", "completed"]，以仅接收预测任务开始和完成的事件。

// - 如果成功触发 AI 模型的预测，则将预测结果以 JSON 格式返回，同时使用 NextResponse.json() 方法将状态码设为 201 表示创建成功。
//如果在触发预测任务的过程中出现错误，则将错误信息以 JSON 格式返回，同时将状态码设为 500。
export default async function handler(req) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it."
    );
  }

  const input = await getObjectFromRequestBodyStream(req.body);

  // https://replicate.com/rossjillian/controlnet
  console.log("input", input);
  console.log("WEBHOOK_HOST", WEBHOOK_HOST);
  // console.log("process.env.REPLICATE_API_TOKEN", process.env.REPLICATE_API_TOKEN);
  const prediction = await replicate.predictions.create({
    version: "d55b9f2dcfb156089686b8f767776d5b61b007187a4e1e611881818098100fbb",
    input,
    webhook: `${WEBHOOK_HOST}/api/replicate-webhook`,
    webhook_events_filter: ["start", "completed"],
  });

  if (prediction?.error) {
    return NextResponse.json({ detail: prediction.error }, { status: 500 });
  }

  return NextResponse.json(prediction, { status: 201 });
}

// 6. 配置 config 对象，用于指定页面渲染的运行时环境和 API 配置。其中，将运行时环境设为 "edge"，也就是使用 Next.js 的最新版本来渲染页面；
//另外，在 api 对象下，配置 bodyParser 参数，将其 sizeLimit 属性设为 "10mb"，以便支持处理请求体最大为 10MB 的 API 请求。
export const config = {
  runtime: "edge",
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};

// 这个页面主要用于处理 Replicate AI 平台的 Webhook 请求，将 AI 模型的预测结果反馈给请求方。具体来说，该页面实现了以下功能：

// 1. 导入所需的第三方模块及自定义函数和数据。



// 综上所述，该页面主要用于连接到 Replicate AI 平台的 Webhook 端点，接收 AI 模型的预测结果，并将之发送回 API 客户端。