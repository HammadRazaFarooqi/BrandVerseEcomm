import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Checkout() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "cod",
  });

  const [cartItems, setCartItems] = useState([]);
  const [loader, setLoader] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const shippingCost = 0;

  // Popup state

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);

    // Calculate subtotal
    // const total = storedCart.reduce(
    //   (acc, item) => acc + item.price * item.quantity,
    //   0
    // );
    const total = storedCart.reduce(
      (acc, item) =>
        acc +
        (item.discountRate > 0
          ? item.discountedPrice * item.quantity
          : item.price * item.quantity),
      0
    );
    setSubtotal(total);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  function cartItemsForCheckout() {
    return cartItems.map((item) => ({
      _id: item._id,
      title: item.title,
      price: item.discountRate > 0 ? item.discountedPrice : item.price,
      images: item.images,
      selectedSize: item.selectedSize?.size || null, // Extract only the size
      quantity: item.selectedSize?.quantity || 1, // Ensure quantity is included
    }));
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoader(true);
    const orderData = {
      customer: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
      },
      paymentMethod: formData.paymentMethod,
      status: "processing",
      items: cartItemsForCheckout(),
      totalAmount: subtotal + shippingCost,
    };
    const BACKEND_URL = import.meta.env.VITE_API_URL;
    console.log({ orderData });
    try {
      const response = await fetch(`${BACKEND_URL}/products/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to place order");
      }

      const data = await response.json();

      window.location.href = data.url;
      setLoader(false);
      // setOrderId(data.orderId);
      // setShowPopup(true);
    } catch (error) {
      console.error("Error placing order:", error);
      setLoader(false);
      // You might want to show an error message to the user here
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <section className="bg-white py-16">
      <div className="container-custom">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-ink">Checkout</h1>
          <Link to="/cart" className="text-ink-muted hover:text-ink">
            Return to cart
          </Link>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[2fr_1fr]">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="glass-card rounded-[2rem] p-8">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-ink">
                  Contact Information
                </h2>
                <Link
                  to="/login"
                  className="text-xs uppercase tracking-[0.3em] text-ink-muted"
                >
                  Login
                </Link>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="rounded-full border border-surface-muted px-5 py-3"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="rounded-full border border-surface-muted px-5 py-3"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="rounded-full border border-surface-muted px-5 py-3"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="rounded-full border border-surface-muted px-5 py-3"
                  required
                />
              </div>
            </div>

            <div className="glass-card rounded-[2rem] p-8">
              <h2 className="text-xl font-semibold text-ink">
                Shipping Address
              </h2>
              <div className="mt-6 space-y-4">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street Address"
                  className="rounded-full border border-surface-muted px-5 py-3"
                  required
                />
                <div className="grid gap-4 md:grid-cols-3">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="rounded-full border border-surface-muted px-5 py-3"
                    required
                  />
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Country"
                    className="rounded-full border border-surface-muted px-5 py-3"
                    required
                  />
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="Postal Code"
                    className="rounded-full border border-surface-muted px-5 py-3"
                    required
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full">
              {loader ? "Placing Order" : "Place Order"}
            </button>
          </form>

          <div className="glass-card h-fit rounded-[2rem] p-8">
            <h2 className="text-xl font-semibold text-ink">Order Summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-ink">
                <span>Subtotal</span>
                <span>PKR {subtotal.toFixed(2)}</span>
              </div>
              <div className="border-t border-surface-muted pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>PKR {(subtotal + shippingCost).toFixed(2)}</span>
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-muted">
                  Taxes included
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
