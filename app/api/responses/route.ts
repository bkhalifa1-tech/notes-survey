import { env } from 'cloudflare:workers';
import { z } from 'zod';
import { getDb } from '../../../db';
import { responses } from '../../../db/schema';
import { desc } from 'drizzle-orm';
import { getChatGPTUser } from '../../chatgpt-auth';
export const dynamic = 'force-dynamic';
const choice=z.enum(['نعم','ربما','لا']);
const schema=z.object({id:z.string().uuid(),region:z.enum(['غزة','الجنوب']),southArea:z.enum(['النصيرات','خانيونس','غير ذلك']).nullable().optional(),major:z.string().trim().min(2).max(100),level:z.enum(['الأول','الثاني','الثالث','الرابع','الخامس أو أكثر','خريج / خريجة']),interest:choice,donate:choice,donateCourses:z.string().trim().max(1500),need:choice,needLevel:z.enum(['مرتفع','متوسط','منخفض']).nullable().optional(),needCourses:z.string().trim().max(1500),attendance:z.enum(['نعم، حسب الموعد','أحتاج إلى مساعدة في التسليم أو الاستلام','لا أستطيع الحضور','لا ينطبق']),notes:z.string().trim().max(1500)}).refine(v=>v.donate!=='نعم'||v.donateCourses.length>0,{message:'يرجى تحديد مساقات التبرع'}).refine(v=>v.need!=='نعم'||v.needCourses.length>0,{message:'يرجى تحديد المساقات المطلوبة'}).refine(v=>v.need==='لا'||!!v.needLevel,{message:'يرجى تحديد مدى الاحتياج'}).refine(v=>v.region!=='الجنوب'||!!v.southArea,{message:'يرجى تحديد المنطقة في الجنوب'});
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return Response.json({error:'يرجى الإرسال من صفحة الاستطلاع.'},{status:403});
 if(request.headers.get('content-type')?.split(';')[0]!=='application/json')return Response.json({error:'طلب غير صالح'},{status:415});
 const raw=await request.text();if(raw.length>12000)return Response.json({error:'الرد أطول من المسموح.'},{status:413});
 let data;try {data=schema.safeParse(JSON.parse(raw));}catch{return Response.json({error:'بيانات غير صالحة.'},{status:400})}
 if(!data.success)return Response.json({error:'يرجى إكمال الحقول المطلوبة والتحقق من الإجابات.'},{status:400});
 try{
 const v=data.data;await getDb().insert(responses).values({...v,southArea:v.region==='الجنوب'?v.southArea:null,donateCourses:v.donate==='لا'?'':v.donateCourses,needCourses:v.need==='لا'?'':v.needCourses,needLevel:v.need==='لا'?null:v.needLevel,createdAt:Date.now()}).onConflictDoNothing();
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'تعذر حفظ الإجابة الآن. حاولي مجددًا؛ لن تتكرر إجابتك عند إعادة المحاولة.'},{status:503})}
}
export async function GET(){
 const user=await getChatGPTUser();const admin=(env as unknown as Record<string,string>).SURVEY_ADMIN_EMAIL;
 if(!admin||!user||user.email.toLowerCase()!==admin.toLowerCase())return Response.json({error:'غير مصرح'},{status:403,headers:{'Cache-Control':'no-store'}});
 const rows=await getDb().select().from(responses).orderBy(desc(responses.createdAt));
 return Response.json({rows},{headers:{'Cache-Control':'no-store'}});
}
