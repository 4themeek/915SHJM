import type { Metadata } from 'next';
import Script from 'next/script';
import '@/styles/globals.css';
import { CartProvider } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import Toast from '@/components/Toast';
import { getSetting } from '@/lib/db';

export const metadata: Metadata = {
  title: {
    default: 'The Sacred Hearts | Sacred Art Prints & Plaques',
    template: '%s | The Sacred Hearts',
  },
  description:
    'High-quality prints and plaques of the Sacred Heart of Jesus and Immaculate Heart of Mary. A 501(c)3 ministry based in Cincinnati, Ohio. Every purchase is a tax-deductible donation.',
  keywords: [
    'Sacred Heart of Jesus',
    'Immaculate Heart of Mary',
    'Catholic art',
    'religious plaques',
    'Catholic prints',
    'Enthronement',
    'Cincinnati',
    '501c3',
  ],
  openGraph: {
    title: 'The Sacred Hearts | Sacred Art Prints & Plaques',
    description:
      'Spread God\'s love with images of the Sacred Heart of Jesus and Immaculate Heart of Mary. 501(c)3 ministry — every purchase is tax-deductible.',
    url: 'https://www.thesacredhearts.org',
    siteName: 'The Sacred Hearts',
    locale: 'en_US',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const shopMaintenance = (await getSetting('shop_maintenance_mode')) === 'true';
  const freeShippingThreshold = parseFloat((await getSetting('free_shipping_threshold')) || '50');

  return (
    <html lang="en">
      <body>
        <CartProvider shopMaintenance={shopMaintenance} freeShippingThreshold={freeShippingThreshold}>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <Toast />
        </CartProvider>

        {/* Statcounter */}
        <Script id="statcounter-vars" strategy="afterInteractive">
          {`
            var sc_project=13339420;
            var sc_invisible=1;
            var sc_security="cb11581c";
          `}
        </Script>
        <Script
          src="https://www.statcounter.com/counter/counter.js"
          strategy="afterInteractive"
        />
        <noscript>
          <div className="statcounter">
            <a title="Web Analytics" href="https://statcounter.com/" target="_blank" rel="noreferrer">
              <img
                className="statcounter"
                src="https://c.statcounter.com/13339420/0/cb11581c/1/"
                alt="Web Analytics"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </a>
          </div>
        </noscript>
      </body>
    </html>
  );
}
