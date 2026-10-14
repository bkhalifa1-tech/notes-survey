import {isSameOrigin,allowLoginAttempt,verifyPassword,issueSession,sessionCookie} from "../../../../lib/admin-access";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 if(!isSameOrigin(request))return Response.json({error:"مرفوض"},{status:403});
 if(!(await allowLoginAttempt(request)))return Response.json({error:"محاولات كثيرة أو إعدادات غير مكتملة"},{status:429});
 let value:unknown;try{if(request.headers.get("content-type")?.split(";")[0]!=="application/json")throw 0;value=await request.json();}catch{return Response.json({error:"طلب غير صالح"},{status:400})}
 if(!value||typeof value!=="object")return Response.json({error:"طلب غير صالح"},{status:400});
 const v=value as Record<string,unknown>;
 const email=typeof v.email==="string"?v.email.trim().toLowerCase():"";
 const password=typeof v.password==="string"?v.password:"";
 if(!await verifyPassword(email,password))return Response.json({error:"بيانات غير صحيحة"},{status:401});
 try{const token=await issueSession(email);return Response.json({ok:true},{headers:{"Set-Cookie":sessionCookie(token),"Cache-Control":"no-store"}});}catch{return Response.json({error:"لم تكتمل إعدادات الدخول"},{status:503})}
}
