import type { Metadata, Viewport } from "next";
import { Cairo, Noto_Kufi_Arabic, Plus_Jakarta_Sans } from "next/font/google";
import { dirOf } from "@/i18n/config";
import { I18nProvider } from "@/i18n/provider";
import { getI18n } from "@/i18n/server";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo" });
const kufi = Noto_Kufi_Arabic({ subsets: ["arabic"], variable: "--font-kufi" });

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: t.site.name, template: `%s | ${t.site.name}` },
    description: t.site.description,
  };
}

export const viewport: Viewport = { themeColor: "#11332a" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getI18n();
  return (
    <html lang={locale} dir={dirOf(locale)} className={`${jakarta.variable} ${cairo.variable} ${kufi.variable}`}>
      <body className="min-h-dvh font-sans antialiased">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
