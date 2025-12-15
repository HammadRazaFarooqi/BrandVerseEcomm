import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiXSquare } from "react-icons/fi";
import AddProductForm from "./AddProduct";
import { Plus } from "lucide-react";
import { toast } from "react-toastify";


function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductID, setSelectedProductId] = useState("");
  const [productToDelete, setProductToDelete] = useState(null);
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  /* =========================
     FUNCTIONAL FIX ONLY
     ========================= */
  const formatProduct = (product) => {
    const categoryParts = product.category?.name?.split("/") || [];
    const mainCategory = categoryParts.length
      ? categoryParts[0].trim()
      : "Uncategorized";

    return {
      id: product._id || product.id || crypto.randomUUID(),
      name: product.title || "",
      category: mainCategory,
      price: product.price || 0,
      discountRate: product.discountRate || 0,
      discountedPrice: product.discountedPrice || null,
      finalPrice: product.finalPrice || product.price || 0,
      stock: product.stock || 0,
      images: {
        primary:
          product.images?.primary ||
          `https://source.unsplash.com/random/100x100/?tuxedo&sig=${product._id}`,
        gallery: product.images?.gallery || [],
      },
      sizes: product.availableSizes || [],
      description: product.description || "",
    };
  };

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/products?limit=1000&sort=newest`
      );

      if (!response.ok)
        throw new Error(`API request failed: ${response.status}`);

      const data = await response.json();
      setProducts(data.products.map(formatProduct));
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const response = await fetch(
        `${BACKEND_URL}/products/${productToDelete}`,
        { method: "DELETE" }
      );

      if (!response.ok)
        throw new Error(`Delete failed: ${response.status}`);

      toast.success("Product deleted successfully!");
      setShowDeleteModal(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete the product. Please try again.");
    }
  };

  const openDeleteModal = (productId) => {
    setProductToDelete(productId);
    setShowDeleteModal(true);
  };

  // Add product (same UI, only logic fixed)
  const handleAddProduct = async (newProduct) => {
    setShowAddModal(false);
    setSelectedProductId("");
    await fetchProducts();
  };

  const handleEditProduct = (product) => {
    setSelectedProductId(product.id);
    setShowAddModal(true);
  };

  const filteredProducts = products.filter((product) =>
    (product.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif">Product Management</h1>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 bg-primary text-white font-medium rounded-full hover:bg-primary transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 whitespace-nowrap text-sm sm:text-base"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-5 h-5" /> Add New Product
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-md w-full md:w-1/3"
        />
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      )}
      {error && <div className="bg-red-100 p-4 rounded">{error}</div>}
      {success && <div className="bg-green-100 p-4 rounded">{success}</div>}

      {/* Products Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount %</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discounted Price</th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-4">
                        <img
                          src={product.images.primary}
                          alt={product.name}
                          className="h-10 w-10 rounded-full object-cover"
                          onError={(e) => (e.target.src = `https://source.unsplash.com/random/100x100/?tuxedo&sig=${product.id}`)}
                        />
                        <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category || "-"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">PKR {product.price.toLocaleString("en-PK")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.discountedPrice ? `${(((product.price - product.discountedPrice) / product.price) * 100).toFixed(0)}%` : "0%"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">PKR {product.finalPrice.toLocaleString("en-PK")}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                        <button onClick={() => handleEditProduct(product)} className="text-blue-600 hover:text-blue-800"><FiEdit2 /></button>
                        <button onClick={() => openDeleteModal(product.id)} className="text-red-600 hover:text-red-800"><FiTrash2 /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No products found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Are you sure?</h2>
            <p className="text-gray-600 mb-6">This action will permanently delete this product.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setProductToDelete(null); }}
                className="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showAddModal && <AddProductForm productID={selectedProductID} onAddProduct={handleAddProduct} />}
    </div>
  );
}

export default ProductManagement;
