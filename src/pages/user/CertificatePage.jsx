import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { 
  Award, Download, Share2, Eye, Search, Calendar,
  CheckCircle, ExternalLink, Shield, Trophy
} from 'lucide-react';

const CertificatesPage = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!userProfile) {
      navigate('/login');
      return;
    }
    fetchCertificates();
  }, [userProfile]);

  useEffect(() => {
    if (searchTerm) {
      setFilteredCertificates(
        certificates.filter(cert =>
          cert.courses?.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredCertificates(certificates);
    }
  }, [searchTerm, certificates]);

  const fetchCertificates = async () => {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            thumbnail_url,
            level
          )
        `)
        .eq('user_id', userProfile.id)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      setCertificates(data || []);
      setFilteredCertificates(data || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = (certificate) => {
    // This will open the certificate preview which can be printed/saved as PDF
    setSelectedCertificate(certificate);
    setShowPreview(true);
  };

  const handleShare = async (certificate) => {
    const shareUrl = `${window.location.origin}/verify-certificate/${certificate.verification_code}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${userProfile.name}'s Certificate`,
          text: `Check out my certificate for ${certificate.courses?.title}!`,
          url: shareUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert('Certificate verification link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500/20 border-t-brand-500 mb-4"></div>
        <p className="text-slate-400 font-semibold text-sm">Loading your credentials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Banner Header */}
      <div className="relative bg-slate-900 text-white overflow-hidden py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/50 via-slate-900 to-slate-900 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <button 
              onClick={() => navigate('/user/dashboard')} 
              className="inline-flex items-center text-sm font-semibold text-brand-400 hover:text-brand-300 transition-colors mb-3 group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform mr-1.5">←</span>
              Back to Dashboard
            </button>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white tracking-tight">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-brand-400 to-purple-400">Certificates</span>
            </h1>
            <p className="text-slate-400 mt-2 text-base font-medium max-w-xl">
              Celebrate your academic milestones and share verifiable proof of your achievements.
            </p>
          </div>

          <div className="hidden lg:flex items-center gap-4 glass-dark p-4 rounded-3xl border border-white/10 shrink-0">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-brand-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Trophy className="h-7 w-7" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Honors</div>
              <div className="text-xl font-extrabold text-white">{certificates.length} Total Earned</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Total Earned</p>
              <p className="text-3xl font-extrabold text-slate-900">{certificates.length}</p>
            </div>
            <div className="p-3.5 bg-brand-50 rounded-2xl text-brand-600">
              <Award className="h-7 w-7" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Issued This Year</p>
              <p className="text-3xl font-extrabold text-slate-900">
                {certificates.filter(c => 
                  new Date(c.issued_at).getFullYear() === new Date().getFullYear()
                ).length}
              </p>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-600">
              <Calendar className="h-7 w-7" />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Verified Badges</p>
              <p className="text-3xl font-extrabold text-slate-900">
                {certificates.filter(c => c.is_verified).length}
              </p>
            </div>
            <div className="p-3.5 bg-purple-50 rounded-2xl text-purple-600">
              <Shield className="h-7 w-7" />
            </div>
          </div>
        </div>

        {/* Search Toolbar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by course title or credential code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Certificates Grid */}
        {filteredCertificates.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4">
              <Award className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {searchTerm ? 'No matching certificates' : 'No certificates yet'}
            </h3>
            <p className="text-slate-500 text-sm font-medium mb-6">
              {searchTerm 
                ? 'Try searching with different keywords or course names.' 
                : 'Complete any course to 100% to automatically earn your official certificate.'}
            </p>
            {!searchTerm && (
              <Link
                to="/user/course"
                className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl text-sm shadow-md shadow-brand-500/25 transition-colors"
              >
                Explore Courses Now
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCertificates.map((certificate) => (
              <div
                key={certificate.id}
                className="bg-white rounded-3xl border border-slate-200/80 hover:border-brand-500/40 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col transform hover:-translate-y-1 group"
              >
                {/* Certificate Visual Banner */}
                <div className="relative h-44 bg-gradient-to-br from-slate-900 via-brand-950 to-purple-950 p-6 flex flex-col justify-between overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 opacity-15 pointer-events-none">
                    <Award className="w-40 h-40 text-amber-400" />
                  </div>

                  <div className="flex items-center justify-between relative z-10">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-amber-300 border border-amber-300/30 backdrop-blur-md">
                      Official Credential
                    </span>
                    {certificate.is_verified && (
                      <span className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <CheckCircle className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  <div className="relative z-10">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Career Reach Hub</div>
                    <div className="text-base font-bold text-white font-playfair line-clamp-1">Certificate of Mastery</div>
                  </div>
                </div>

                {/* Certificate Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                      {certificate.courses?.title}
                    </h3>
                    
                    <div className="space-y-2 mb-6 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-brand-600 shrink-0" />
                        <span>Issued: {formatDate(certificate.issued_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-600 shrink-0" />
                        <span className="font-mono text-slate-600 truncate">{certificate.certificate_number}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(certificate)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View / Print</span>
                    </button>

                    <button
                      onClick={() => handleShare(certificate)}
                      className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors"
                      title="Share link"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>

                    <Link
                      to={`/verify-certificate/${certificate.verification_code}`}
                      target="_blank"
                      className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors"
                      title="Public verification page"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {showPreview && selectedCertificate && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Certificate Print Design */}
            <div className="p-8 sm:p-14 bg-white" id="certificate-content">
              <div className="border-8 border-double border-slate-900 p-8 sm:p-12 relative text-center">
                {/* Crest */}
                <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-brand-200">
                  <Award className="h-10 w-10" />
                </div>

                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Career Reach Hub Certification</div>
                <h1 className="text-3xl sm:text-5xl font-playfair font-bold text-slate-950 mb-3 tracking-tight">
                  Certificate of Completion
                </h1>
                <p className="text-slate-500 font-medium text-sm mb-8">This honor is proudly presented to</p>

                {/* Recipient */}
                <div className="text-2xl sm:text-4xl font-playfair font-bold text-brand-600 mb-6 border-b-2 border-slate-200 pb-3 inline-block px-8">
                  {userProfile.name}
                </div>

                {/* Course Details */}
                <p className="text-slate-600 text-sm font-medium mb-2">for successfully completing all curriculum modules of</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 max-w-2xl mx-auto">
                  {selectedCertificate.courses?.title}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mb-10">
                  Awarded on {formatDate(selectedCertificate.completion_date || selectedCertificate.issued_at)}
                </p>

                {/* Bottom Signature & Verification Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end pt-8 border-t border-slate-200 text-left">
                  <div>
                    <div className="font-serif italic text-lg text-slate-800 border-b border-slate-300 pb-1 mb-1">
                      {selectedCertificate.instructor_name || 'Academic Director'}
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Authorized Signature</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right">
                    <p className="text-xs font-bold text-slate-400">CERTIFICATE NO.</p>
                    <p className="font-mono text-xs font-bold text-slate-900">{selectedCertificate.certificate_number}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Verify: /verify-certificate/{selectedCertificate.verification_code}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Toolbar */}
            <div className="p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setShowPreview(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-sm transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-colors flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;