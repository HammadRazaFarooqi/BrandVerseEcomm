import { useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2, FiXSquare } from "react-icons/fi";
import AddCategoryForm from "./AddCategory";
import { Plus } from "lucide-react";
// import AddCategoryForm from "./AddCategory";

function CategoryManagement() {
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // const [statusFilter, setStatusFilter] = useState("");

  const BACKEND_URL = import.meta.env.VITE_API_URL;

  // Fetch category from API
  useEffect(() => {
    fetchCategory();
  }, []);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/category/`);

      if (response) {
        if (!response.ok) {
          throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
          const formattedCategory = data.category.map((category) => ({
            id: category._id,  // _id is already a string in actual API response
            name: category.name,
            status: category.isActive ? "Active" : "In-active",
            image: category.image || `https://source.unsplash.com/random/100x100/?tuxedo&sig=${category._id}`,
            description: category.description,
          }));

          setCategory(formattedCategory);
        }
      } else {
        throw new Error("Failed to fetch categories from API.");
      }
    } catch (err) {
      console.error("Error fetching category:", err);
      setError("Failed to load categories. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await fetch(
          `${BACKEND_URL}/category/${categoryId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to delete category. Status: ${response.status}`
          );
        }

        fetchCategory();
        setSuccess("Category deleted successfully!");
      } catch (error) {
        console.error("Error deleting category:", error);
        setError("Failed to delete the category. Please try again.");
      }
    }
  };

  const handleEditCategory = (e) => {
    console.log(e);
    setSelectedCategoryId(e.id)
    setShowAddModal(true);
  };

  const handleAddCategory = (e) => {
    console.log(e);
    setShowAddModal(false);
    setSelectedCategoryId('');
    // After successful addition, fetch category again
    fetchCategory();
  };

  const filteredCategory = category.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    // const matchesStatus =
    //   !statusFilter ||
    //   category.status.toLowerCase().includes(statusFilter.toLowerCase());
    return matchesSearch;
    // return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif">
          Category Management
        </h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-3 bg-black text-white font-medium rounded-full hover:bg-gray-900 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 whitespace-nowrap text-sm sm:text-base">
            <Plus className="w-5 h-5" />
            Add New Category
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-md"
          />
          {/* <select
            className="px-4 py-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="in-active">In Active</option>
          </select> */}
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading category...</p>
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

      {/* category Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
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
                {filteredCategory.length > 0 ? (
                  filteredCategory.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={category.image}
                              alt={category.name}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://source.unsplash.com/random/100x100/?tuxedo&sig=${category.id}`;
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-96 overflow-hidden truncate`}
                        >
                          {category.description}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${category.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          {category.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleEditCategory(category)}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDeleteCategory(category.id)}
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
                      No category found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddModal && (
        <AddCategoryForm categoryID={selectedCategoryId} onAddCategory={() => handleAddCategory(event)} />
      )}
    </div>
  );
}

export default CategoryManagement;
