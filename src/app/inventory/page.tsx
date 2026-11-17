import type { Metadata } from "next";

import { Card, Empty } from "@/components/card";
import { labelFor, STORAGE_LOCATIONS } from "@/lib/domain";

export const metadata: Metadata = { title: "Inventory" };

export default function InventoryPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Inventory</h1>
      {STORAGE_LOCATIONS.map((location) => (
        <Card key={location} title={labelFor(location)}>
          <Empty>No items.</Empty>
        </Card>
      ))}
    </div>
  );
}
