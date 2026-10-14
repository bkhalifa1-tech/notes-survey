import { env } from "cloudflare:workers";
import { headers } from "next/headers";

const COOKIE = "survey_admin_session";
const MAX_AGE = 60 * 60 * 8;
const accounts = ["haladalloul42@gmail.com", "banany2007k@gmail.com"] as const;
const enc = new TextEncoder();
const b64 = (data: Uint8Array) => btoa(String.fromCharCode(...data)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const bytes = (value: string) => Uint8Array.from(atob(value.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(value.length/4)*4,"=")),c=>c.charCodeAt(0));
const config = () => env as unknown as Record<string,string|undefined>;
function passwordFor(email:string): string|undefined {
  return email === accounts[0] ? config().SURVEY_ADMIN_PASSWORD_HALA :
    email === accounts[1] ? config().SURVEY_ADMIN_PASSWORD_BANAN : undefined;
}
async function mac(payload:string):Promise<string> {
 const secret=config().SURVEY_SESSION_SECRET;
 if(!secret || secret.length<32) throw new Error("Admin session secret not configured");
 const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 return b64(new Uint8Array(await crypto.subtle.sign("HMAC",key,enc.encode(payload))));
}
function safeEqual(a:string,b:string) {
 const aa=enc.encode(a),bb=enc.encode(b);let delta=aa.length^bb.length;
 for(let i=0;i<Math.max(aa.length,bb.length);i++)delta|=(aa[i]??0)^(bb[i]??0);
 return delta===0;
}
export async function verifyPassword(email:string,password:string):Promise<boolean> {
 const expected=passwordFor(email);
 if(!expected || expected.length<16 || password.length>256) return false;
 // Compare hashes in constant time; passwords remain Cloudflare encrypted secrets, never in GitHub.
 const digest=async (s:string)=>b64(new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode(s))));
 return safeEqual(await digest(expected),await digest(password));
}
export async function issueSession(email:string):Promise<string> {
 if(!accounts.includes(email as typeof accounts[number]))throw new Error("Unauthorized");
 const payload=b64(enc.encode(JSON.stringify({email,exp:Math.floor(Date.now()/1000)+MAX_AGE,nonce:crypto.randomUUID()})));
 return payload+"."+(await mac(payload));
}
export async function getAuthorizedAdminEmail():Promise<string|null> {
 try {
  const cookie=(await headers()).get("cookie")?.split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="))?.slice(COOKIE.length+1);
  if(!cookie)return null;
  const parts=cookie.split(".");if(parts.length!==2 || !safeEqual(await mac(parts[0]),parts[1]))return null;
  const p=JSON.parse(new TextDecoder().decode(bytes(parts[0]))) as {email?:string,exp?:number};
  if(typeof p.email!=="string" || !accounts.includes(p.email as typeof accounts[number]) || typeof p.exp!=="number" || p.exp<=Date.now()/1000)return null;
  return p.email;
 }catch{return null}
}
export const sessionCookie=(token:string)=>`${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`;
export const clearSessionCookie=()=>`${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
export const isSameOrigin=(request:Request)=>{
 const origin=request.headers.get("origin");
 return Boolean(origin && origin===new URL(request.url).origin);
};
export async function allowLoginAttempt(request:Request):Promise<boolean> {
 const database=config().DB as unknown as D1Database|undefined;
 if(!database)return false;
 const ip=request.headers.get("cf-connecting-ip");
 if(!ip)return false;
 const key=b64(new Uint8Array(await crypto.subtle.digest("SHA-256",enc.encode("survey-login:"+ip))));
 const time=Math.floor(Date.now()/1000),window=Math.floor(time/900);
 try {
  const result=await database.prepare("INSERT INTO admin_login_limits (ip_hash, window, attempts) VALUES (?, ?, 1) ON CONFLICT(ip_hash, window) DO UPDATE SET attempts = attempts + 1 RETURNING attempts").bind(key,window).first<{attempts:number}>();
  return Boolean(result && result.attempts<=5);
 }catch{return false}
}
