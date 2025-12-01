import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2, FiXSquare } from "react-icons/fi";
import AddProductForm from "./AddProduct";
import { Plus } from "lucide-react";

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // const [categoryFilter, setCategoryFilter] = useState("");
  // const [statusFilter, setStatusFilter] = useState("");
  const [selectedProductID, setSelectedProductId] = useState("");
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/products/`);
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();

      const formattedProducts = data.products.map((product) => {
        const categoryParts = product.category
          ? product?.category?.name?.split("/")
          : [];
        const mainCategory =
          categoryParts.length > 0 ? categoryParts[0].trim() : "Uncategorized";

        return {
          id: product._id, // Corrected from __id
          name: product.title,
          category: mainCategory,
          price: product.price,
          stock: product.stock || 0,
          images: {
            primary:
              product.images?.primary ||
              `https://source.unsplash.com/random/100x100/?tuxedo&sig=${product._id}`,
            gallery: product.images?.gallery || [],
          },
          sizes: product.availableSizes || [],
          description: product.description,
        };
      });

      setProducts(formattedProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(
          `${BACKEND_URL}/products/${productId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to delete product. Status: ${response.status}`
          );
        }

        fetchProducts();
        setSuccess("Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting product:", error);
        setError("Failed to delete the product. Please try again.");
      }
    }
  };

  const handleAddProduct = () => {
    setShowAddModal(false);
    setSelectedProductId("");
    // After successful addition, fetch products again
    fetchProducts();
  };

  const handleEditProduct = (e) => {
    console.log(e);
    setSelectedProductId(e.id);
    setShowAddModal(true);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    // const matchesCategory =
    //   !categoryFilter || product.category === categoryFilter;
    // const matchesStatus =
    //   !statusFilter ||
    //   product.status.toLowerCase().includes(statusFilter.toLowerCase());
    return matchesSearch;
    // return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif">
          Product Management
        </h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 bg-black text-white font-medium rounded-full hover:bg-gray-900 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 whitespace-nowrap text-sm sm:text-base">
            <Plus className="w-5 h-5" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md"
          />
          {/* <select
            className="px-4 py-2 border rounded-md"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
          </select>
          <select
            className="px-4 py-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select> */}
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <span className="flex justify-between">
            <span className="block sm:inline">
              <strong className="font-bold">Error! </strong> {error}
            </span>
            <button
              className="text-red-900 hover:text-red-700"
              onClick={() => setError(null)}
            >
              <FiXSquare />
            </button>
          </span>
        </div>
      )}
      {success && (
        <div className="bg-success-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <span className="flex justify-between">
            <span className="block sm:inline">
              <strong className="font-bold">Ok! </strong> {success}
            </span>
            <button
              className="text-green-900 hover:text-green-700"
              onClick={() => setSuccess(null)}
            >
              <FiXSquare />
            </button>
          </span>
        </div>
      )}

      {/* Products Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={product.images.primary}
                              alt={product.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://source.unsplash.com/random/100x100/?tuxedo&sig=${product.id}`;
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            {/* {Array.isArray(product.sizes) && product.sizes.length > 0 && (
                              <div className="text-xs text-gray-500">
                                Sizes: {product.sizes.length}
                                {product.sizes.map(size => (
                                  <span
                                    key={size}
                                    className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full mx-1"
                                  >
                                    {size}
                                  </span>
                                ))}
                              </div>
                            )} */}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product.category || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          PKR {product.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {product?.stock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-black text-white"
                            }`}
                        >
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleEditProduct(product)}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductForm
          productID={selectedProductID}
          onAddProduct={() => handleAddProduct(event)}
        />
      )}
    </div>
  );
}

export default ProductManagement;
