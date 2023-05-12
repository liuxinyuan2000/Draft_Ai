import packageData from "../package.json";
import dataUriToBuffer from "lib/data-uri-to-buffer";
//这段代码的主要作用是将一个涂鸦的数据URI上传到 Upload.io 服务器，并返回上传文件的 url。
//代码通过导入 package.json 中的 packageData 和 data-uri-to-buffer 库。使用具体步骤如下：


const UPLOAD_IO_ACCOUNT_ID = "FW25b4F";
const UPLOAD_IO_PUBLIC_API_KEY = "public_FW25b4FAzSgqxpyPhtmMePN3hSFg";

export default async function uploadFile(scribbleDataURI) {
  const uploadManager = new Upload.UploadManager(
    new Upload.Configuration({
      apiKey: UPLOAD_IO_PUBLIC_API_KEY,
    })
  );

  const { fileUrl } = await uploadManager.upload({
    accountId: UPLOAD_IO_ACCOUNT_ID,
    data: dataUriToBuffer(scribbleDataURI),
    mime: "image/png",
    originalFileName: "scribble_input.png",
    path: {
      // See path variables: https://upload.io/docs/path-variables
      folderPath: `/uploads/${packageData.name}/${packageData.version}/{UTC_DATE}`,
      fileName: "{ORIGINAL_FILE_NAME}_{UNIQUE_DIGITS_8}{ORIGINAL_FILE_EXT}",
    },
    metadata: {
      userAgent: navigator.userAgent,
    },
  });

  return fileUrl;
}
