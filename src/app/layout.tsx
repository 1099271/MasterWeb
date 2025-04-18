import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ["latin"] });

// Restore static metadata object
export const metadata: Metadata = {
  title: "用户管理系统", // Reverted to static text
  description: "基于Next.js的用户管理系统", // Reverted to static text
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
