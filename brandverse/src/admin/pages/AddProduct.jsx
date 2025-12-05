import { Edit2 } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import {
  FiArrowLeft,
  FiArrowRight,
  FiPlus,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { uploadSigned } from "../../utils/cloudinaryClient.js";


const uploadImage = async (file) => {
  const res = await uploadSigned(file);
  if (!res) return null;
  return res.secure_url; // or return entire res if you want public_id
};

const AddProductForm = ({ onAddProduct, productID }) => {
  const [productData, setProductData] = useState({
    title: "",
    price: "",
    discountRate: "",
    discountedPrice: "",
    description: "",
    category: "",
    images: {
      primary: null,
      gallery: [],
    },
    availableSizes: [],
    defaultQuantity: 0,
    isFeatured: false,
    colorVariants: [], // Array to store color variants
  });

  const [sizeInput, setSizeInput] = useState("");
  const [sizeId, setSizeId] = useState("");
  const [sizeQuantityInput, setSizeQuantityInput] = useState(1);
  const [primaryImagePreview, setPrimaryImagePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Color variant form state
  const [colorInput, setColorInput] = useState("");

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const primaryFileInputRef = useRef(null);
  const galleryFileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProductData((prevData) => {
      const updatedData = {
        ...prevData,
        [name]: type === "checkbox" ? checked : value,
      };

      // Calculate discounted price when price or discount rate changes
      if (name === "price" || name === "discountRate") {
        const price =
          name === "price" ? parseFloat(value) : parseFloat(prevData.price);
        const discountRate =
          name === "discountRate"
            ? parseFloat(value)
            : parseFloat(prevData.discountRate);

        if (!isNaN(price) && !isNaN(discountRate) && discountRate > 0) {
          const discount = price * (discountRate / 100);
          updatedData.discountedPrice = (price - discount).toFixed(0);
        } else {
          updatedData.discountedPrice = "";
        }
      }

      return updatedData;
    });
  };

  const handleSetQuantity = () => {
    const quantity = parseInt(sizeQuantityInput, 10);
    if (isNaN(quantity) || quantity <= 0) return;

    setProductData((prevData) => ({
      ...prevData,
      defaultQuantity: quantity,
    }));

    // Reset input
    setSizeQuantityInput(1);
  };


  const handleRemoveSize = (index) => {
    const selectedSize = productData.availableSizes[index];

    setProductData((prevData) => {
      const updatedSizes = [...prevData.availableSizes];
      updatedSizes.splice(index, 1);
      return {
        ...prevData,
        availableSizes: updatedSizes,
        defaultQuantity:
          prevData.defaultQuantity - Number(selectedSize.quantity),
      };
    });
  };

  const handleUpdateSize = (index) => {
    const selectedSize = productData.availableSizes[index];

    const size = selectedSize.size === "FREESIZE" ? '' : selectedSize.size;
    const color = selectedSize.color === "NOCOLOR" ? '' : selectedSize.color;
    setSizeInput(size);
    setSizeQuantityInput(selectedSize.quantity);
    setColorInput(color);
    setSizeId(selectedSize._id);
  };

  const handlePrimaryImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create a preview
    const reader = new FileReader();
    reader.onload = () => {
      setPrimaryImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Store the file in state
    setProductData((prevData) => ({
      ...prevData,
      images: {
        ...prevData.images,
        primary: file,
      },
    }));
  };

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Create previews
    const newPreviews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setGalleryPreviews((prevPreviews) => [
            ...prevPreviews,
            ...newPreviews,
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Store the files in state
    setProductData((prevData) => ({
      ...prevData,
      images: {
        ...prevData.images,
        gallery: [...prevData.images.gallery, ...files],
      },
    }));
  };

  const removeGalleryImage = (index) => {
    setProductData((prevData) => {
      const updatedGallery = [...prevData.images.gallery];
      updatedGallery.splice(index, 1);

      return {
        ...prevData,
        images: {
          ...prevData.images,
          gallery: updatedGallery,
        },
      };
    });

    const updatedPreviews = [...galleryPreviews];
    updatedPreviews.splice(index, 1);
    setGalleryPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // VALIDATION: Primary image is required only when adding a NEW product
      if (!productID && !productData.images.primary) {
        setErrorMessage("Primary image is required for new products.");
        setIsSubmitting(false);
        return;
      }

      // Upload primary image if it's a file
      const primaryImageUrl =
        productData.images.primary instanceof File
          ? await uploadImage(productData.images.primary)
          : productData.images.primary;

      // Upload gallery images that are files
      const galleryImageUrls = await Promise.all(
        productData.images.gallery.map((file) =>
          file instanceof File ? uploadImage(file) : file
        )
      );

      // Upload color variant images
      const processedColorVariants = await Promise.all(
        productData.colorVariants.map(async (variant) => {
          const imageUrl =
            variant.image instanceof File
              ? await uploadImage(variant.image)
              : variant.image;

          return {
            color: variant.color,
            image: imageUrl,
          };
        })
      );

      const formattedData = {
        ...productData,
        price: parseFloat(productData.price),
        discountRate: productData.discountRate
          ? parseFloat(productData.discountRate)
          : 0,
        discountedPrice: productData.discountedPrice
          ? parseFloat(productData.discountedPrice)
          : null,
        defaultQuantity: parseInt(productData.defaultQuantity) || 1,
        images: {
          primary: primaryImageUrl,
          gallery: galleryImageUrls.filter((url) => url !== null),
        },
        colorVariants: processedColorVariants.filter((v) => v.image !== null),
      };

      const isUpdateOperation = !!productID;
      const url = isUpdateOperation
        ? `${BACKEND_URL}/products/${productID}`
        : `${BACKEND_URL}/products/`;

      const method = isUpdateOperation ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (response) {
        if (!response.ok) {
          throw new Error(
            `Failed to ${isUpdateOperation ? "update" : "add"} product`
          );
        }

        const data = await response.json();
        onAddProduct(data);
        alert(
          `Product ${isUpdateOperation ? "updated" : "added"} successfully!`
        );
      }
    } catch (error) {
      console.error(
        `Error ${productID ? "updating" : "adding"} product:`,
        error
      );
      setErrorMessage(
        `Failed to ${productID ? "update" : "add"} product. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    getCategory();
  }, []);

  useEffect(() => {
    if (productID) {
      getProductById(productID);
    }
  }, [productID]);

  const getCategory = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/category`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response) {
        const data = await response.json();
        const formattedCategory = data.category.map((category) => ({
          id: category._id, // this is what we send
          name: category.name,
          slug: category.slug,
        }));

        setCategoryList(formattedCategory);
        if (!productID) {
          setProductData((prevData) => ({
            ...prevData,
            category: formattedCategory[0]?._id || "", // default to first category ID
          }));
        }

        if (!productID) {
          setProductData((prevData) => ({
            ...prevData,
            category:
              formattedCategory && formattedCategory[0]
                ? formattedCategory[0].slug
                : "",
          }));
        }
        setCategoryList(formattedCategory);
      }
    } catch (error) {
      console.warn(`Failed to fetch category: ${error.message}`);
    }
  };

  const getProductById = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/products/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product data");

      const data = await response.json();
      setProductData((prevData) => ({
        ...prevData,
        title: data.product.title || "",
        price: data.product.price ? data.product.price.toString() : "",
        discountRate: data.product.discountRate
          ? data.product.discountRate.toString()
          : "",
        discountedPrice: data.product.discountedPrice
          ? data.product.discountedPrice.toString()
          : "",
        description: data.product.description || "",
        category: data.product.category || "",
        images: {
          primary: data.product.images?.primary || null,
          gallery: data.product.images?.gallery || [],
        },
        availableSizes: data.product.availableSizes || [],
        defaultQuantity: data.product.defaultQuantity || 1,
        isFeatured: data.product.isFeatured || false,
        colorVariants: data.product.colorVariants || [],
      }));

      setPrimaryImagePreview(data.product.images?.primary || null);
      setGalleryPreviews(data.product.images?.gallery || []);

      // If color variants exist, set their previews
      if (data.product.colorVariants && data.product.colorVariants.length > 0) {
        const variantsWithPreviews = data.product.colorVariants.map(
          (variant) => ({
            ...variant,
            imagePreview: variant.image,
          })
        );
        setProductData((prev) => ({
          ...prev,
          colorVariants: variantsWithPreviews,
        }));
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {productID ? "Edit Product" : "Add New Product"}
          </h2>
          <button
            onClick={() => onAddProduct(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Wizard Tabs */}
        <div className="mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab(0)}
              className={`px-6 py-3 font-medium text-sm ${activeTab === 0
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab(1)}
              className={`px-6 py-3 font-medium text-sm ${activeTab === 1
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Price & Inventory
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={`px-6 py-3 font-medium text-sm ${activeTab === 2
                ? "border-b-2 border-black text-black"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              Images
            </button>
          </div>
        </div>
        {errorMessage && (
          <div className="bg-red-100 text-red-700 border border-red-300 rounded-md p-3 mb-4 text-center">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          {/* Tab 1: Basic Info */}
          {activeTab === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={productData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category*
                  </label>
                  <select
                    name="category"
                    value={productData.category}
                    onChange={handleChange}
                    required
                  >
                    {categoryList.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={productData.description}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500"
                  required
                ></textarea>
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setActiveTab(1)}
                  className="px-6 py-2 bg-black text-white font-medium rounded-lg flex items-center gap-2"
                >
                  Next: Price & Inventory <FiArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Price & Inventory */}
          {activeTab === 1 && (
            <div className="space-y-6">
              {/* Price Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price*
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={productData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Rate (%)
                  </label>
                  <input
                    type="number"
                    name="discountRate"
                    value={productData.discountRate}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discounted Price
                  </label>
                  <input
                    type="number"
                    name="discountedPrice"
                    value={productData.discountedPrice}
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                  />
                </div>
              </div>

              {/* Quantity Section */}
              <div className="p-4 bg-gray-50 rounded-lg mt-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={sizeQuantityInput}
                      onChange={(e) => setSizeQuantityInput(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500"
                      min="1"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSetQuantity}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FiPlus size={16} /> Set
                  </button>
                </div>

                {productData.defaultQuantity > 0 && (
                  <div className="mt-4">
                    <span className="text-gray-900 font-medium">
                      {productData.title} - ({productData.defaultQuantity})
                    </span>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setActiveTab(0)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <FiArrowLeft /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab(2)}
                  className="px-6 py-2 bg-black text-white font-medium rounded-lg hover:bg-black flex items-center gap-2"
                >
                  Next: Images <FiArrowRight />
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Images */}
          {activeTab === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Primary Image */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Primary Image
                  </h3>
                  <div className="mt-1">
                    <input
                      type="file"
                      ref={primaryFileInputRef}
                      onChange={handlePrimaryImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => primaryFileInputRef.current.click()}
                      className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 px-6 py-8 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
                    >
                      {primaryImagePreview ? (
                        <div className="w-full">
                          <img
                            src={primaryImagePreview}
                            alt="Primary preview"
                            className="h-48 mx-auto object-contain rounded-lg"
                          />
                          <p className="mt-2 text-center text-sm">
                            Click to change image
                          </p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 font-medium">
                            Upload primary product image
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Recommended size: 800x800px
                          </p>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Gallery Images */}
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">
                    Gallery Images
                  </h3>
                  <div className="mt-1">
                    <input
                      type="file"
                      ref={galleryFileInputRef}
                      onChange={handleGalleryImagesChange}
                      accept="image/*"
                      multiple
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => galleryFileInputRef.current.click()}
                      className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 px-6 py-8 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
                    >
                      <div className="text-center">
                        <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 font-medium">
                          Upload gallery images
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          You can select multiple images
                        </p>
                      </div>
                    </button>

                    {/* Gallery previews */}
                    {galleryPreviews.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Uploaded Gallery Images:
                        </h4>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {galleryPreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Gallery ${index}`}
                                className="h-24 w-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(index)}
                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition"
                              >
                                <FiX size={16} className="text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => setActiveTab(1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <FiArrowLeft /> Back
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-black text-white font-medium rounded-lg hover:bg-black shadow-md hover:shadow-lg flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : productID
                      ? "Update Product"
                      : "Add Product"}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

AddProductForm.propTypes = {
  onAddProduct: PropTypes.func.isRequired,
  productID: PropTypes.string,
};

export default AddProductForm;
