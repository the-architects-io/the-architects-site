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
import Link from "next/link";
import { Token } from "@/app/blueprint/types";
import { dayjs } from "@/utils/date-time";
import {
  formatNumberWithCommas,
  getAbbreviatedAddress,
} from "@/utils/formatting";
import Image from "next/image";

export const PremintTokensTable = ({ tokens }: { tokens: Token[] }) => {
  const rerender = React.useReducer(() => ({}), {})[1];
  const [sorting, setSorting] = React.useState([]);
  const [formattedPremintTokens, setFormattedPremintTokens] = useState<Token[]>(
    []
  );

  useEffect(() => {
    if (tokens?.length > 0) {
      setFormattedPremintTokens(
        tokens.map((token) => {
          return {
            ...token,
          };
        })
      );
    }
  }, [tokens]);

  const columns = useMemo<ColumnDef<Token>[]>(
    () => [
      {
        header: () => <div className="uppercase py-2 mr-4 px-4">Image</div>,
        size: 8,
        accessorKey: "image",
        cell: (info) => (
          <div className="flex flex-col px-4">
            <Image
              src={info.getValue() as string}
              alt="Premint Token Image"
              width={100}
              height={100}
            />
          </div>
        ),
      },
      {
        header: () => <div className="uppercase py-2 mr-4 px-4">Name</div>,
        size: 24,
        accessorKey: "name",
        cell: (info) => (
          <div className="flex px-4">
            <div>{`${info?.getValue()}`}</div>
          </div>
        ),
      },
      {
        header: () => (
          <div className="uppercase py-2 mr-4 px-4">Description</div>
        ),
        size: 16,
        accessorKey: "description",
        cell: (info) => (
          <div className="flex flex-col px-4">
            <div>{`${info?.getValue()}`}</div>
          </div>
        ),
      },
    ],
    []
  );

  const [data, setData] = useState(formattedPremintTokens);

  useEffect(() => {
    setData(formattedPremintTokens);
  }, [formattedPremintTokens]);

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
        style={{ height: "55vh", border: "1px solid lightgray" }}
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
                    {<Link href={`/admin/token/${row.original.id}`}></Link>}
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
