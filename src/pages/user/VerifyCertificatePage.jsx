import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  Award, CheckCircle, XCircle, Shield, Calendar, User, BookOpen, Search
} from 'lucide-react';

const VerifyCertificatePage = () => {
  const { verificationCode } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [searchCode, setSearchCode] = useState(verificationCode || '');

  useEffect(() => {
    if (verificationCode) {
      verifyCertificate(verificationCode);
    } else {
      setLoading(false);
    }
  }, [verificationCode]);

  const verifyCertificate = async (code) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            level
          ),
          users (
            name
          )
        `)
        .eq('verification_code', code.toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCertificate(data);
        setVerified(data.is_verified);
      } else {
        setCertificate(null);
        setVerified(false);
      }
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setCertificate(null);
      setVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchCode.trim()) {
      window.location.href = `/verify-certificate/${searchCode.trim().toUpperCase()}`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying certificate...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-2">Certificate Verification</h1>
            <p className="text-xl text-purple-100">
              Verify the authenticity of Career Reach Hub certificates
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="Enter verification code (e.g., ABC123XYZ456)"
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength="12"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Verify
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Enter the 12-character verification code found on the certificate
          </p>
        </div>

        {/* Verification Result */}
        {verificationCode && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {certificate && verified ? (
              <>
                {/* Success Header */}
                <div className="bg-green-50 border-b-4 border-green-500 p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-green-500 rounded-full p-4">
                      <CheckCircle className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-center text-green-800 mb-2">
                    Certificate Verified
                  </h2>
                  <p className="text-center text-green-700">
                    This is an authentic Career Reach Hub certificate
                  </p>
                </div>

                {/* Certificate Details */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Student Info */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <User className="h-5 w-5 text-purple-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">Student Information</h3>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-semibold text-gray-900">{certificate.users?.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                        <h3 className="font-semibold text-gray-900">Course Information</h3>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Course Title</p>
                          <p className="font-semibold text-gray-900">{certificate.courses?.title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Level</p>
                          <p className="font-semibold text-gray-900 capitalize">
                            {certificate.courses?.level}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Issued Date</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(certificate.issued_at)}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Award className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Certificate Number</p>
                      <p className="font-mono text-sm font-semibold text-gray-900">
                        {certificate.certificate_number}
                      </p>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Verification Code</p>
                      <p className="font-mono text-sm font-semibold text-gray-900">
                        {certificate.verification_code}
                      </p>
                    </div>
                  </div>

                  {/* Course Description */}
                  {certificate.courses?.description && (
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-semibold text-gray-900 mb-2">About the Course</h4>
                      <p className="text-gray-600 text-sm">
                        {certificate.courses.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-8 py-4 border-t">
                  <p className="text-xs text-center text-gray-600">
                    This certificate was issued by Career Reach Hub and can be verified at any time using the verification code above.
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Error Header */}
                <div className="bg-red-50 border-b-4 border-red-500 p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-red-500 rounded-full p-4">
                      <XCircle className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-center text-red-800 mb-2">
                    Certificate Not Found
                  </h2>
                  <p className="text-center text-red-700">
                    The verification code you entered does not match any certificate in our system
                  </p>
                </div>

                {/* Error Details */}
                <div className="p-8 text-center">
                  <p className="text-gray-600 mb-6">
                    This could mean:
                  </p>
                  <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600 mb-8">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>The verification code was entered incorrectly</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>The certificate has not been issued yet</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      <span>The certificate may have been revoked</span>
                    </li>
                  </ul>
                  <p className="text-sm text-gray-500">
                    Please double-check the verification code and try again.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Info Section */}
        {!verificationCode && (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
              How to Verify a Certificate
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Locate the Code</h4>
                <p className="text-sm text-gray-600">
                  Find the 12-character verification code on the certificate
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Enter the Code</h4>
                <p className="text-sm text-gray-600">
                  Type the verification code in the search box above
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">View Details</h4>
                <p className="text-sm text-gray-600">
                  See complete certificate information and authenticity status
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificatePage;