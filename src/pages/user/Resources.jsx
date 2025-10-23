import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, Search, Filter, Download, ExternalLink, Star,
  Video, FileText, Wrench, FileCode, File, ArrowRight, Grid, List, Home,
  ArrowLeft
} from 'lucide-react';

const ResourcesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [featuredResources, setFeaturedResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedCategory, selectedType]);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setResources(data || []);
      setFeaturedResources(data?.filter(r => r.is_featured) || []);
      setFilteredResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = [...resources];

    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.resource_type === selectedType);
    }

    setFilteredResources(filtered);
  };

  const handleResourceClick = (resource) => {
    if (!user) {
      navigate('/login', { state: { from: `/user/resources/${resource.id}` } });
      return;
    }
    window.open(resource.link, '_blank');
  };

  const handleDownload = (resource) => {
    if (!user) {
      navigate('/login', { state: { from: `/user/resources/${resource.id}` } });
      return;
    }
    if (resource.file_url) {
      window.open(resource.file_url, '_blank');
    } else {
      window.open(resource.link, '_blank');
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'tool':
        return <Wrench className="h-5 w-5" />;
      case 'template':
        return <FileCode className="h-5 w-5" />;
      case 'article':
        return <File className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getResourceColor = (type) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-600';
      case 'document':
        return 'bg-blue-100 text-blue-600';
      case 'tool':
        return 'bg-green-100 text-green-600';
      case 'template':
        return 'bg-purple-100 text-purple-600';
      case 'article':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const categories = ['all', ...new Set(resources.map(r => r.category).filter(Boolean))];
  const resourceTypes = ['all', 'article', 'video', 'document', 'tool', 'template', 'other'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">CRH Learning</span>
            </div>
            <div className="flex items-center hover:text-purple-600">
              <ArrowLeft className="h-4 w-4" />
              <Link to="/user/dashboard/" className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Career Resources</h1>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Access valuable resources to help you succeed in your career journey
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Resources */}
      {featuredResources.length > 0 && !searchTerm && selectedCategory === 'all' && selectedType === 'all' && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Star className="h-6 w-6 text-yellow-500 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Featured Resources</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredResources.slice(0, 3).map((resource) => (
                <div key={resource.id} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${getResourceColor(resource.resource_type)}`}>
                      {getResourceIcon(resource.resource_type)}
                    </div>
                    <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {resource.description}
                  </p>
                  <button
                    onClick={() => handleResourceClick(resource)}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                  >
                    Access Resource
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Filter className="h-5 w-5" />
              <span>Filters:</span>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {resourceTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <div className="flex-1"></div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Showing {filteredResources.length} {filteredResources.length === 1 ? 'resource' : 'resources'}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-400 hover:bg-gray-100'}`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Resources Grid/List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search term</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all overflow-hidden group">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${getResourceColor(resource.resource_type)}`}>
                      {getResourceIcon(resource.resource_type)}
                    </div>
                    {resource.is_featured && (
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                    )}
                  </div>

                  {resource.category && (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded mb-3">
                      {resource.category}
                    </span>
                  )}

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {resource.description}
                  </p>

                  <div className="mb-4">
                    <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded capitalize">
                      {resource.resource_type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResourceClick(resource)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </button>
                    {(resource.file_url || resource.link) && (
                      <button
                        onClick={() => handleDownload(resource)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6">
                <div className="flex items-start gap-6">
                  <div className={`p-4 rounded-lg ${getResourceColor(resource.resource_type)} flex-shrink-0`}>
                    {getResourceIcon(resource.resource_type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors">
                          {resource.title}
                        </h3>
                        {resource.is_featured && (
                          <Star className="h-5 w-5 text-yellow-500 fill-current flex-shrink-0" />
                        )}
                      </div>
                      {resource.category && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded flex-shrink-0">
                          {resource.category}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-3">
                      {resource.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded capitalize">
                        {resource.resource_type}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResourceClick(resource)}
                          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Resource
                        </button>
                        {(resource.file_url || resource.link) && (
                          <button
                            onClick={() => handleDownload(resource)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Want Full Access to All Resources?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Create a free account to download and access all career resources
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/signup"
                className="px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Sign Up Free
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-colors"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BookOpen className="h-6 w-6 text-purple-500" />
              <span className="ml-2 text-lg font-bold">Career Connect Hub</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
              <Link to="/resources" className="hover:text-white transition-colors">Resources</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} Career Connect Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ResourcesPage;