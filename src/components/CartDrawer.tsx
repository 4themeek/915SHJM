'use client';

import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { loadStripe } from '@stripe/stripe-js';
import styles from './CartDrawer.module.css';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

export default function CartDrawer() {
  const { cart, isOpen, closeCart, changeQty, removeFromCart, cartTotal } = useCart();

  async function handleCheckout() {
    // This calls your API route which creates a Stripe Checkout Session
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart }),
    });
    const { sessionId } = await res.json();
    const stripe = await stripePromise;
    if (stripe && sessionId) {
      await stripe.redirectToCheckout({ sessionId });
    }
  }

  return (
    <>
      <div
        className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside className={`${styles.drawer} ${isOpen ? styles.open : ''}`} aria-label="Shopping cart">
        <div className={styles.header}>
          <h3>✦ Your Cart</h3>
          <button onClick={closeCart} className={styles.closeBtn} aria-label="Close cart">×</button>
        </div>

        <div className={styles.body}>
          {cart.length === 0 ? (
            <div className={styles.empty}>
              <p>Your cart is empty.</p>
              <p>Browse our collection of sacred prints and plaques.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className={styles.item}>
                <div className={styles.itemImg}>
                  <Image
                    src={item.img}
                    alt={item.name}
                    fill
                    sizes="70px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className={styles.itemPrice}>from ${item.startPrice.toFixed(2)}</p>
                  <div className={styles.qtyRow}>
                    <button className={styles.qtyBtn} onClick={() => changeQty(item.id, -1)}>−</button>
                    <span className={styles.qty}>{item.qty}</span>
                    <button className={styles.qtyBtn} onClick={() => changeQty(item.id, 1)}>+</button>
                    <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.total}>
              <span>Estimated Total</span>
              <span>from ${cartTotal.toFixed(2)}</span>
            </div>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              Proceed to Checkout via Stripe
            </button>
            <p className={styles.note}>Secure checkout · All major cards accepted</p>
          </div>
        )}
      </aside>
    </>
  );
}
