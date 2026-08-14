import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Lock, Check, Loader } from 'lucide-react';

const EnrollButton = ({ course, onEnrollSuccess }) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnroll = async () => {
    // Check if user is logged in
    if (!userProfile) {
      alert('Please log in to enroll in courses');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if already enrolled
      const { data: existingEnrollment } = await supabase
        .from('enrollments')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('course_id', course.id)
        .single();

      if (existingEnrollment) {
        setError('You are already enrolled in this course');
        setLoading(false);
        return;
      }

      // If premium course, redirect to payment
      if (course.is_premium) {
        navigate(`/user/course/${course.id}/payment/${course.id}`);
        return;
      }

      // For free courses, enroll immediately
      const { error: enrollError } = await supabase
        .from('enrollments')
        .insert([{
          user_id: userProfile.id,
          course_id: course.id,
          enrolled_at: new Date().toISOString(),
          status: 'active'
        }]);

      if (enrollError) throw enrollError;

      // Success - refresh the page data
      if (onEnrollSuccess) {
        onEnrollSuccess();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('Error enrolling:', err);
      setError('Failed to enroll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-semibold text-red-600 animate-fade-in">
          {error}
        </div>
      )}
      
      <button
        onClick={handleEnroll}
        disabled={loading}
        className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center shadow-lg transform hover:-translate-y-0.5 ${
          course.is_premium
            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25'
            : 'bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white shadow-brand-500/30'
        } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader className="h-5 w-5 animate-spin" />
            <span>Processing Enrollment...</span>
          </div>
        ) : course.is_premium ? (
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            <span>Unlock Course for ${course.price}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            <span>Enroll Now for Free</span>
          </div>
        )}
      </button>

      {course.is_premium && (
        <p className="text-xs text-slate-400 font-medium text-center mt-3">
          Instant lifetime access • 100% secure checkout
        </p>
      )}
    </div>
  );
};

export default EnrollButton;