import { env } from 'cloudflare:workers';
import { requireChatGPTUser } from '../chatgpt-auth';
import Admin from './panel';
export const dynamic='force-dynamic';
export default async function Page(){const u=await requireChatGPTUser('/admin');const email=(env as unknown as Record<string,string>).SURVEY_ADMIN_EMAIL;
 if(!email||u.email.toLowerCase()!==email.toLowerCase())return <main><h1>هذه الصفحة مخصصة لمنظِّمة الاستطلاع</h1><p>الرجاء تسجيل الدخول بالحساب الذي أُنشئ منه الاستطلاع.</p><a href="/">العودة للاستطلاع</a></main>;
 return <Admin/>}
