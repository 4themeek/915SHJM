'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, changeQty, removeFromCart, cartTotal, freeShippingThreshold } = useCart();
  const router = useRouter();

  const amountToFreeShipping = freeShippingThreshold - cartTotal;

  function handleCheckout() {
    closeCart();
    router.push('/checkout');
  }

  function handleContinueShopping() {
    closeCart();
    router.push('/shop');
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
              <button className={styles.continueBtn} onClick={handleContinueShopping}>
                Continue Shopping
              </button>
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
                  <p className={styles.itemPrice}>${item.startPrice.toFixed(2)}</p>
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
            {freeShippingThreshold > 0 && (
              <p className={styles.shippingProgress}>
                {amountToFreeShipping > 0
                  ? `Add $${amountToFreeShipping.toFixed(2)} more to qualify for free shipping (orders over $${freeShippingThreshold.toFixed(2).replace(/\.00$/, '')})`
                  : '✦ Your order qualifies for free shipping!'}
              </p>
            )}
            <div className={styles.total}>
              <span>Estimated Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>
              Proceed to Checkout
            </button>
            <button className={styles.continueBtn} onClick={handleContinueShopping}>
              Continue Shopping
            </button>
            <p className={styles.note}>Secure checkout · All major cards accepted</p>
          </div>
        )}
      </aside>
    </>
  );
}
