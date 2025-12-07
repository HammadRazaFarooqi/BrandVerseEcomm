import { useState, useEffect, useRef } from "react";
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
  const [activeAccordion, setActiveAccordion] = useState("cod");
  const [paymentProof, setPaymentProof] = useState(null);
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const errorRef = useRef(null);

  const shippingCost = 0;
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const isAlpha = (value) => /^[A-Za-z\s]+$/.test(value);
  const isNumeric = (value) => /^[0-9]+$/.test(value);
  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.includes(".com");

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);

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

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [errors]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should not exceed 5MB");
        e.target.value = null;
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload only image files (JPEG, PNG, GIF, WEBP)");
        e.target.value = null;
        return;
      }
      setPaymentProof(file);
    }
  };

  const toggleAccordion = (method) => {
    setActiveAccordion(method);
    setFormData({ ...formData, paymentMethod: method });
  };

  function cartItemsForCheckout() {
    return cartItems.map((item) => ({
      _id: item._id,
      title: item.title,
      price: item.discountRate > 0 ? item.discountedPrice : item.price,
      images: Array.isArray(item.images)
        ? item.images.map(img => typeof img === "string" ? img : img.primary)
        : item.images?.primary
          ? [item.images.primary]
          : [],
      selectedSize: item.selectedSize || null,
      quantity: item.quantity || 1,
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!isAlpha(formData.firstName))
      newErrors.firstName = "Only letters allowed in First Name";
    if (!isAlpha(formData.lastName))
      newErrors.lastName = "Only letters allowed in Last Name";
    if (!isValidEmail(formData.email))
      newErrors.email = "Email must contain @ and .com";
    if (!isNumeric(formData.phone))
      newErrors.phone = "Only numbers allowed in Phone";
    if (!isAlpha(formData.city))
      newErrors.city = "Only letters allowed in City";
    if (!isAlpha(formData.state))
      newErrors.state = "Only letters allowed in Country";
    if (!isNumeric(formData.zipCode))
      newErrors.zipCode = "Only numbers allowed in Postal Code";

    if (activeAccordion === "bank" && !paymentProof)
      newErrors.paymentProof = "Payment proof is required for bank transfer";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setErrorMessage("Please fix the errors below before submitting.");
      return;
    }

    setErrors({});
    setErrorMessage("");
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
      items: cartItemsForCheckout(),
      totalAmount: subtotal + shippingCost,
    };

    const formDataToSend = new FormData();
    formDataToSend.append("orderData", JSON.stringify(orderData));

    if (paymentProof) {
      formDataToSend.append("paymentProof", paymentProof);
    }

    try {
      const response = await fetch(`${BACKEND_URL}/checkout`, {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      localStorage.removeItem("cart");
      window.location.href = "/checkout-success";
    } catch (err) {
      console.error("Order Error:", err);
      setErrorMessage(err.message || "Failed to place order");
    } finally {
      setLoader(false);
    }
  };

  const renderFormFields = () => (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="rounded-full border border-surface-muted px-5 py-3 focus:outline-none focus:border-ink"
          required
        />
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="rounded-full border border-surface-muted px-5 py-3 focus:outline-none focus:border-ink"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="rounded-full border border-surface-muted px-5 py-3 focus:outline-none focus:border-ink"
          required
        />
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="rounded-full border border-surface-muted px-5 py-3 focus:outline-none focus:border-ink"
          required
        />
      </div>

      <div className="space-y-4 mt-4">
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Street Address"
          className="w-full rounded-full border border-surface-muted px-5 py-3 focus:outline-none focus:border-ink"
          required
        />
        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className="rounded-full border border-surface-muted px-5 py-3 focus:outline-none focus:border-ink"
            required
          />
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Country"
            className="rounded-full border border-surface-muted px-5 py-3 focus:outline-none focus:border-ink"
            required
          />
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="Postal Code"
            className="rounded-full border border-surface-muted px-5 py-3 focus:outline-none focus:border-ink"
            required
          />
        </div>
      </div>
    </>
  );

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
          <div className="space-y-10">
            {/* Top error modal */}
            {Object.keys(errors).length > 0 && (
              <div ref={errorRef} className="bg-red-100 border border-red-400 text-red-700 px-6 py-3 rounded-lg text-center mb-6">
                <ul className="list-disc list-inside text-left">
                  {Object.entries(errors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            )}


            {/* COD Accordion */}
            <div className="glass-card rounded-[2rem] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion("cod")}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-surface-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={activeAccordion === "cod"}
                    onChange={() => { }}
                    className="w-5 h-5"
                  />
                  <h2 className="text-xl font-semibold text-ink">
                    Cash on Delivery
                  </h2>
                </div>
                <svg
                  className={`w-6 h-6 transition-transform ${activeAccordion === "cod" ? "rotate-180" : ""
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {activeAccordion === "cod" && (
                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-ink mb-6">
                      Contact & Shipping Info
                    </h3>
                    {renderFormFields()}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={loader}
                  >
                    {loader ? "Placing Order..." : "Place Order"}
                  </button>
                </form>
              )}
            </div>

            {/* Bank Transfer Accordion */}
            <div className="glass-card rounded-[2rem] overflow-hidden">
              <button
                type="button"
                onClick={() => toggleAccordion("bank")}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-surface-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={activeAccordion === "bank"}
                    onChange={() => { }}
                    className="w-5 h-5"
                  />
                  <h2 className="text-xl font-semibold text-ink">
                    Bank Transfer
                  </h2>
                </div>
                <svg
                  className={`w-6 h-6 transition-transform ${activeAccordion === "bank" ? "rotate-180" : ""
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {activeAccordion === "bank" && (
                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
                  <div className="bg-surface-muted/30 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-ink mb-4">
                      Bank Account Details
                    </h3>
                    <div className="space-y-2 text-ink">
                      <p>
                        <span className="font-semibold">Bank Name:</span> Meezan Bank
                      </p>
                      <p>
                        <span className="font-semibold">Account Title:</span> Your Company Name
                      </p>
                      <p>
                        <span className="font-semibold">Account Number:</span> 1234567890123456
                      </p>
                      <p>
                        <span className="font-semibold">IBAN:</span> PK12MEZN0000001234567890
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-ink mb-4">
                      Upload Payment Proof *
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-ink
                        file:mr-4 file:py-3 file:px-6
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-ink file:text-white
                        hover:file:bg-ink/90
                        file:cursor-pointer cursor-pointer"
                      required
                    />
                    {paymentProof && (
                      <p className="mt-2 text-sm text-green-600">
                        ✓ Selected: {paymentProof.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-ink mb-6">
                      Contact & Shipping Info
                    </h3>
                    {renderFormFields()}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={loader}
                  >
                    {loader ? "Placing Order..." : "Place Order"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="glass-card h-fit rounded-[2rem] p-8">
            <h2 className="text-xl font-semibold text-ink">Order Summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between text-ink">
                <span>Subtotal</span>
                <span>PKR {subtotal.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between text-ink">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `PKR ${shippingCost.toLocaleString('en-PK')}`}</span>
              </div>
              <div className="border-t border-surface-muted pt-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>PKR {(subtotal + shippingCost).toLocaleString('en-PK')}</span>
                </div>
                <p className="text-xs uppercase tracking-[0.3em] text-ink-muted mt-1">
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
