import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { FiTrash2, FiUpload } from "react-icons/fi";

import { uploadSigned } from "../../utils/cloudinaryClient";

const uploadImage = async (file) => {
  const res = await uploadSigned(file);
  if (!res) return null;
  return res.secure_url; // or return entire res if you want public_id
};

const PromotionsManager = ({ onClose }) => {
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const imageFileInputRef = useRef(null);
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/promotions`);
      if (!response.ok) throw new Error("Failed to fetch promotions");

      const data = await response.json();
      const normalizedPromotions = (data.promotion || []).map((promo) => ({
        id: promo._id, // Assign _id to frontend-friendly id field
        image: promo.image,
        title: promo.title,
        link: promo.link,
        order: promo.order,
      }));

      // Sort by order before setting
      normalizedPromotions.sort((a, b) => a.order - b.order);
  
      setPromotions(normalizedPromotions);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      alert("Failed to load promotions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddImageClick = () => {
    imageFileInputRef.current.click();
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Display previews immediately
    const newPromotions = [...promotions];

    for (const file of files) {
      newPromotions.push({
        id: `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        image: URL.createObjectURL(file),
        file: file, // Store file object for later upload
        title: "",
        link: "",
        order: newPromotions.length,
        isNew: true,
      });
    }

    setPromotions(newPromotions);
    // Reset file input
    e.target.value = null;
  };

  const handleRemovePromotion = (id) => {
    setPromotions(promotions.filter((promo) => promo.id !== id));
  };

  const handlePromotionChange = (id, field, value) => {
    setPromotions(
      promotions.map((promo) =>
        promo.id === id ? { ...promo, [field]: value } : promo
      )
    );
  };

  const handleReorder = (id, direction) => {
    const currentIndex = promotions.findIndex((promo) => promo.id === id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === promotions.length - 1)
    )
      return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const newPromotions = [...promotions];

    // Swap items
    [newPromotions[currentIndex], newPromotions[newIndex]] = [
      newPromotions[newIndex],
      newPromotions[currentIndex],
    ];

    // Update order numbers
    newPromotions.forEach((promo, index) => {
      promo.order = index;
    });

    setPromotions(newPromotions);
  };

  const savePromotions = async () => {
    setIsSaving(true);

    try {
      // First upload any new images
      const updatedPromotions = [...promotions];
      for (let i = 0; i < updatedPromotions.length; i++) {
        if (updatedPromotions[i].file) {
          const imageUrl = await uploadImage(updatedPromotions[i].file);
          if (imageUrl) {
            updatedPromotions[i].image = imageUrl;
            delete updatedPromotions[i].file;
          } else {
            throw new Error(`Failed to upload image ${i + 1}`);
          }
        }

        // Clean up temporary fields
        if (updatedPromotions[i].isNew) {
          delete updatedPromotions[i].isNew;
        }
      }

      // Now save all promotions to backend
      const response = await fetch(`${BACKEND_URL}/promotions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ promotions: updatedPromotions }),
      });

      if (!response.ok) throw new Error("Failed to save promotions");

      alert("Promotions saved successfully!");

      // Refresh the list from server
      await fetchPromotions();
    } catch (error) {
      console.error("Error saving promotions:", error);
      alert("Failed to save promotions. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  

  return (
    <div>
      {isLoading ? (
        <div className="text-center py-10">
          <p>Loading promotions...</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              Upload promotional images that will appear in the homepage
              carousel. You can add as many as you want and arrange their order.
            </p>

            <input
              type="file"
              ref={imageFileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              multiple
              className="hidden"
            />

            <button
              type="button"
              onClick={handleAddImageClick}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FiUpload className="mr-2" />
              Add Images
            </button>
          </div>

          {promotions.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">
                No promotional images yet. Click &quot;Add Images&quot; to
                upload.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {promotions.map((promo, index) => (
                <div
                  key={promo.id}
                  className="border rounded-lg p-4 bg-gray-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                      <img
                        src={promo.image}
                        alt={`Promotion ${index + 1}`}
                        className="h-40 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePromotion(promo.id)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                    <div className="space-y-3 md:col-span-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Banner Title (Optional)
                        </label>
                        <input
                          type="text"
                          value={promo.title || ""}
                          onChange={(e) =>
                            handlePromotionChange(
                              promo.id,
                              "title",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="Banner title or promotion name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Link URL (Optional)
                        </label>
                        <input
                          type="text"
                          value={promo.link || ""}
                          onChange={(e) =>
                            handlePromotionChange(
                              promo.id,
                              "link",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border rounded-md"
                          placeholder="https://example.com/page"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          Position: {index + 1}
                        </span>
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => handleReorder(promo.id, "up")}
                            disabled={index === 0}
                            className={`p-1 rounded ${
                              index === 0
                                ? "text-gray-300"
                                : "text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReorder(promo.id, "down")}
                            disabled={index === promotions.length - 1}
                            className={`p-1 rounded ${
                              index === promotions.length - 1
                                ? "text-gray-300"
                                : "text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            ↓
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-gray-200 text-gray-800 font-medium rounded-full hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={savePromotions}
              disabled={isSaving}
              className="px-8 py-3 bg-red-500 text-white font-medium rounded-full hover:bg-red-600 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {isSaving ? "Saving..." : "Save Promotions"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

PromotionsManager.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default PromotionsManager;
