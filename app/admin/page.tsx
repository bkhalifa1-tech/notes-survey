import { getAuthorizedAdminEmail } from "../../lib/admin-access";
import Admin from "./panel";

export const dynamic = "force-dynamic";

export default async function Page() {
  const email = await getAuthorizedAdminEmail();
  if (!email) {
    return (
      <main>
        <h1>لوحة نتائج الاستطلاع محمية</h1>
        <p>يجب تسجيل الدخول عبر Cloudflare Access بالبريد المصرّح له.</p>
        <a href="/">العودة للاستطلاع</a>
      </main>
    );
  }
  return <Admin />;
}
