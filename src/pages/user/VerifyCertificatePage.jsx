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

  const generateMissingCertificates = async () => {
    setGenerating(true);
    try {
      // Get all user's enrollments
      const { data: enrollments, error: enrollError } = await supabase
        .from('enrollments')
        .select('id, course_id')
        .eq('user_id', userProfile.id)
        .eq('status', 'active');

      if (enrollError) throw enrollError;

      let certificatesCreated = 0;

      for (const enrollment of enrollments) {
        // Check if certificate already exists
        const { data: existingCert } = await supabase
          .from('certificates')
          .select('id')
          .eq('user_id', userProfile.id)
          .eq('course_id', enrollment.course_id)
          .maybeSingle();

        if (existingCert) continue; // Skip if certificate exists

        // Get total lessons for course
        const { data: lessons } = await supabase
          .from('lessons')
          .select('id')
          .eq('course_id', enrollment.course_id);

        if (!lessons || lessons.length === 0) continue;

        // Get completed lessons
        const { data: completedLessons } = await supabase
          .from('lesson_progress')
          .select('lesson_id, completed_at')
          .eq('user_id', userProfile.id)
          .eq('course_id', enrollment.course_id)
          .eq('status', 'completed');

        // Check if all lessons are completed
        if (completedLessons && completedLessons.length === lessons.length) {
          // Generate certificate number and verification code
          const certNumber = `CRH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0')}`;
          const verificationCode = Math.random().toString(36).substring(2, 14).toUpperCase();

          // Find latest completion date
          const latestCompletion = completedLessons.reduce((latest, lesson) => {
            const date = new Date(lesson.completed_at);
            return date > latest ? date : latest;
          }, new Date(0));

          // Create certificate
          const { error: insertError } = await supabase
            .from('certificates')
            .insert([{
              user_id: userProfile.id,
              course_id: enrollment.course_id,
              enrollment_id: enrollment.id,
              certificate_number: certNumber,
              verification_code: verificationCode,
              completion_date: latestCompletion.toISOString(),
              instructor_name: 'Career Connect Hub',
              issued_at: new Date().toISOString()
            }]);

          if (!insertError) {
            certificatesCreated++;
          }
        }
      }

      if (certificatesCreated > 0) {
        alert(`🎉 Generated ${certificatesCreated} certificate${certificatesCreated > 1 ? 's' : ''}!`);
        fetchCertificates();
      } else {
        alert('No new certificates to generate. Complete more courses to earn certificates!');
      }
    } catch (error) {
      console.error('Error generating certificates:', error);
      alert('Failed to generate certificates. Please try again.');
    } finally {
      setGenerating(false);
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

        {/* Search and Generate Button */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search certificates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={generateMissingCertificates}
              disabled={generating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {generating ? 'Generating...' : '🎓 Generate Certificates'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Click "Generate Certificates" to create certificates for any completed courses
          </p>
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
                to="/user/course/"
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 overflow-auto">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-auto">
            {/* Certificate Design */}
            <div className="p-8 md:p-16 bg-white" id="certificate-content">
              {/* Decorative Border */}
              <div className="border-8 border-double border-gradient relative" style={{
                borderImage: 'linear-gradient(135deg, #9333ea 0%, #4f46e5 50%, #3b82f6 100%) 1',
                padding: '3rem'
              }}>
                {/* Corner Decorations */}
                <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-purple-600 -m-1"></div>
                <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-purple-600 -m-1"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-purple-600 -m-1"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-purple-600 -m-1"></div>

                <div className="bg-white p-8 md:p-12 relative">
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <Award className="w-96 h-96 text-purple-600" />
                  </div>

                  {/* Header with Logo */}
                  <div className="text-center mb-6 relative z-10">
                    {/* Logo */}
                    <div className="flex justify-center mb-4">
                      <img 
                        src="../../src/assets/Logo.png" 
                        alt="CRH Logo" 
                        className="h-20 w-20 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
                      Career Connect Hub
                    </h1>
                    <div className="h-1 w-32 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-2xl md:text-3xl font-serif text-gray-700 mb-2">
                      Certificate of Completion
                    </h2>
                    <p className="text-sm text-gray-500 uppercase tracking-widest">This certifies that</p>
                  </div>

                  {/* Student Name */}
                  <div className="text-center mb-8 relative z-10">
                    <div className="inline-block">
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 px-8 py-3 border-b-4 border-gray-300">
                        {userProfile.name}
                      </h2>
                    </div>
                  </div>

                  {/* Course Info */}
                  <div className="text-center mb-8 relative z-10">
                    <p className="text-gray-600 mb-3 text-sm md:text-base">
                      has successfully completed the course
                    </p>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 px-4">
                      {selectedCertificate.courses?.title}
                    </h3>
                    <div className="flex justify-center items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Completed: {formatDate(selectedCertificate.completion_date)}</span>
                      </div>
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-2" />
                        <span className="capitalize">{selectedCertificate.courses?.level} Level</span>
                      </div>
                    </div>
                  </div>

                  {/* Achievement Statement */}
                  <div className="text-center mb-8 relative z-10">
                    <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto italic">
                      This certificate is awarded in recognition of dedication, hard work, 
                      and successful completion of all course requirements demonstrating 
                      mastery of the subject matter.
                    </p>
                  </div>

                  {/* Signatures */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 relative z-10">
                    {/* Instructor Signature */}
                    <div className="text-center">
                      <div className="mb-3">
                        <div className="h-16 flex items-center justify-center">
                          {/* Signature Image or Text */}
                          <p className="text-2xl font-dancing italic text-purple-600">
                            {selectedCertificate.instructor_name || 'Career Connect Hub'}
                          </p>
                        </div>
                      </div>
                      <div className="border-t-2 border-gray-400 pt-2 mb-1 max-w-xs mx-auto">
                        <p className="font-semibold text-gray-900">
                          {selectedCertificate.instructor_name || 'Career Connect Hub'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 uppercase tracking-wider">Program Director</p>
                    </div>

                    {/* Organization Seal/Signature */}
                    <div className="text-center">
                      <div className="mb-3">
                        <div className="h-16 flex items-center justify-center">
                          {/* Seal or Logo */}
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs border-4 border-purple-200">
                            <div className="text-center">
                              <div>CRH</div>
                              <div className="text-[8px]">OFFICIAL</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="border-t-2 border-gray-400 pt-2 mb-1 max-w-xs mx-auto">
                        <p className="font-semibold text-gray-900">Official Seal</p>
                      </div>
                      <p className="text-xs text-gray-600 uppercase tracking-wider">Career Connect Hub</p>
                    </div>
                  </div>

                  {/* Certificate Details */}
                  <div className="mt-12 pt-8 border-t-2 border-gray-200 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-xs">
                      <div className="bg-purple-50 p-3 rounded">
                        <p className="text-gray-600 mb-1 uppercase tracking-wider">Certificate Number</p>
                        <p className="font-mono font-bold text-purple-700">
                          {selectedCertificate.certificate_number}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-gray-600 mb-1 uppercase tracking-wider">Issue Date</p>
                        <p className="font-semibold text-blue-700">
                          {formatDate(selectedCertificate.issued_at)}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-gray-600 mb-1 uppercase tracking-wider">Verification Code</p>
                        <p className="font-mono font-bold text-green-700">
                          {selectedCertificate.verification_code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Verification URL */}
                  <div className="text-center mt-6 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full">
                      <Shield className="h-3 w-3 text-purple-600" />
                      <p className="text-xs text-gray-600">
                        Verify at: <span className="font-mono text-purple-600">{window.location.origin}/verify-certificate/{selectedCertificate.verification_code}</span>
                      </p>
                    </div>
                  </div>

                  {/* Footer Quote */}
                  <div className="text-center mt-8 relative z-10">
                    <p className="text-xs text-gray-500 italic">
                      "Education is the most powerful weapon which you can use to change the world." - Nelson Mandela
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 bg-gray-50 border-t flex gap-3 print:hidden">
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

          {/* Print Styles */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #certificate-content,
              #certificate-content * {
                visibility: visible;
              }
              #certificate-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
              .print\\:hidden {
                display: none !important;
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;