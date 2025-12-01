import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";

import { uploadSigned } from "../../utils/cloudinaryClient";

const uploadImage = async (file) => {
  const res = await uploadSigned(file);
  if (!res) return null;
  return res.secure_url; // or return entire res if you want public_id
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

  const imageFileInputRef = useRef(null);
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle checkbox inputs differently than text inputs
    const newValue = type === "checkbox" ? checked : value;

    setCategoryData((prevData) => ({
      ...prevData,
      [name]: newValue,
      // Only generate slug when name changes and it's not a checkbox
      slug: name === "name" ? generateSlug(value) : prevData.slug,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setCategoryData((prevData) => ({
      ...prevData,
      image: file,
    }));
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Upload image if it's a file
      const imageUrl =
        categoryData.image instanceof File
          ? await uploadImage(categoryData.image)
          : categoryData.image;

      // Determine if this is an update or create operation
      const isUpdateOperation = !!categoryID;
      const url = isUpdateOperation
        ? `${BACKEND_URL}/category/${categoryID}`
        : `${BACKEND_URL}/category/`;

      const method = isUpdateOperation ? "PUT" : "POST";

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
        method: method,
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isUpdateOperation ? "update" : "add"} category`
        );
      }

      const data = await response?.json();
      onAddCategory(data);
      alert(
        `Category ${isUpdateOperation ? "updated" : "added"} successfully!`
      );
    } catch (error) {
      console.error(
        `Error ${categoryID ? "updating" : "adding"} category:`,
        error
      );
      alert(
        `Failed to ${categoryID ? "update" : "add"} category. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  useEffect(() => {
    if (categoryID) {
      getCategoryById(categoryID);
    }
  }, [categoryID]);

  const getCategory = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/category`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if(response){
        const data = await response.json();
      const formattedCategory = data.category
        .filter((category) => category.parentCategory === null)
        .map((category) => ({
          id: category._id,
          name: category.name,
          slug: category.slug,
        }));
      setCategoryList(formattedCategory);
      }
    } catch (error) {
      console.warn(`Failed to fetch category: ${error.message}`);
    }
  };

  const getCategoryById = async (id) => {
    try {
      const response = await fetch(`${BACKEND_URL}/category/${id}`);
      if(response){
      if (!response.ok) throw new Error("Failed to fetch category data");

        const data = await response.json();

      setCategoryData({
        name: data.category.name || "",
        slug: data.category.slug || "",
        description: data.category.description || "",
        image: data.category.image || null,
        isActive:
          data.category.isActive !== undefined ? data.category.isActive : true,
        parentCategory: data.category.parentCategory || "",
        comingSoon: data.category.comingSoon || false,
        keywords: data.category.keywords || [],
      });

      setImagePreview(data.category.image || null);
      }
    } catch (error) {
      console.error("Error fetching category data:", error);
      alert("Failed to fetch category details. Please try again.");
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={categoryData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-md"
                  disabled
                />
              </div>
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

              {categoryData.parentCategory && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-sm text-gray-600">
                    This will be created as a subcategory under{" "}
                    <strong>
                      {categoryList.find(
                        (cat) => cat.id === categoryData.parentCategory
                      )?.name || ""}
                    </strong>
                  </p>
                </div>
              )}

              {categoryData.comingSoon && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <p className="text-sm text-yellow-700">
                    This category will be marked as &quot;Coming Soon&quot;.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={() => onAddCategory(false)}
              className="px-8 py-3 bg-gray-200 text-gray-800 font-medium rounded-full hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-black text-white font-medium rounded-full hover:bg-black transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              disabled={isSubmitting}
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
