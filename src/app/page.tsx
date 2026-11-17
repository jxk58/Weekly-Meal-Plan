import Link from "next/link";

import { Card, Empty } from "@/components/card";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">This week</h1>

      <Card title="Meal plan">
        <Empty>
          No meals planned yet. <Link href="/meals">Plan this week</Link>
        </Empty>
      </Card>

      <Card title="Expiring soon">
        <Empty>
          Nothing expiring soon. <Link href="/inventory">View inventory</Link>
        </Empty>
      </Card>

      <Card title="Grocery list">
        <Empty>
          Your grocery list is empty. <Link href="/grocery">Open grocery list</Link>
        </Empty>
      </Card>
    </div>
  );
}
