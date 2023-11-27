import {
  CheckBadgeIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import {
  FILE_STATES,
  useAbortItem,
  useItemFinalizeListener,
} from "@rpldy/uploady";
import { useState } from "react";

export const UploadListItem = ({ item }: { item: any }) => {
  const [itemState, setState] = useState(item.state);

  const abortItem = useAbortItem();

  useItemFinalizeListener((item) => {
    setState(item.state);
  }, item.id);

  const isAborted = itemState === FILE_STATES.ABORTED,
    isSuccess = itemState === FILE_STATES.FINISHED,
    isFinished = ![FILE_STATES.PENDING, FILE_STATES.UPLOADING].includes(
      itemState
    );

  const onAbortItem = () => {
    abortItem(item.id);
  };

  return (
    <div className="flex items-center justify-between w-full my-2">
      {/* {!isFinished && <ItemProgress id={item.id} />} */}
      {isAborted && <XMarkIcon className="text-red-500 h-4 w-4 mx-2" />}
      {isSuccess && <CheckBadgeIcon className="text-green-500 h-4 w-4 mx-2" />}
      <div>{item.file.name}</div>
      {!isFinished && (
        <XCircleIcon
          onClick={onAbortItem}
          className="text-red-500 h-4 w-4 mx-2"
        />
      )}
    </div>
  );
};
