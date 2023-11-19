import React, { useMemo } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TableVirtuoso } from "react-virtuoso";

import { Recipient } from "@/app/blueprint/types";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

export const RecipientListTable = ({
  recipients,
}: {
  recipients: Recipient[];
}) => {
  const rerender = React.useReducer(() => ({}), {})[1];

  const [sorting, setSorting] = React.useState([]);

  const columns = useMemo<ColumnDef<Recipient>[]>(
    () => [
      {
        header: () => <div className="uppercase py-2 mr-4 px-4">Address</div>,
        accessorKey: "wallet.address",
        cell: (info) => (
          <div className="flex flex-col text-left px-4 overflow-hidden">
            <div className="truncate">{`${info.getValue()}`}</div>
          </div>
        ),
      },
      {
        header: () => (
          <div className="uppercase px-4 pl-24 bg-black ">Amount</div>
        ),
        id: "amount",
        accessorKey: "amount",
        cell: (info: any) => (
          <div className="flex flex-col text-left px-4 pl-24">
            <div>{`${info.getValue()}`}</div>
          </div>
        ),
      },
      // {
      //   accessorKey: "age",
      //   header: () => "Age",
      //   size: 50,
      // },
      // {
      //   accessorKey: "visits",
      //   header: () => <span>Visits</span>,
      //   size: 50,
      // },
      // {
      //   accessorKey: "status",
      //   header: "Status",
      // },
      // {
      //   accessorKey: "progress",
      //   header: "Profile Progress",
      //   size: 80,
      // },
    ],
    []
  );

  const [data, setData] = React.useState(recipients);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    // @ts-ignore
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  return (
    <div style={{ padding: "0.5rem" }}>
      <div style={{ height: "0.5rem" }} />

      <TableVirtuoso
        style={{ height: "500px", border: "1px solid lightgray" }}
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
              <tr {...props}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ padding: "6px" }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          },
        }}
        fixedHeaderContent={() => {
          return table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-black">
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{
                      width: header.getSize(),
                      padding: "2px 4px",
                      textAlign: "left",
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
                          asc: <ArrowUpIcon className="ml-2 h-4 w-4" />,
                          desc: <ArrowDownIcon className="ml-2 h-4 w-4" />,
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
};
