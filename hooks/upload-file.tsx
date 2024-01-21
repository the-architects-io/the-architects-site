import { useState } from "react";
import cloneDeep from "lodash.clonedeep";
import { handleError } from "@/utils/errors/log-error";

type UploadProps = any;

type PostFile<Response> = (
  formData: FormData,
  onprogress: any
) => Promise<Response>;

type UseUploadFile = <T>(
  postFile: PostFile<T>,
  {
    fileLength,
    getBreakInfo,
  }: {
    fileLength?: number;
    getBreakInfo?: (filename: string) => Promise<Record<"data", number>>;
  }
) => { uploadProps: UploadProps; loading: boolean; progress: number };

const message = console;

const useUploadFile: UseUploadFile = (
  postFile,
  { fileLength, getBreakInfo } = { fileLength: 1 }
) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const uploadProps: UploadProps & any = {
    multiple: true,
    headers: {
      Authorization: "$prefix $token",
    },
    onStart() {
      setProgress(0);
    },
    onSuccess(res: any, file: any) {
      const list = cloneDeep(fileList);
      file.status = "done";
      file.url = res.data;
      list.push(file);
      setFileList(list);
      setProgress(100);
    },
    onError() {
      setProgress(0);
    },
    onProgress({ percent }: any) {
      setProgress(percent);
    },
    async customRequest(option: any) {
      const {
        // data,
        file,
        // filename,
        onError,
        // onProgress,
        onSuccess,
        // withCredentials,
      } = option;

      if (fileLength === fileList.length) return message.error(``);

      const formData = new FormData();

      let size = 0;

      console.log("", file.size, size);

      if (size === file.size) return message.error("");

      formData.append(
        "file",
        (file as Blob).slice(size, (file as Blob).size),
        file.name
      );

      try {
        setLoading(true);
        const res = await postFile(formData, ({ progress }: any) => {
          setProgress(progress);
        });
        setLoading(false);
        onSuccess(res, file);
      } catch (e) {
        handleError(e as Error);
        setLoading(false);
        onError(e);
      }

      return {
        abort() {
          message.error("");
        },
      };
    },
    onChange(info: any) {
      const {
        file: { status, name, uid },
      } = info;

      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }

      if (status === "done") {
        message.log(`${name} file uploaded successfully`);
      } else if (status === "error") {
        message.error(`${name} file upload failed.`);
      }

      if (status === "removed") {
        const list = fileList.filter((i) => i.uid !== uid);
        setFileList(list);
        setProgress(0);
      }
    },
    fileList,
  };

  return { uploadProps, progress, loading };
};

export default useUploadFile;
