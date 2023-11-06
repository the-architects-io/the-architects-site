import { BASE_URL } from "@/constants/constants";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DocumentIcon,
  LockClosedIcon,
} from "@heroicons/react/20/solid";
import { ClipboardIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PublicKey } from "@metaplex-foundation/js";
import { ShdwDrive, StorageAccountV2 } from "@shadow-drive/sdk";
import {
  RankingInfo,
  compareItems,
  rankItem,
} from "@tanstack/match-sorter-utils";
import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  SortingFn,
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  sortingFns,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import {
  InputHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { TableVirtuoso } from "react-virtuoso";
import dataJSON from "./MOCK_DATA.json";
import { DebouncedInput } from "@/features/UI/forms/debounced-input";
import { decryptData } from "@/utils/encryption";
import { useWallet } from "@solana/wallet-adapter-react";

type DriveFileList = {
  filename: JSX.Element | string;
  copy: JSX.Element | string;
  delete: JSX.Element | string;
};

// declare module "@tanstack/table-core" {
//   interface FilterFns {
//     fuzzy: FilterFn<unknown>;
//   }
//   interface FilterMeta {
//     itemRank: RankingInfo;
//   }
// }

export default function DriveFileList({
  files,
  driveAddress,
  shadowDrive,
  refetchFiles,
  isLoading,
}: {
  files: string[];
  driveAddress: string;
  shadowDrive: ShdwDrive | null;
  storageAccount: StorageAccountV2;
  refetchFiles: (arg0: ShdwDrive) => void;
  isLoading: boolean;
}) {
  const { publicKey } = useWallet();
  const [data, setData] = useState<DriveFileList[]>([]);
  const [isBeingDeletedFiles, setIsBeingDeletedFiles] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [tableIsInitialized, setTableIsInitialized] = useState(false);

  const columnHelper = createColumnHelper<DriveFileList>();
  const rerender = useReducer(() => ({}), {})[1];

  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    // Rank the item
    const itemRank = rankItem(row.getValue(columnId), value);

    // Store the itemRank info
    addMeta({
      itemRank,
    });

    // Return if the item should be filtered in/out
    return itemRank.passed;
  };

  const handleDecrypt = useCallback(
    async (filename: string) => {
      if (!publicKey) return;
      const res = await fetch(
        `https://shdw-drive.genesysgo.net/${driveAddress}/${filename}`
      );
      const encryptedBlob = await res.blob();

      try {
        const decryptedData = await decryptData(encryptedBlob, publicKey);
        const decryptedBlob = new Blob([decryptedData], {
          type: "application/octet-stream",
        });

        const url = URL.createObjectURL(decryptedBlob);

        // Create a download link for the user
        const a = document.createElement("a");
        a.href = url;
        a.download = filename.replace(".arc", "");
        a.click();
        a.remove();

        // window.open(url);
      } catch (err) {
        console.error("Error during decryption:", err);
      }
    },
    [driveAddress, publicKey]
  );

  const handleCopyToClipboard = useCallback(
    (filename: string) => {
      navigator.clipboard.writeText(
        `https://shdw-drive.genesysgo.net/${driveAddress}/${filename}`
      );
      showToast({
        primaryMessage: "Copied to clipboard",
      });
    },
    [driveAddress]
  );

  const handleDeleteFile = useCallback(
    async (filename: string) => {
      if (!shadowDrive) return;
      if (isBeingDeletedFiles.includes(filename)) return;

      setIsBeingDeletedFiles((prev) => [...prev, filename]);

      let response;

      try {
        response = await shadowDrive.deleteFile(
          new PublicKey(driveAddress),
          `https://shdw-drive.genesysgo.net/${driveAddress}/${filename}`
        );
      } catch {
        showToast({
          primaryMessage: "Error",
          secondaryMessage: `Failed to delete file`,
        });
        return;
      } finally {
        setIsBeingDeletedFiles((prev) =>
          prev.filter((isBeingDeletedFile) => isBeingDeletedFile !== filename)
        );
      }

      if (!response?.message?.includes("successfully deleted")) {
        showToast({
          primaryMessage: "Error",
          secondaryMessage: `Failed to delete file`,
        });
        setIsBeingDeletedFiles((prev) =>
          prev.filter((isBeingDeletedFile) => isBeingDeletedFile !== filename)
        );
        return;
      }

      showToast({
        primaryMessage: "Deleted",
        secondaryMessage: "File deleted",
      });

      // refetchFiles(shadowDrive);
      // instead of refetching, just remove the file from the list
      setIsBeingDeletedFiles((prev) =>
        prev.filter((isBeingDeletedFile) => isBeingDeletedFile !== filename)
      );
      console.log({
        deletedFile: filename,
        file: files[0],
      });
      refetchFiles(shadowDrive);
    },
    [driveAddress, files, isBeingDeletedFiles, refetchFiles, shadowDrive]
  );

  const columns = useMemo<ColumnDef<DriveFileList>[]>(
    () => [
      {
        header: () => <div className="uppercase mr-4">Filename</div>,
        accessorKey: "filename",
        cell: (info) => (
          <div className="flex items-center">
            <a
              href={
                `${info.getValue()}`.includes(".arc")
                  ? undefined
                  : `https://shdw-drive.genesysgo.net/${driveAddress}/${info.getValue()}`
              }
              target="_blank"
              rel="noreferrer"
              className={classNames([
                "flex items-center",
                `${info.getValue()}`.includes(".arc") ? "" : "hover:underline",
              ])}
            >
              {`${info.getValue()}`.includes(".arc") ? (
                <LockClosedIcon className="h-4 w-4" />
              ) : (
                <DocumentIcon className="h-4 w-4" />
              )}
              <div className="ml-4">
                <>{`${info.getValue()}`.replace(".arc", "")}</>
              </div>
            </a>
            {`${info.getValue()}`.includes(".arc") && (
              <button
                className="text-xs uppercase ml-12 mt-1"
                onClick={() => handleDecrypt(`${info.getValue()}`)}
              >
                Decrypt
              </button>
            )}
          </div>
        ),
        accessorFn: (row) => row.filename,
      },
      {
        header: () => "",
        accessorKey: "copy",
        cell: (info) => (
          <div
            className="cursor-pointer w-3"
            onClick={() => handleCopyToClipboard(info.row.getValue("filename"))}
          >
            <ClipboardIcon
              height="1.5rem"
              width="1.5rem"
              className="h-6 w-6 flex-none hover:text-sky-200"
            />
          </div>
        ),
        accessorFn: (row) => row.copy,
      },
      {
        header: () => "",
        accessorKey: "delete",
        cell: (info) => (
          <div
            className="cursor-pointer flex justify-center flex-none w-3"
            onClick={
              isBeingDeletedFiles.includes(info.row.getValue("filename"))
                ? () => {}
                : () => handleDeleteFile(info.row.getValue("filename"))
            }
          >
            {isBeingDeletedFiles.includes(info.row.getValue("filename")) ? (
              <Spinner />
            ) : (
              <TrashIcon
                height="1.5rem"
                width="1.5rem"
                className="h-6 w-6 flex-none hover:text-red-400"
              />
            )}
          </div>
        ),
        accessorFn: (row) => row.delete,
      },
    ],
    [driveAddress, handleCopyToClipboard, handleDeleteFile, isBeingDeletedFiles]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      globalFilter,
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    debugTable: true,
  });

  useEffect(() => {
    if (!files?.length && !tableIsInitialized) return;
    setData(files.map((filename) => ({ filename })) as DriveFileList[]);
    setTableIsInitialized(true);
  }, [
    tableIsInitialized,
    driveAddress,
    files,
    handleCopyToClipboard,
    handleDeleteFile,
    isBeingDeletedFiles,
  ]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center w-full">
        <div className="py-8 italic">Loading files...</div>
        <Spinner />
      </div>
    );
  }

  if (!files?.length) {
    return (
      <div className="text-center py-8 italic w-full">This drive is empty</div>
    );
  }

  const { rows } = table.getRowModel();

  return (
    <div className="p-2 w-full px-8 max-h-screen overflow-y-auto relative">
      <div className="absolute top-0 right-0 z-10 pr-16 pt-3">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          className="bg-gray-900 text-gray-200 border border-gray-700 rounded-lg px-4 py-2 w-64 ring-1 ring-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          placeholder="Search files..."
        />
      </div>

      <TableVirtuoso
        style={{
          // get height of window minus header
          height: window.innerHeight - 168,
        }}
        totalCount={rows.length}
        components={{
          Table: ({ style, ...props }) => {
            return (
              <table
                {...props}
                style={{
                  ...style,
                  width: "100%",
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                  borderSpacing: 0,
                }}
              />
            );
          },
          TableRow: (props) => {
            const index = props["data-index"];
            const row = rows[index];

            return (
              <tr {...props} className="hover:bg-gray-800">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-2 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          },
        }}
        fixedHeaderContent={() => {
          return table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header, i) => {
                if (i !== 0) {
                  return <th key={header.id} className="w-3 bg-black" />;
                }
                return (
                  <th
                    className="text-left text-lg p-4 pb-6 bg-black"
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width: header.getSize(),
                    }}
                  >
                    {header.isPlaceholder ? null : (
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                      <div
                        className="flex items-center"
                        {...{
                          style: header.column.getCanSort()
                            ? { cursor: "pointer", userSelect: "none" }
                            : {},
                          onClick: header.column.getToggleSortingHandler(),
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <ArrowUpIcon className="h-4 w-4" />,
                          desc: <ArrowDownIcon className="h-4 w-4" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          ));
        }}
      />
    </div>
  );
}
