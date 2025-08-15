'use client';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FiSearch, 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiEye, 
  FiX,
  FiRefreshCw,
  FiFilter,
  FiFolder,
  FiImage,
  FiHome
} from "react-icons/fi";

export default function CategoryAdminPage() {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [showAsHome, setShowAsHome] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterHome, setFilterHome] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    // Fetch initial categories
    async function fetchCategories() {
      try {
        const token = localStorage.getItem('adminToken');
        const config = token ? {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        } : {};
        
        const response = await axios.get("/api/admin/categories", config);
        console.log('Fetched categories:', response.data);
        response.data.forEach(cat => {
          if (cat.image) {
            console.log(`Category ${cat.name} image path:`, cat.image);
          }
        });
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        if (error.response?.status === 401) {
          alert('Authentication failed. Please login again.');
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        } else {
          alert('Error loading categories. Please check your database connection.');
        }
      }
    }
    fetchCategories();
  }, []);

  // Filter and sort categories
  useEffect(() => {
    let filtered = categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesHome = filterHome === 'all' || 
                         (filterHome === 'home' && category.showAsHome);
      
      return matchesSearch && matchesHome;
    });

    // Sort categories
    filtered.sort((a, b) => {
      let aValue = a[sortBy] || '';
      let bValue = b[sortBy] || '';
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredCategories(filtered);
  }, [categories, searchTerm, filterHome, sortBy, sortOrder]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      } : {};
      
      const response = await axios.get("/api/admin/categories", config);
      setCategories(response.data);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
    }
  };

  const saveCategory = async (fromModal = false) => {
    try {
      setLoading(true);
      if (fromModal) setModalLoading(true);
      console.log('Frontend - Current showAsHome state:', showAsHome);
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);

      formData.append('showAsHome', showAsHome.toString());
      console.log('Frontend - FormData showAsHome value:', showAsHome.toString());
      
      if (image && typeof image === 'object') {
        formData.append('image', image);
      }

      const token = localStorage.getItem('adminToken');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      };

      let response;
      if (isEditing) {
        response = await axios.put(`/api/admin/categories/${editId}`, formData, config);
        console.log('Frontend - Edit response:', response.data);
        console.log('Frontend - showAsHome in response:', response.data.showAsHome);
      } else {
        response = await axios.post("/api/admin/categories", formData, config);
        console.log('Frontend - Create response:', response.data);
        console.log('Frontend - showAsHome in response:', response.data.showAsHome);
      }
      
      resetForm();
      if (fromModal) {
        setShowEditModal(false);
        setShowAddModal(false);
      }
      
      // Wait a bit and then refresh
      setTimeout(async () => {
        await fetchCategories();
      }, 500);
    } catch (error) {
      console.error(error);
      if (error.response) {
        // Server responded with a status other than 2xx
        console.error('Error response:', error.response.data);
        alert(`Error: ${error.response.data.error || 'Failed to save category'}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('Error request:', error.request);
        alert('Error: No response from server');
      } else {
        // Something else caused an error
        console.error('Error:', error.message);
        alert('Error: Failed to save category');
      }
    } finally {
      setLoading(false);
      if (fromModal) setModalLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setImage(null);
    setShowAsHome(false);
    setIsEditing(false);
    setEditId(null);
  };

const editCategory = (category) => {
    setName(category.name);
    setDescription(category.description);
    setImage(category.image);
    setShowAsHome(category.showAsHome || false);
    setIsEditing(true);
    setEditId(category._id);
    setShowEditModal(true);  // Show edit modal
  };

const confirmDeleteCategory = (id) => {
    setSelectedCategory(id);
    setShowDeleteModal(true);  // Show delete modal
  };

  const deleteCategory = async (id) => {
    setModalLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const config = token ? {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      } : {};
      
      await axios.delete(`/api/admin/categories/${id}`, config);
      setShowDeleteModal(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        localStorage.removeItem('adminToken');
        window.location.href = '/admin/login';
      }
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Category Management</h1>
      
{/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Filter Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select 
            value={filterHome} 
            onChange={(e) => setFilterHome(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All</option>
            <option value="home">Home</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Name</option>
            <option value="description">Description</option>
          </select>
        </div>
        <button 
          onClick={() => setShowAddModal(true)} 
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Add New Category
        </button>
      </div>


{/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Add New Category</h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="Category Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea 
                    placeholder="Description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Image
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <input 
                      type="checkbox" 
                      checked={showAsHome}
                      onChange={(e) => setShowAsHome(e.target.checked)}
                      className="rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <span>Show as Home Category</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2 p-6 border-t bg-gray-50">
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button 
                onClick={() => saveCategory(true)}
                disabled={modalLoading || !name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {modalLoading ? (
                  <div className="flex items-center space-x-2">
                    <FiRefreshCw className="animate-spin" size={16} />
                    <span>Adding...</span>
                  </div>
                ) : (
                  'Add Category'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Category</h3>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input 
                    type="text" 
                    placeholder="Category Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea 
                    placeholder="Description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Image
                  </label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {image && typeof image === 'string' && (
                    <div className="mt-2">
                      <img 
                        src={image} 
                        alt="Current" 
                        className="w-16 h-16 object-cover rounded-md"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          console.log('Image failed to load:', image);
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Current image</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                    <input 
                      type="checkbox" 
                      checked={showAsHome}
                      onChange={(e) => setShowAsHome(e.target.checked)}
                      className="rounded border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <span>Show as Home Category</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2 p-6 border-t bg-gray-50">
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button 
                onClick={() => saveCategory(true)}
                disabled={modalLoading || !name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {modalLoading ? (
                  <div className="flex items-center space-x-2">
                    <FiRefreshCw className="animate-spin" size={16} />
                    <span>Updating...</span>
                  </div>
                ) : (
                  'Update Category'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25">
          <div className="bg-white p-6 rounded-md shadow-md w-80">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p>Are you sure you want to delete this category?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <button 
                onClick={() => deleteCategory(selectedCategory)}
                disabled={modalLoading}
                className={`bg-red-500 text-white px-4 py-2 rounded-md ${modalLoading ? 'opacity-50' : 'hover:bg-red-600'}`}
              >
                {modalLoading ? "Deleting..." : "Delete"}
              </button>
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold p-6 border-b">Categories List</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Show as Home</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.map(category => (
                <tr key={category._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {category.image ? (
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded-md"
                        onError={(e) => {
                          console.log('Image failed to load:', category.image);
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', category.image);
                        }}
                      />
                    ) : null}
                    <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center" style={{display: category.image ? 'none' : 'flex'}}>
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {category.slug}
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                    {category.description || 'No description'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.showAsHome 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {category.showAsHome ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
<button 
                      onClick={() => editCategory(category)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => confirmDeleteCategory(category._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredCategories.length === 0 && categories.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              No categories match your current filters.
            </div>
          )}
          {categories.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No categories found. Add your first category above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
