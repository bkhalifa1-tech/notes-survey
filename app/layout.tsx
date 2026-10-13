import type { Metadata } from 'next';
import './globals.css';
import SiteHeader from './site-header';
export const metadata: Metadata = { title: 'ملزمة بتكمّل طريقها | استطلاع UCAS IT CLUB', description: 'استطلاع أولي لقياس اهتمام الطلبة بتبادل الملازم والسلايدات المطبوعة.', icons: {icon:'/club-logo.webp'} };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="ar" dir="rtl"><body><SiteHeader/>{children}</body></html>}
