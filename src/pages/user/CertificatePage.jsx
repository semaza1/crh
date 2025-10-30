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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Certificates</h1>
              <p className="text-xl text-purple-100">
                Your achievements and completed courses
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Trophy className="h-12 w-12" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Certificates</p>
                <p className="text-3xl font-bold text-gray-900">{certificates.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Year</p>
                <p className="text-3xl font-bold text-gray-900">
                  {certificates.filter(c => 
                    new Date(c.issued_at).getFullYear() === new Date().getFullYear()
                  ).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Verified</p>
                <p className="text-3xl font-bold text-gray-900">
                  {certificates.filter(c => c.is_verified).length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search certificates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Certificates Grid */}
        {filteredCertificates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No certificates found' : 'No certificates yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Try a different search term' 
                : 'Complete courses to earn certificates'}
            </p>
            {!searchTerm && (
              <Link
                to="/courses"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Browse Courses
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((certificate) => (
              <div
                key={certificate.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Certificate Header */}
                <div className="relative h-40 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-6 flex items-center justify-center">
                  <div className="text-center">
                    <Award className="h-16 w-16 text-white mx-auto mb-2 opacity-90" />
                    <p className="text-white text-sm font-semibold opacity-90">
                      Certificate of Completion
                    </p>
                  </div>
                  {certificate.is_verified && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Certificate Body */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {certificate.courses?.title}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Issued: {formatDate(certificate.issued_at)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="h-4 w-4 mr-2" />
                      <span className="font-mono text-xs">{certificate.certificate_number}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(certificate)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </button>
                    <button
                      onClick={() => handleShare(certificate)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Share certificate"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/verify-certificate/${certificate.verification_code}`}
                      target="_blank"
                      className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Verify certificate"
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

      {/* Certificate Preview Modal */}
      {showPreview && selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            {/* Certificate Design */}
            <div className="p-12 bg-white" id="certificate-content">
              <div className="border-8 border-double border-purple-600 p-12">
                {/* Header */}
                <div className="text-center mb-8">
                  <Award className="h-20 w-20 text-purple-600 mx-auto mb-4" />
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Certificate of Completion
                  </h1>
                  <p className="text-gray-600">This is to certify that</p>
                </div>

                {/* Student Name */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-purple-600 mb-2 border-b-2 border-gray-300 pb-2 inline-block">
                    {userProfile.name}
                  </h2>
                </div>

                {/* Course Info */}
                <div className="text-center mb-8">
                  <p className="text-gray-600 mb-2">has successfully completed the course</p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {selectedCertificate.courses?.title}
                  </h3>
                  <p className="text-gray-600">
                    Completed on {formatDate(selectedCertificate.completion_date)}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end mt-12 pt-8 border-t-2 border-gray-200">
                  <div className="text-center">
                    <div className="border-t-2 border-gray-400 pt-2 mb-2 w-48">
                      <p className="font-semibold">{selectedCertificate.instructor_name || 'Instructor'}</p>
                    </div>
                    <p className="text-sm text-gray-600">Instructor Signature</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-xs text-gray-600 mb-1">Certificate ID</p>
                      <p className="font-mono text-sm font-bold text-purple-600">
                        {selectedCertificate.certificate_number}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">Verification Code</p>
                      <p className="font-mono text-xs font-semibold text-gray-700">
                        {selectedCertificate.verification_code}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verification URL */}
                <div className="text-center mt-6">
                  <p className="text-xs text-gray-500">
                    Verify this certificate at: {window.location.origin}/verify-certificate/{selectedCertificate.verification_code}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-gray-50 border-t flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Print / Save as PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;