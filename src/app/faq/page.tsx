import type { Metadata } from 'next';
import FAQClient from './FAQClient';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about The Sacred Hearts ministry, our products, shipping, returns, and the Enthronement of the Sacred Heart.',
};

const FAQS = [
  { q: 'Are purchases tax-deductible?', a: 'Yes! The Sacred Hearts is a registered 501(c)3 nonprofit. Every purchase is a tax-deductible donation and you will receive a receipt for your records.' },
  { q: 'Do you offer free shipping?', a: 'Most of our prints and plaques ship free within the United States. Any product marked "Free Shipping" in the title ships at no charge to US addresses.' },
  { q: 'Can I get images at a reduced price if I cannot afford them?', a: 'Absolutely. We believe no family should be without these sacred images for financial reasons. Please contact us directly at info@thesacredhearts.org or call 513.741.3400 and we will be happy to assist you.' },
  { q: 'What sizes are available?', a: 'Most prints and plaques are available in multiple sizes, reflected in the price ranges shown. Contact us or proceed to checkout to select your preferred size.' },
  { q: 'How long does shipping take?', a: 'Orders are processed within 2–3 business days. Standard delivery within the United States generally takes 5–10 business days from the date of shipment. Contact us for expedited options.' },
  { q: 'What is the Enthronement of the Sacred Heart?', a: 'The Enthronement is the act of formally placing an image of the Sacred Heart of Jesus in a place of honor in your home and consecrating your household to His reign. Our Enthronement Booklet provides a complete guide to this beautiful tradition.' },
  { q: 'Do you ship internationally?', a: 'Yes, we can ship internationally. Please contact us directly at info@thesacredhearts.org for international shipping rates and options.' },
  { q: 'What is your return policy?', a: 'We accept returns of unused, undamaged items within 30 days of purchase. If your item arrives damaged or defective, please contact us within 14 days of receipt and we will make it right.' },
  { q: 'How do I pay?', a: 'We use Stripe for secure online checkout. All major credit and debit cards are accepted. Your payment information is processed securely and never stored on our servers.' },
  { q: 'Can I place a bulk order for a parish or school?', a: 'Yes! We love working with parishes, schools, and religious organizations. Please contact us directly to discuss bulk pricing and special arrangements.' },
  { q: 'Do you offer a Parish Display?', a: 'Yes! We offer a complimentary parish display box so you can share Sacred Hearts images with your parishioners. Contact us to request yours.' },
];

export default function FAQPage() {
  return (
    <>
      <div className="page-hero">
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know about our ministry and products</p>
      </div>
      <div className="content-block">
        <FAQClient faqs={FAQS} />
      </div>
    </>
  );
}
