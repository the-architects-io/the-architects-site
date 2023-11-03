import React, { useMemo, useState } from "react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  FilterFn,
  SortingFn,
  sortingFns,
  ColumnDef,
  FilterFnOption,
  getFilteredRowModel,
} from "@tanstack/react-table";
import dataJSON from "./MOCK_DATA.json";
import { compareItems, rankItem } from "@tanstack/match-sorter-utils";

type DriveFileList = {
  filename: string;
  copy: string;
  delete: string;
};

const SortTable = () => {
  const columnDef = useMemo<ColumnDef<DriveFileList>[]>(
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

  const finalData = React.useMemo(() => dataJSON, []);
  const finalColumnDef = React.useMemo(() => columnDef, []);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filtering, setFiltering] = useState<string>("");

  // const fuzzySort: SortingFn<any> = (rowA, rowB, columnId) => {
  //   let dir = 0;

  //   // Only sort by rank if the column has ranking information
  //   if (rowA.columnFiltersMeta[columnId]) {
  //     dir = compareItems(
  //       // @ts-ignore
  //       rowA.columnFiltersMeta[columnId]?.itemRank!,
  //       // @ts-ignore
  //       rowB.columnFiltersMeta[columnId]?.itemRank!
  //     );
  //   }

  //   // Provide an alphanumeric fallback for when the item ranks are equal
  //   return dir === 0 ? sortingFns.alphanumeric(rowA, rowB, columnId) : dir;
  // };

  const tableInstance = useReactTable({
    columns: finalColumnDef,
    data: finalData,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting: sorting,
      globalFilter: filtering,
    },
    onSortingChange: setSorting,
  });

  //   console.log("test", tableInstance.getHeaderGroups());

  return (
    <>
      <input type="text" onChange={(e) => setFiltering(e.target.value)} />
      <table>
        <thead>
          {tableInstance.getHeaderGroups().map((headerEl) => {
            return (
              <tr key={headerEl.id}>
                {headerEl.headers.map((columnEl) => {
                  return (
                    <th
                      key={columnEl.id}
                      colSpan={columnEl.colSpan}
                      onClick={columnEl.column.getToggleSortingHandler()}
                    >
                      {columnEl.isPlaceholder
                        ? null
                        : flexRender(
                            columnEl.column.columnDef.header,
                            columnEl.getContext()
                          )}
                      {/* CODE FOR UP AND DOWN SORTING */}
                      {
                        { asc: " -UP", desc: " -DOWN" }[
                          (columnEl.column.getIsSorted() as string) ?? null
                        ]
                      }
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody>
          {tableInstance.getRowModel().rows.map((rowEl) => {
            return (
              <tr key={rowEl.id}>
                {rowEl.getVisibleCells().map((cellEl) => {
                  return (
                    <td key={cellEl.id}>
                      {flexRender(
                        cellEl.column.columnDef.cell,
                        cellEl.getContext()
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

export default SortTable;
