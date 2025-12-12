import {
  ArrowRight,
  ChevronLeft,
  ShoppingBag,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // Update localStorage whenever the cartItems state changes.
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // // Increment quantity for the given product id.
  // const handleIncrement = (id) => {
  //   const updatedCart = cartItems.map((item) =>
  //     item.id === id ? { ...item, quantity: item.quantity + 1 } : item
  //   );
  //   setCartItems(updatedCart);
  // };

  // // Decrement quantity for the given product id (minimum 1).
  // const handleDecrement = (id) => {
  //   const updatedCart = cartItems.map((item) =>
  //     item.id === id && item.quantity > 1
  //       ? { ...item, quantity: item.quantity - 1 }
  //       : item
  //   );
  //   setCartItems(updatedCart);
  // };

  // Remove an item from the cart.
  const handleRemove = (id) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    setCartItems(updatedCart);
  };

  // Calculate subtotal, shipping, and total.
  const subtotal = cartItems.reduce(
    (acc, item) =>
      acc +
      (item.discountRate > 0
        ? item.discountedPrice * item.quantity
        : item.price * item.quantity),
    0
  );
  const shipping = 0;
  const total = subtotal + shipping;

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <section className="bg-surface py-24">
        <div className="container-custom text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-card">
            <ShoppingBag className="h-10 w-10 text-ink-muted" />
          </div>
          <h1 className="mt-8 text-3xl font-semibold text-ink">
            Your cart is empty
          </h1>
          <p className="mt-4 text-ink-muted">
            Discover tailored looks curated just for you.
          </p>
          <Link to="/products" className="btn btn-primary mt-8 inline-flex">
            Continue shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-surface py-16">
      <div className="container-custom">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/Category"
            className="inline-flex items-center gap-2 text-ink-muted hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
            Continue shopping
          </Link>
          <h1 className="text-3xl font-semibold text-ink">Your cart</h1>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            {cartItems.map((item) => (
              <div key={item._id} className="glass-card p-6">
                <div className="flex gap-6">
                  <div className="h-32 w-28 overflow-hidden rounded-2xl">
                    <img
                      src={item.images?.primary}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-ink">
                          {item.title}
                        </h3>
                      </div>
                      <button
                        className="text-ink-muted hover:text-ink"
                        onClick={() => handleRemove(item._id)}
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div className="rounded-full border border-surface-muted px-4 py-2 text-sm text-ink">
                        Quantity: {item.quantity}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-ink-muted">Item total</p>
                        <p className="text-xl font-semibold text-ink">
                          PKR  
                          {item.discountRate > 0
                            ? (item.discountedPrice * item.quantity).toLocaleString('en-PK')
                            : (item.price * item.quantity).toLocaleString('en-PK')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card sticky top-24 h-fit p-6">
            <h2 className="text-xl font-semibold text-ink">Order summary</h2>
            <div className="mt-6 space-y-3 text-ink">
              <div className="flex justify-between text-ink-muted">
                <span>
                  Subtotal (
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}{" "}
                  items)
                </span>
                <span>PKR {subtotal.toLocaleString('en-PK')}</span>
              </div>
              <div className="border-t border-surface-muted pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>PKR {total.toLocaleString('en-PK')}</span>
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">
                  Taxes included
                </p>
              </div>
            </div>
            <Link
              to="/checkout"
              className="btn btn-primary mt-6 flex w-full items-center justify-center gap-2"
            >
              Proceed to checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Cart;
