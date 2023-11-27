import { UploadListItem } from "@/features/upload/upload-list-item";
import { useBatchAddListener, useUploady } from "@rpldy/uploady";
import { useState } from "react";

export const UploadList = () => {
  const { processPending } = useUploady();
  const [items, setItems] = useState<any>([]);

  useBatchAddListener((batch) => {
    // @ts-ignore
    setItems((items) => items.concat(batch.items));
  });

  return (
    <div className="flex flex-col">
      {items.map((item: any) => (
        <UploadListItem key={item.id} item={item} />
      ))}
      {/* @ts-ignore */}
      {items.length ? <button onClick={processPending}>Upload</button> : null}
    </div>
  );
};
