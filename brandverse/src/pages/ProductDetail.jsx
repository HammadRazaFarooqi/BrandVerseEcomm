import { useEffect, useState, useRef } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const imageRef = useRef(null);
  const location = useLocation();


  const [selectedProduct, setSelectedProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [imgList, setImgList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);
  const categorySlug = location.state?.category || null;


  const BACKEND_URL = import.meta.env.VITE_API_URL;

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/products/${id}`);
        const data = await response.json();
        setSelectedProduct(data.product);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load product. Please try again later.");
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Set primary image
  useEffect(() => {
    if (selectedProduct?.images?.primary) {
      setSelectedImage(selectedProduct.images.primary);
    }
    const primary = selectedProduct?.images?.primary || null;
    const gallery = selectedProduct?.images?.gallery || [];
    const images = primary ? [primary, ...gallery] : gallery;
    setImgList(images);

  }, [selectedProduct]);



  const handleMouseMove = (e) => {
    if (imageRef.current) {
      const { left, top, width, height } = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setZoomPosition({ x, y });
    }
  };

  const handleImageClick = (img) => setSelectedImage(img);

  // Add to cart
  const handleAddToCart = () => {
    const isLogin = localStorage.getItem("isLogin"); // check if user is logged in

    if (!isLogin) {
      toast.info("Please login first!");
      navigate("/login");
      return; // stop execution
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingIndex = cart.findIndex((item) => item._id === selectedProduct._id);

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ ...selectedProduct, quantity });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Product added to cart!");
  };

  // Buy now
  const handleBuyNow = () => {
    const isLogin = localStorage.getItem("isLogin"); // check if user is logged in

    if (!isLogin) {
      toast.info("Please login first!");
      navigate("/login");
      return; // stop execution
    }

    localStorage.setItem(
      "cart",
      JSON.stringify([{ ...selectedProduct, quantity }])
    );
    toast.success("Product added to cart!");
    navigate("/cart");
  };


  return (
    <section className="bg-white py-12">
      <button
        onClick={() => {
          if (categorySlug) {
            navigate(`/category/${categorySlug}`);
          } else {
            navigate(-1);
          }
        }}
        className="p-2 mb-6 ml-10 rounded-md hover:bg-gray-100 inline-flex items-center"
      >
        <FiArrowLeft size={30} />
      </button>
      {loading ? (
        <div className="container-custom">Loading...</div>
      ) : !selectedProduct ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="container-custom">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Images */}
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
                      style={{ transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-4 gap-4">
                {imgList ? imgList.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Product view ${index}`}
                    className={`h-20 w-full cursor-pointer rounded-2xl object-cover transition ${selectedImage === img ? "ring-2 ring-ink" : "opacity-80 hover:opacity-100"
                      }`}
                    onClick={() => handleImageClick(img)}
                  />
                )) : ''}
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-8">
              <div>
                <h1 className="mb-10 text-4xl font-semibold text-ink">
                  {selectedProduct?.title}
                </h1>
                <p className="text-3xl font-semibold text-ink mt-2">
                  {selectedProduct?.discountedPrice && selectedProduct.discountedPrice < selectedProduct.price ? (
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-ink-muted line-through text-xl">
                          PKR {selectedProduct.price.toLocaleString('en-PK')}
                        </span>
                        <span className="text-2xl font-semibold text-ink">
                          PKR {selectedProduct.discountedPrice.toLocaleString('en-PK')}
                        </span>
                      </div>
                      <span className="inline-block rounded-lg bg-black px-3 py-1 ml-6 text-xs font-bold text-white uppercase tracking-wide">
                        Save {Math.round(((selectedProduct.price - selectedProduct.discountedPrice) / selectedProduct.price) * 100)}%
                      </span>
                    </div>
                  ) : (
                    <span className="mt-3 text-2xl font-semibold text-ink">
                      PKR {selectedProduct.price.toLocaleString('en-PK')}
                    </span>
                  )}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Description</h3>
                <p className="mt-3 text-ink-muted">{selectedProduct?.description}</p>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-sm uppercase tracking-[0.3em] text-ink-muted">Quantity</h3>
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
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <button className="btn btn-primary w-full" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <button className="btn btn-secondary w-full" onClick={handleBuyNow}>
                  Buy Now
                </button>
                <ToastContainer />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductDetail;
