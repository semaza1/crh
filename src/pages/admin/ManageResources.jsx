import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  BookOpen, FileText, Plus, Edit, Trash2, Search, X, Check, AlertCircle, 
  ExternalLink, Video, File, Wrench, FileCode, Star, Upload, ArrowLeft,
  Download
} from 'lucide-react';

const ManageResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    link: '',
    file_url: '',
    resource_type: 'document',
    is_featured: false
  });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    let filtered = [...resources];

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.resource_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.resource_type === selectedType);
    }

    setFilteredResources(filtered);
  }, [searchTerm, selectedCategory, selectedType, resources]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
      setFilteredResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      showMessage('error', 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `resources/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        file_url: publicUrl,
        link: publicUrl
      }));

      showMessage('success', 'File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      showMessage('error', 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingResource) {
        const { error } = await supabase
          .from('resources')
          .update(formData)
          .eq('id', editingResource.id);

        if (error) throw error;
        showMessage('success', 'Resource updated successfully!');
      } else {
        const { error } = await supabase
          .from('resources')
          .insert([formData]);

        if (error) throw error;
        showMessage('success', 'Resource created successfully!');
      }

      setShowModal(false);
      setEditingResource(null);
      resetForm();
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      showMessage('error', error.message || 'Failed to save resource');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId) => {
    if (!confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;
      showMessage('success', 'Resource deleted successfully!');
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      showMessage('error', 'Failed to delete resource');
    }
  };

  const toggleFeatured = async (resource) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ is_featured: !resource.is_featured })
        .eq('id', resource.id);

      if (error) throw error;
      showMessage('success', `Resource ${!resource.is_featured ? 'marked as featured' : 'unfeatured'}`);
      fetchResources();
    } catch (error) {
      console.error('Error updating featured status:', error);
      showMessage('error', 'Failed to update featured status');
    }
  };

  const openModal = (resource = null) => {
    if (resource) {
      setEditingResource(resource);
      setFormData({
        category: resource.category || '',
        title: resource.title,
        description: resource.description || '',
        link: resource.link || '',
        file_url: resource.file_url || '',
        resource_type: resource.resource_type || 'document',
        is_featured: resource.is_featured || false
      });
    } else {
      setEditingResource(null);
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingResource(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      category: '',
      title: '',
      description: '',
      link: '',
      file_url: '',
      resource_type: 'document',
      is_featured: false
    });
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'tool': return <Wrench className="h-5 w-5" />;
      case 'template': return <FileCode className="h-5 w-5" />;
      case 'article': return <FileText className="h-5 w-5" />;
      default: return <File className="h-5 w-5" />;
    }
  };

  const categories = ['all', ...new Set(resources.map(r => r.category).filter(Boolean))];
  const resourceTypes = ['all', 'article', 'video', 'document', 'tool', 'template', 'other'];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Top Banner Header */}
      <div className="relative bg-slate-900 text-white overflow-hidden py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/50 via-slate-900 to-slate-900 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link 
              to="/admin/dashboard" 
              className="inline-flex items-center text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors mb-3 group"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" />
              Back to Command Center
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white tracking-tight">
              Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Resources</span>
            </h1>
            <p className="text-slate-400 mt-2 text-base font-medium">
              Upload roadmaps, downloadable handbooks, video guides, and templates for students.
            </p>
          </div>

          <button
            onClick={() => openModal()}
            className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Resource</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Toast Feedback */}
        {message.text && (
          <div className={`mb-6 rounded-2xl p-4 flex items-center shadow-lg animate-fade-in ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700' 
              : 'bg-red-500/10 border border-red-500/30 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <Check className="h-5 w-5 mr-3 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-3 shrink-0 text-red-600" />
            )}
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        {/* Toolbar & Filters */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources by title, category, format..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors"
            >
              {resourceTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Formats' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <span className="text-xs font-bold text-slate-400">
              {filteredResources.length} {filteredResources.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500/20 border-t-brand-500 mb-3"></div>
            <p className="text-slate-400 font-semibold text-xs">Loading resource library...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No resources match</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">
              Try adjusting your search keywords or create a new resource asset.
            </p>
            <button
              onClick={() => openModal()}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/25 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Resource</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-brand-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-brand-50 text-brand-600">
                      {getResourceIcon(resource.resource_type)}
                    </div>

                    <button
                      onClick={() => toggleFeatured(resource)}
                      className={`p-2 rounded-xl transition-colors ${
                        resource.is_featured
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-slate-50 text-slate-300 hover:text-amber-500'
                      }`}
                      title={resource.is_featured ? 'Remove from featured' : 'Mark as featured'}
                    >
                      <Star className="h-5 w-5 fill-current" />
                    </button>
                  </div>

                  {resource.category && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 mb-2">
                      {resource.category}
                    </span>
                  )}

                  <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
                    {resource.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mb-4 line-clamp-3 leading-relaxed">
                    {resource.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">
                    {resource.resource_type}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {resource.link && (
                      <a
                        href={resource.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                        title="Open Resource Link"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}

                    <button
                      onClick={() => openModal(resource)}
                      className="p-2 text-slate-600 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
                      title="Edit Resource"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(resource.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-slate-200"
                      title="Delete Resource"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 my-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-xl font-playfair font-bold text-slate-900">
                  {editingResource ? 'Edit Resource' : 'Add New Resource'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Add learning materials and career assets</p>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Resource Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  placeholder="e.g. Modern Web Engineering Cheat Sheet 2026"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Category Tag
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                    placeholder="e.g. Engineering, Design, College Prep"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Resource Format Type
                  </label>
                  <select
                    value={formData.resource_type}
                    onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                    className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  >
                    <option value="document">Document (PDF/Doc)</option>
                    <option value="template">Template / Code Boilerplate</option>
                    <option value="tool">Software / Tool</option>
                    <option value="article">Article / Guide</option>
                    <option value="video">Video Recording</option>
                    <option value="other">Other Asset</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Asset URL or External Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  placeholder="https://..."
                />
              </div>

              {/* Upload to Storage File */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Or Upload Direct File to Cloud Storage
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-brand-600 file:text-white hover:file:bg-brand-500 cursor-pointer"
                />
                {uploading && (
                  <p className="text-xs text-brand-600 font-semibold mt-1">Uploading file to storage bucket...</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  placeholder="Summarize the resource content and who benefits from reading it..."
                />
              </div>

              {/* Featured Switch */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Featured Resource</h4>
                  <p className="text-xs text-slate-500">Pin this asset to the top highlighted carousel</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-5 h-5 text-brand-600 rounded-lg focus:ring-brand-500 cursor-pointer"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition-colors flex items-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span>{editingResource ? 'Save Changes' : 'Create Resource'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageResourcesPage;