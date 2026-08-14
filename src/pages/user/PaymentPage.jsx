import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { 
  CreditCard, Lock, CheckCircle, AlertCircle, ArrowLeft 
} from 'lucide-react';

const PaymentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    if (!userProfile) {
      navigate('/login');
      return;
    }
    fetchCourse();
  }, [courseId, userProfile]);

  const fetchCourse = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;
      setCourse(data);

      // Check if already enrolled
      const { data: enrollmentData } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('course_id', courseId)
        .single();

      if (enrollmentData) {
        navigate(`/user/course/${courseId}`);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Format card number with spaces
    if (name === 'cardNumber') {
      value = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) value = value.slice(0, 19);
    }

    // Format expiry date
    if (name === 'expiryDate') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      if (value.length > 5) value = value.slice(0, 5);
    }

    // Format CVV
    if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3);
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Create enrollment
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert([{
          user_id: userProfile.id,
          course_id: courseId,
          enrolled_at: new Date().toISOString(),
          status: 'active'
        }]);

      if (enrollError) throw enrollError;

      // Create payment record (optional)
      const { error: paymentError } = await supabase
        .from('payments')
        .insert([{
          user_id: userProfile.id,
          course_id: courseId,
          amount: course.price,
          status: 'completed',
          payment_method: 'card',
          transaction_id: `TXN${Date.now()}`,
          paid_at: new Date().toISOString()
        }]);

      if (paymentError) {
        console.warn('Payment record creation failed:', paymentError);
      }

      // Redirect to course with success message
      navigate(`/user/course/${courseId}`);
    } catch (err) {
      console.error('Error processing payment:', err);
      setError('Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500/20 border-t-brand-500 mb-4"></div>
        <p className="text-slate-400 font-semibold text-sm">Preparing secure checkout...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center max-w-md shadow-lg">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Course Not Found</h2>
          <p className="text-slate-500 text-sm font-medium mb-6">
            The course you are attempting to purchase could not be retrieved.
          </p>
          <Link 
            to="/user/course" 
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors shadow-md"
          >
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Checkout Banner */}
      <div className="relative bg-slate-900 text-white overflow-hidden py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-900/50 via-slate-900 to-slate-900 pointer-events-none"></div>
        <div className="relative max-w-7xl mx-auto">
          <Link 
            to={`/user/course/${courseId}`} 
            className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-brand-400 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            Back to Course Details
          </Link>
          <h1 className="text-3xl sm:text-4xl font-playfair font-bold text-white tracking-tight">
            Secure <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Checkout</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm font-medium">
            Complete your enrollment to unlock immediate lifetime access.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Payment Form (Left Col) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-3.5 mb-8 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Payment Information</h2>
                  <p className="text-xs text-slate-500 font-medium">Safe & encrypted 256-bit SSL transaction</p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start text-red-700 text-sm font-semibold animate-fade-in">
                  <AlertCircle className="h-5 w-5 mr-3 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div className="mb-8 p-4 bg-brand-50/60 border border-brand-100 rounded-2xl flex items-start gap-3">
                <Lock className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold text-brand-900 leading-relaxed">
                  <strong>Demo Sandbox Mode:</strong> This is a simulated checkout. You can enter any mock card details to test instant enrollment.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    required
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all tracking-wider"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Cardholder Name *
                  </label>
                  <input
                    type="text"
                    name="cardName"
                    required
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="Full name as printed on card"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      name="expiryDate"
                      required
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Security Code (CVV) *
                    </label>
                    <input
                      type="text"
                      name="cvv"
                      required
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-slate-900 text-sm focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-brand-500/30 transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none mt-6"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2"></div>
                      Processing Enrollment...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Complete Enrollment • ${course.price}
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-slate-400 font-medium pt-2">
                  By confirming, you will be enrolled into the course immediately.
                </p>
              </form>
            </div>
          </div>

          {/* Order Summary (Right Col) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 sticky top-8">
              <h3 className="text-lg font-bold text-slate-900 mb-5">Order Summary</h3>
              
              <div className="h-40 rounded-2xl overflow-hidden mb-4 bg-slate-900">
                <img
                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <h4 className="font-bold text-slate-900 text-base mb-1.5 leading-snug">{course.title}</h4>
              <p className="text-xs text-slate-500 font-medium mb-6 line-clamp-2 leading-relaxed">{course.description}</p>

              <div className="border-t border-slate-100 pt-4 space-y-2.5 mb-6">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Course Tuition</span>
                  <span className="text-slate-900">${course.price}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Platform & Processing Fee</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">Total Due Today</span>
                  <span className="text-2xl font-extrabold text-brand-600">${course.price}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs font-medium text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800">Your enrollment includes:</p>
                    <p>• Lifetime 24/7 access</p>
                    <p>• Completion certificate</p>
                    <p>• Interactive practice modules</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
