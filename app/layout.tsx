import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title:"마음의 픽셀 | Jev 감정 분석", description:"텍스트에 담긴 여덟 가지 감정을 Jev로 살펴보고 픽셀 아트 표정으로 만나보세요.", icons:{ icon:"/favicon.svg" } };
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
