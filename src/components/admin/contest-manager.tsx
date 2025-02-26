"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Contest } from "@/db/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContestForm } from "@/components/contests/contest-form";
import { PlusIcon } from "lucide-react";
import { DataTable } from "../ui/data-table";





const columns: ColumnDef<Contest>[] =                                                                                                                                                                                                                                    [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => row.original.type.toUpperCase(),
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString(),
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString(),
  },
];

export function ContestManager({ contests }: { contests: Contest[] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          New Contest
        </Button>
      </div>
      
      <DataTable
        columns={columns}
        data={contests}
        searchKey="title"
        emptyState={
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No Contests Found</h3>
            <p className="text-muted-foreground">
              Create a new contest to get started
            </p>
          </div>
        }
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Contest</DialogTitle>
          </DialogHeader>
          <ContestForm onSuccess={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
} 