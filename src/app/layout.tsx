import type { Metadata } from 'next';
import '@/styles/globals.css';
import { CartProvider } from '@/lib/cart-context';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import Toast from '@/components/Toast';

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <Toast />
        </CartProvider>
      </body>
    </html>
  );
}
