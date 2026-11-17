import type { Metadata } from "next";

import { Card, Empty } from "@/components/card";

export const metadata: Metadata = { title: "Grocery" };

export default function GroceryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Grocery list</h1>
      <Card>
        <Empty>Your grocery list is empty.</Empty>
      </Card>
    </div>
  );
}
