import "./globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import IntroManager from "@/components/animations/IntroManager";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body style={{ fontFamily: "system-ui, sans-serif" }} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <SmoothScrollProvider>
            <IntroManager>
              {children}
            </IntroManager>
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
