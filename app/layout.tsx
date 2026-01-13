import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "服务管理面板",
  description: "统一管理所有服务的入口",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
