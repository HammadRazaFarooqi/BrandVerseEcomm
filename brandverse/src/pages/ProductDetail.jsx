import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const imageRef = useRef(null);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  // const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSizeQuantity, setSelectedSizeQuantity] = useState(null);
  const [isNoVariantProduct, setIsNoVariantProduct] = useState(false);
  const [allColors, setAllColors] = useState([]);
  const [allSizes, setAllSizes] = useState([]);

  const handleAddToCart = () => {
    // Get the current cart from localStorage (or use an empty array)
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    // Check if the product is already in the cart
    const existingIndex = cart.findIndex(
      (item) => item._id === selectedProduct._id
    );
    if (
      existingIndex >= 0 &&
      cart[existingIndex]?.selectedSize === selectedSize
    ) {
      // Update the quantity if product exists
      cart[existingIndex].quantity += quantity;
    } else {
      // Add product with the current quantity
      cart.push({ ...selectedProduct, quantity, selectedSize });
    }
    // Save the updated cart back to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));
    // alert("Product added to cart!");
toast.success("Product added to cart!")
};

const handleBuyNow = () => {
  setTimeout(() => {
    localStorage.setItem(
      "cart",
      JSON.stringify([{ ...selectedProduct, quantity, selectedSize }])
    );
    toast.success("Product added to cart!")
    navigate("/cart");
  }, 1000);
  };

  useEffect(() => {
    // Find the product with the matching id
    getSelectedProducts();
  }, [id]);

  useEffect(() => {
    if (selectedProduct?.images?.primary) {
      setSelectedImage(selectedProduct.images.primary);
    }
  }, [selectedProduct]);

  const getSelectedProducts = async () => {
    try {
      const BACKEND_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${BACKEND_URL}/products/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      // data.product.availableSizes[0].quantity = 0;
      setSelectedProduct(data.product);
      setLoading(false);
    } catch (error) {
      console.warn(`Login failed: ${error.message}`);
      setError("Failed to load product. Please try again later.");
    }
  };

  const handleMouseMove = (e) => {
    if (imageRef.current) {
      const { left, top, width, height } =
        imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setZoomPosition({ x, y });
    }
  };

  const handleImageClick = (img) => {
    setSelectedImage(img);
  };

  // const onSizeSelect = (size) => {
  //   setSelectedSizeQuantity(size.quantity);
  //   setSelectedSize(size);
  // };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedSize(null);
    setSelectedSizeQuantity(null);
  };

  const handleSizeSelect = (sizeValue) => {
    const matchingVariants = selectedProduct.availableSizes.filter(
      (item) => item.size === sizeValue
    );

    let selectedVariant;

    if (selectedColor) {
      selectedVariant = matchingVariants.find(
        (item) => item.color === selectedColor
      );
    } else {
      selectedVariant = matchingVariants.find((item) => item.quantity > 0);
      if (selectedVariant?.color) setSelectedColor(selectedVariant.color);
    }

    setSelectedSize(selectedVariant);
    setSelectedSizeQuantity(selectedVariant?.quantity || 0);
  };

  useEffect(() => {
    const sizes = selectedProduct?.availableSizes || [];

    // 1. Check for no variant condition (only FREESIZE + NOCOLOR)
    const noVariant =
      sizes.length === 1 &&
      sizes[0].color === "NOCOLOR" &&
      sizes[0].size === "FREESIZE";

    if (noVariant) {
      setSelectedSizeQuantity(sizes[0].quantity);
      setSelectedSize(sizes[0]);
    }
    setIsNoVariantProduct(noVariant);

    // 2. Extract unique colors (excluding "NOCOLOR")
    const uniqueColors = [
      ...new Set(
        sizes.map((item) => item.color).filter((c) => c !== "NOCOLOR")
      ),
    ];
    console.log(uniqueColors);
    
    setAllColors(uniqueColors);

    // 3. Extract unique sizes (excluding "FREESIZE")
    const uniqueSizes = [
      ...new Set(
        sizes.map((item) => item.size).filter((s) => s !== "FREESIZE")
      ),
    ];
    setAllSizes(uniqueSizes);
  }, [selectedProduct]);

  return (
    <section className="bg-white py-12">
      {loading ? (
        <div className="container-custom">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="glass-card h-[520px] animate-pulse" />
            <div className="space-y-6">
              <div className="glass-card h-16 animate-pulse" />
              <div className="glass-card h-40 animate-pulse" />
            </div>
          </div>
        </div>
      ) : !selectedProduct ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-4">
              <div
                className="glass-card relative overflow-hidden rounded-[2.5rem]"
                onMouseEnter={() => setIsZooming(true)}
                onMouseLeave={() => setIsZooming(false)}
                onMouseMove={handleMouseMove}
                ref={imageRef}
              >
                <img
                  src={selectedImage || selectedProduct?.images?.primary}
                  alt="Product"
                  className="h-full w-full object-cover"
                />
                {isZooming && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <img
                      src={selectedImage || selectedProduct?.images?.primary}
                      alt="Product zoom"
                      className="absolute h-full w-full scale-150 object-cover transition-transform"
                      style={{
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-4">
                {selectedProduct?.images?.gallery.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Product view ${index}`}
                    className={`h-20 w-full cursor-pointer rounded-2xl object-cover transition ${
                      selectedImage === img
                        ? "ring-2 ring-ink"
                        : "opacity-80 hover:opacity-100"
                    }`}
                    onClick={() => handleImageClick(img)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <p className="eyebrow text-ink-muted">Signature piece</p>
                <h1 className="mt-2 text-4xl font-semibold text-ink">
                  {selectedProduct?.title}
                </h1>
                <div className="mt-4 space-y-1">
                  {selectedProduct?.discountedPrice && (
                    <p className="text-sm text-ink-muted line-through">
                      PKR {selectedProduct?.price}
                    </p>
                  )}
                  <p className="text-3xl font-semibold text-ink">
                    PKR 
                    {selectedProduct?.discountedPrice ||
                      selectedProduct?.price}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-ink">Description</h3>
                <p className="mt-3 text-ink-muted">
                  {selectedProduct?.description}
                </p>
              </div>

              <div className="space-y-4">
                {isNoVariantProduct ? (
                  selectedProduct.availableSizes[0].quantity < 20 && (
                    <p className="text-sm text-ink-muted">
                      Only {selectedProduct.availableSizes[0].quantity} left in
                      stock
                    </p>
                  )
                ) : (
                  <>
                    {allColors.length > 0 && (
                      <div>
                        <h3 className="text-sm uppercase tracking-[0.3em] text-ink-muted">
                          Color
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {allColors.map((color) => {
                            const isDisabled =
                              selectedSize &&
                              !selectedProduct.availableSizes.find(
                                (item) =>
                                  item.size === selectedSize.size &&
                                  item.color === color
                              );

                            return (
                              <button
                                key={color}
                                disabled={isDisabled}
                                className={`rounded-full px-4 py-2 text-sm uppercase tracking-[0.2em] ${
                                  isDisabled
                                    ? "bg-surface text-ink-muted/60"
                                    : selectedColor === color
                                    ? "bg-ink text-white"
                                    : "border border-surface-muted hover:border-ink"
                                }`}
                                onClick={() => handleColorSelect(color)}
                              >
                                {color}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {allSizes.length > 0 && (
                      <div>
                        <h3 className="text-sm uppercase tracking-[0.3em] text-ink-muted">
                          Size
                        </h3>
                        <div className="mt-3 flex flex-wrap gap-3">
                          {allSizes.map((sizeValue) => {
                            const matchingVariants =
                              selectedProduct.availableSizes.filter(
                                (item) => item.size === sizeValue
                              );

                            const isDisabled =
                              selectedColor &&
                              !matchingVariants.find(
                                (item) =>
                                  item.color === selectedColor &&
                                  item.quantity > 0
                              );

                            const hasStock = matchingVariants.some(
                              (item) => item.quantity > 0
                            );
                            const fullyDisabled = !hasStock || isDisabled;

                            return (
                              <button
                                key={sizeValue}
                                disabled={fullyDisabled}
                                className={`rounded-full px-4 py-2 text-sm uppercase tracking-[0.2em] ${
                                  fullyDisabled
                                    ? "bg-surface text-ink-muted/60"
                                    : selectedSize?.size === sizeValue
                                    ? "bg-ink text-white"
                                    : "border border-surface-muted hover:border-ink"
                                }`}
                                onClick={() => handleSizeSelect(sizeValue)}
                              >
                                {sizeValue}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {selectedSizeQuantity > 0 && (
                      <span className="block text-sm text-ink-muted">
                        Only {selectedSizeQuantity} pieces remaining
                      </span>
                    )}
                  </>
                )}
              </div>

              <div>
                <h3 className="text-sm uppercase tracking-[0.3em] text-ink-muted">
                  Quantity
                </h3>
                <div className="mt-3 inline-flex items-center rounded-full border border-surface-muted">
                  <button
                    className="px-4 py-2 text-xl"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <span className="px-6 text-xl font-semibold">{quantity}</span>
                  <button
                    className="px-4 py-2 text-xl"
                    onClick={() => {
                      if (quantity < selectedSizeQuantity) {
                        setQuantity(quantity + 1);
                      }
                    }}
                    disabled={quantity >= selectedSizeQuantity}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <button className="btn btn-primary w-full" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <ToastContainer />
                <button
                  className="btn btn-secondary w-full"
                  onClick={handleBuyNow}
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductDetail;
