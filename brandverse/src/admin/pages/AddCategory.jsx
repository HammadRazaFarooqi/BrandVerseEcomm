import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { uploadSigned } from "../../utils/cloudinaryClient";

const uploadImage = async (file) => {
  const res = await uploadSigned(file);
  if (!res) return null;
  return res.secure_url;
};

const AddCategoryForm = ({ onAddCategory, categoryID }) => {
  const [categoryData, setCategoryData] = useState({
    name: "",
    slug: "",
    description: "",
    image: null,
    isActive: true,
    parentCategory: "",
    comingSoon: false,
    keywords: [],
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [formError, setFormError] = useState("");

  const imageFileInputRef = useRef(null);
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setCategoryData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      slug: name === "name" ? value : prev.slug,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    setCategoryData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  const generateSlug = (name) =>
    name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      // IMAGE REQUIRED VALIDATION
      if (!categoryID && !categoryData.image) {
        setFormError("Category image is required.");
        setIsSubmitting(false);
        return;
      }

      const imageUrl =
        categoryData.image instanceof File
          ? await uploadImage(categoryData.image)
          : categoryData.image;

      if (!imageUrl) {
        setFormError("Failed to upload image. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const isUpdate = Boolean(categoryID);
      const url = isUpdate
        ? `${BACKEND_URL}/category/${categoryID}`
        : `${BACKEND_URL}/category/`;

      const method = isUpdate ? "PUT" : "POST";

      const formattedData = {
        name: categoryData.name,
        slug: categoryData.slug,
        description: categoryData.description,
        image: imageUrl,
        isActive: categoryData.isActive,
        parentCategory: categoryData.parentCategory || null,
        comingSoon: categoryData.comingSoon,
        keywords: categoryData.keywords,
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error("Failed to save category");
      }

      const data = await response.json();
      onAddCategory(data);
      toast.success(`Category ${isUpdate ? "updated" : "added"} successfully!`);
    } catch (error) {
      console.error("Error saving category:", error);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  useEffect(() => {
    if (categoryID) getCategoryById(categoryID);
  }, [categoryID]);

  const getCategory = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/category`);
      const data = await response.json();

      const formatted = data.category
        .filter((cat) => cat.parentCategory === null)
        .map((cat) => ({
          id: cat._id,
          name: cat.name,
          slug: cat.slug,
        }));

      setCategoryList(formatted);
    } catch (error) {
      console.warn("Failed to fetch categories:", error);
    }
  };

  const getCategoryById = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/category/${id}`);

      if (!response.ok) throw new Error("Failed to fetch category");

      const data = await response.json();

      setCategoryData({
        name: data.category.name || "",
        slug: data.category.slug || "",
        description: data.category.description || "",
        image: data.category.image || null,
        isActive: data.category.isActive ?? true,
        parentCategory: data.category.parentCategory || "",
        comingSoon: data.category.comingSoon || false,
        keywords: data.category.keywords || [],
      });

      setImagePreview(data.category.image || null);
    } catch (error) {
      toast.error("Failed to fetch category details.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-serif">
            {categoryID ? "Edit Category" : "Add New Category"}
          </h2>
          <button
            onClick={() => onAddCategory(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX size={24} />
          </button>
        </div>

        {formError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Title*
                </label>
                <input
                  type="text"
                  name="name"
                  value={categoryData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={categoryData.slug}
                  disabled
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={categoryData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border rounded-md"
                  required
                ></textarea>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category Image
              </label>

              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  ref={imageFileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => imageFileInputRef.current.click()}
                  className="flex items-center justify-center w-full border-2 border-dashed border-gray-300 px-6 py-4 rounded-md text-sm text-gray-500 hover:bg-gray-50"
                >
                  {imagePreview ? (
                    <div className="w-full">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-40 mx-auto object-contain rounded-md"
                      />
                      <p className="mt-2 text-center text-xs">
                        Click to change image
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FiUpload className="mx-auto h-8 w-8" />
                      <p className="mt-1">Upload category image</p>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => onAddCategory(false)}
              className="px-8 py-3 bg-gray-200 text-gray-800 font-medium rounded-full"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-black text-white font-medium rounded-full shadow-lg"
            >
              {isSubmitting
                ? categoryID
                  ? "Updating..."
                  : "Adding..."
                : categoryID
                  ? "Update Category"
                  : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddCategoryForm.propTypes = {
  onAddCategory: PropTypes.func.isRequired,
  categoryID: PropTypes.string,
};

export default AddCategoryForm;
