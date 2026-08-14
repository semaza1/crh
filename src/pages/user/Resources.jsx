import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, Search, Filter, Download, ExternalLink, Star,
  Video, FileText, Wrench, FileCode, File, ArrowRight, Grid, List, Home,
  ArrowLeft
} from 'lucide-react';

import Logo from '../../assets/Logo.png';

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Banner Header */}
      <div className="relative bg-slate-900 text-white overflow-hidden py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/50 via-slate-900 to-slate-900 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto">
          <Link 
            to={user ? "/user/dashboard" : "/"} 
            className="inline-flex items-center text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            {user ? "Back to Dashboard" : "Back to Home"}
          </Link>
          
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white tracking-tight">
              Learning & Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Resources</span>
            </h1>
            <p className="text-slate-400 mt-2 text-base sm:text-lg font-medium mb-8">
              Explore curated roadmaps, cheat sheets, toolkits, and guides designed to accelerate your growth.
            </p>

            {/* Search Bar */}
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand-400 transition-colors" />
              <input
                type="text"
                placeholder="Search templates, cheat sheets, guides, and tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-sm sm:text-base shadow-xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Featured Resources Banner */}
      {featuredResources.length > 0 && !searchTerm && selectedCategory === 'all' && selectedType === 'all' && (
        <div className="bg-white border-b border-slate-200/80 py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-amber-500 fill-current" />
              <h2 className="text-xl font-bold text-slate-900">Featured Toolkits & Handbooks</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredResources.slice(0, 3).map((resource) => (
                <div 
                  key={resource.id} 
                  className="bg-gradient-to-br from-slate-900 to-brand-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div>
                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <div className="p-3 rounded-2xl bg-white/10 text-brand-300 backdrop-blur-md">
                        {getResourceIcon(resource.resource_type)}
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" /> Featured
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-brand-300 transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-xs font-medium text-slate-300 mb-6 line-clamp-3 leading-relaxed">
                      {resource.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleResourceClick(resource)}
                    className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Access Resource</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Catalog */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters Toolbar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider mr-1">
                <Filter className="h-4 w-4 text-brand-600" />
                Filters:
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors"
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
                className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-semibold text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-colors"
              >
                {resourceTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Formats' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between lg:justify-end gap-4">
              <span className="text-xs font-bold text-slate-500">
                {filteredResources.length} {filteredResources.length === 1 ? 'item' : 'items'} found
              </span>

              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Grid View"
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-600' : 'text-slate-500 hover:text-slate-800'}`}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Grid / List Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500/20 border-t-brand-500 mb-3"></div>
            <p className="text-slate-400 font-semibold text-xs">Loading resources library...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No resources match</h3>
            <p className="text-slate-500 text-sm font-medium mb-6">Try adjusting your search keywords or filter dropdowns.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedType('all');
              }}
              className="px-5 py-2.5 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <div 
                key={resource.id} 
                className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-brand-500/40 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-brand-50 text-brand-600">
                      {getResourceIcon(resource.resource_type)}
                    </div>
                    {resource.is_featured && (
                      <Star className="h-4 w-4 text-amber-500 fill-current" />
                    )}
                  </div>

                  {resource.category && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 mb-2">
                      {resource.category}
                    </span>
                  )}

                  <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
                    {resource.title}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mb-6 line-clamp-3 leading-relaxed">
                    {resource.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleResourceClick(resource)}
                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-brand-600 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>View Resource</span>
                  </button>

                  {(resource.file_url || resource.link) && (
                    <button
                      onClick={() => handleDownload(resource)}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors"
                      title="Download Asset"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredResources.map((resource) => (
              <div 
                key={resource.id} 
                className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 hover:border-brand-500/40 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 rounded-2xl bg-brand-50 text-brand-600 shrink-0">
                    {getResourceIcon(resource.resource_type)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-900 text-base">{resource.title}</h4>
                      {resource.is_featured && <Star className="h-4 w-4 text-amber-500 fill-current shrink-0" />}
                    </div>
                    <p className="text-xs font-medium text-slate-500 line-clamp-2 max-w-2xl">{resource.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleResourceClick(resource)}
                    className="py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-500/20 transition-all flex items-center gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Access</span>
                  </button>

                  {(resource.file_url || resource.link) && (
                    <button
                      onClick={() => handleDownload(resource)}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;