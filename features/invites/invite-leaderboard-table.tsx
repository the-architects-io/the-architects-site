"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TableVirtuoso } from "react-virtuoso";
import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";
import { InviteCount } from "@/app/blueprint/types";

export const InviteLeaderboardTable = ({
  inviteCounts,
}: {
  inviteCounts: InviteCount[];
}) => {
  const rerender = React.useReducer(() => ({}), {})[1];

  const [sorting, setSorting] = React.useState([]);
  const [formattedInviteCounts, setFormattedInviteCounts] = useState<
    InviteCount[]
  >([]);

  useEffect(() => {
    if (inviteCounts.length > 0) {
      setFormattedInviteCounts(inviteCounts);
    }
  }, [inviteCounts]);

  const columns = useMemo<ColumnDef<InviteCount>[]>(
    () => [
      {
        header: () => <div className="uppercase py-2 mr-4 px-4">User</div>,
        size: 32,
        accessorKey: "displayName",
        cell: (info) => (
          <div className="flex flex-col px-4">
            <div>{`${info?.getValue()}`}</div>
          </div>
        ),
      },
      {
        header: () => <div className="uppercase py-2 mr-4 px-4">Count</div>,
        size: 32,
        accessorKey: "inviteCount",
        cell: (info) => <div className="truncate">{`${info.getValue()}`}</div>,
      },
    ],
    []
  );

  useEffect(() => {
    setData(formattedInviteCounts);
  }, [formattedInviteCounts]);

  const [data, setData] = useState(formattedInviteCounts);

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
    <div className="w-full" style={{ padding: "0.5rem" }}>
      <div style={{ height: "0.5rem" }} />

      <TableVirtuoso
        style={{ height: "75vh", border: "1px solid lightgray" }}
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
                  <td key={cell.id} className="py-2 mx-4 overflow-auto">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          },
        }}
        fixedHeaderContent={() => {
          return table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="bg-gray-800">
              {headerGroup.headers.map((header) => {
                return (
                  <th
                    key={header.id}
                    className="text-xs"
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
