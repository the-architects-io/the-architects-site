import { BASE_URL } from "@/constants/constants";
import Spinner from "@/features/UI/spinner";
import showToast from "@/features/toasts/show-toast";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/20/solid";
import { ClipboardIcon, EyeIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PublicKey } from "@metaplex-foundation/js";
import { ShdwDrive, StorageAccountV2 } from "@shadow-drive/sdk";
import {
  ColumnDef,
  SortingState,
  createColumnHelper,
  createTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { TableVirtuoso } from "react-virtuoso";

type DriveFileList = {
  filename: JSX.Element | string;
  copy: JSX.Element;
  delete: JSX.Element;
};

export default function DriveFileList({
  files,
  driveAddress,
  shadowDrive,
  storageAccount,
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
  const [data, setData] = useState<DriveFileList[]>([]);
  const [isBeingDeletedFiles, setIsBeingDeletedFiles] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);

  const columnHelper = createColumnHelper<DriveFileList>();

  const columns = useMemo<ColumnDef<DriveFileList>[]>(
    () => [
      {
        header: () => <div className="uppercase mr-4">Filename</div>,
        accessorKey: "filename",
        cell: (info) => info.getValue(),
        accessorFn: (row) => row.filename,
      },
      {
        header: () => "",
        accessorKey: "copy",
        cell: (info) => info.renderValue(),
        accessorFn: (row) => row.copy,
      },
      {
        header: () => "",
        accessorKey: "delete",
        cell: (info) => info.renderValue(),
        accessorFn: (row) => row.delete,
      },
    ],
    []
  );

  // const columns = useMemo<ColumnDef<DriveFileList | string | JSX.Element>[]>(
  //   () => [
  //     columnHelper.accessor("filename", {
  //       header: () => (
  //         <div className="self-start text-left uppercase mb-2">Filename</div>
  //       ),
  //       cell: (info) => info.getValue(),
  //       sortingFn: "alphanumericCaseSensitive",
  //     }),
  //     columnHelper.accessor((row) => row.copy, {
  //       header: () => "",
  //       id: "copy",
  //       cell: (info) => info.renderValue(),
  //     }),
  //     columnHelper.accessor("delete", {
  //       header: () => "",
  //       id: "delete",
  //       cell: (info) => info.renderValue(),
  //     }),
  //   ],
  //   []
  // );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const rerender = useReducer(() => ({}), {})[1];

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
          secondaryMessage: `Failed to delete ${filename}`,
        });
        return;
      } finally {
        setIsBeingDeletedFiles((prev) => [...prev, filename]);
      }

      // throw error if message does not containe `successfully deleted`
      if (!response?.message?.includes("successfully deleted")) {
        showToast({
          primaryMessage: "Error",
          secondaryMessage: `Failed to delete ${filename}`,
        });
        setIsBeingDeletedFiles((prev) => [...prev, filename]);
        return;
      }

      showToast({
        primaryMessage: "Deleted",
        secondaryMessage: "File deleted",
      });

      refetchFiles(shadowDrive);
      setIsBeingDeletedFiles((prev) =>
        prev.filter((isBeingDeletedFile) => isBeingDeletedFile !== filename)
      );
    },
    [driveAddress, isBeingDeletedFiles, refetchFiles, shadowDrive]
  );

  const renderFiles = useCallback(
    (files: string[]) => {
      setData(
        files.map((filename) => {
          return {
            filename: (
              <div className="flex items-center">
                <a
                  href={`https://shdw-drive.genesysgo.net/${driveAddress}/${filename}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  <div className="mr-4">{filename}</div>
                </a>
              </div>
            ),
            copy: (
              <div
                className="cursor-pointer w-3"
                onClick={() => handleCopyToClipboard(filename)}
              >
                <ClipboardIcon
                  height="1.5rem"
                  width="1.5rem"
                  className="h-6 w-6 flex-none hover:bg-sky-200"
                />
              </div>
            ),
            delete: (
              <div
                className="cursor-pointer flex justify-center flex-none w-3"
                onClick={
                  isBeingDeletedFiles.includes(filename)
                    ? () => {}
                    : () => handleDeleteFile(filename)
                }
              >
                {isBeingDeletedFiles.includes(filename) ? (
                  <Spinner />
                ) : (
                  <TrashIcon
                    height="1.5rem"
                    width="1.5rem"
                    className="h-6 w-6 flex-none hover:bg-red-300"
                  />
                )}
              </div>
            ),
          };
        })
      );
    },
    [driveAddress, handleCopyToClipboard, handleDeleteFile, isBeingDeletedFiles]
  );

  useEffect(() => {
    if (!files?.length) return;

    renderFiles(files);
  }, [
    files,
    handleCopyToClipboard,
    handleDeleteFile,
    isBeingDeletedFiles,
    renderFiles,
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
    <div className="p-2 w-full px-8 max-h-screen overflow-y-auto">
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
      {/* <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup, i) => (
            <>
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className="flex justify-start items-center mb-1"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : "",
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          <div className="flex justify-center items-center">
                            <div className="mr-3">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                            </div>
                            {{
                              asc: <ArrowUpIcon className="h-4 w-4" />,
                              desc: <ArrowDownIcon className="h-4 w-4" />,
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  className={classNames([
                    "py-2 whitespace-nowrap",
                    cell.id.endsWith("copy") || cell.id.endsWith("delete")
                      ? "w-12"
                      : "",
                  ])}
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table> */}
    </div>
  );
}
