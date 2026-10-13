'use client';
import { useEffect, useState } from 'react';
export default function SiteHeader(){
 const [dark,setDark]=useState(false);
 useEffect(()=>{try{const on=localStorage.getItem('ucas-theme')==='dark';setDark(on);document.documentElement.classList.toggle('dark',on)}catch{}},[]);
 function toggle(){const on=!dark;setDark(on);document.documentElement.classList.toggle('dark',on);try{localStorage.setItem('ucas-theme',on?'dark':'light')}catch{}}
 return <header className="top"><a href="/" className="brand"><img src="/club-logo.webp" width="32" height="42" alt="شعار النادي التكنولوجي"/><span dir="ltr">UCAS IT CLUB</span></a><nav aria-label="روابط الاستبيان"><a className="active-link" href="/">الاستبيان</a><a href="https://ucas.itclub-143.workers.dev/" target="_blank" rel="noopener noreferrer">موقع النادي <span aria-hidden="true">↗</span></a></nav><button type="button" className="theme-toggle" onClick={toggle} aria-label={dark?'تفعيل الوضع الفاتح':'تفعيل الوضع الداكن'} aria-pressed={dark} title={dark?'الوضع الفاتح':'الوضع الداكن'}>{dark?<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>:<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M20.5 13A8.7 8.7 0 1 1 11 3.5 7 7 0 0 0 20.5 13Z"/></svg>}</button></header>
}
