import { connection } from "next/server";

export async function GET() {
  await connection(); // answer per request rather than serving a build-time snapshot
  return Response.json({ status: "ok" });
}
