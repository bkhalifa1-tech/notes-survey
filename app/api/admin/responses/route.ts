import { getDb } from "../../../../db";
import { responses } from "../../../../db/schema";
import { desc } from "drizzle-orm";
import { getAuthorizedAdminEmail } from "../../../../lib/admin-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = await getAuthorizedAdminEmail();
  if (!email) return Response.json({error: "غير مصرح"}, {status: 403, headers: {"Cache-Control": "no-store"}});
  const rows = await getDb().select().from(responses).orderBy(desc(responses.createdAt));
  return Response.json({rows}, {headers: {"Cache-Control": "no-store"}});
}
