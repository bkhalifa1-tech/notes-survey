"use client";
import {useState} from "react";
export default function Login(){
 const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[error,setError]=useState("");const[busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setError("");setBusy(true);try{const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});if(!r.ok){setError(r.status===429?"محاولات كثيرة، انتظري 15 دقيقة.":"بيانات الدخول غير صحيحة أو الإعدادات غير مكتملة.");return;}window.location.assign("/admin");}catch{setError("تعذّر الاتصال، حاولي مجددًا.")}finally{setBusy(false)}}
 return <main dir="rtl" style={{maxWidth:420,margin:"10vh auto",padding:24}}><h1>دخول منظّمات الاستبيان</h1><p>هذه الصفحة للمشرفتين فقط.</p><form onSubmit={submit}><label>البريد الإلكتروني<input style={{display:"block",width:"100%",marginBottom:16}} type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>كلمة المرور<input style={{display:"block",width:"100%",marginBottom:16}} type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={busy} type="submit">{busy?"جارٍ التحقق…":"دخول"}</button>{error&&<p role="alert">{error}</p>}</form></main>
}
