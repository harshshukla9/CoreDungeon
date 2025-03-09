import { useState } from 'react';

import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { toast } from 'sonner';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

import { ArrowUpDown, Copy } from 'lucide-react';

interface Game {
  id: string;
  record: {
    id: string;
    timestamp: bigint;
    totalRounds: bigint;
    totalScore: bigint;
  };
  times: readonly {
    startTime: bigint;
    endTime: bigint;
    round: bigint;
  }[];
}

const columns: ColumnDef<Game>[] = [
  {
    accessorKey: 'id',
    header: 'Game ID',
    cell: ({ row }) => {
      const gameId = row.original.id;

      return (
        <div className='flex flex-row items-center gap-2'>
          {gameId}
          <Button
            className='m-0 h-8 w-8 p-0'
            variant='link'
            onClick={async () => {
              await navigator.clipboard.writeText(gameId);
              toast.success('Game ID copied to clipboard');
            }}
          >
            <Copy size={16} />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: 'record.timestamp',
    header: ({ column }) => {
      return (
        <Button
          variant='link'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Created At
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },

    cell: ({ row }) => {
      const createdAt = row.original.record.timestamp;

      // format data to 21:02 14 Jun, 2021
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      };
      const formattedDate = new Date(Number(createdAt)).toLocaleString(
        'en-US',
        options
      );

      return formattedDate;
    },
  },
  {
    accessorKey: 'record.totalScore',
    header: 'Score',
    cell: ({ row }) => {
      const totalScore = row.original.record.totalScore;

      return <div>{totalScore.toLocaleString()}</div>;
    },
  },
  {
    accessorKey: 'record.totalRounds',
    header: 'Rounds Completed',
    cell: ({ row }) => {
      const totalRounds = row.original.record.totalRounds;

      return <div>{totalRounds.toLocaleString()}</div>;
    },
  },
];

interface DataTableProps {
  data: Game[];
}

export const ProfileTable = ({ data }: DataTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div>
      <div className='flex items-center py-4'>
        <Input
          className='h-8 max-w-xs border-none bg-neutral-300 text-secondary outline-none placeholder:text-secondary'
          placeholder='Filter by Id...'
          value={
            (table.getColumn('id')?.getFilterValue() as string | null) ?? ''
          }
          onChange={(event) =>
            table.getColumn('id')?.setFilterValue(event.target.value)
          }
        />
      </div>
      <div className='rounded-md border border-secondary bg-[#15373fb1] text-neutral-300'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className='text-primary'>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='text-neutral-300'>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className='h-24 text-center'
                  colSpan={columns.length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>{' '}
    </div>
  );
};
