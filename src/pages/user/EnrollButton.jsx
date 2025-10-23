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
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}
      
      <button
        onClick={handleEnroll}
        disabled={loading}
        className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
          course.is_premium
            ? 'bg-yellow-500 text-white hover:bg-yellow-600'
            : 'bg-purple-600 text-white hover:bg-purple-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <>
            <Loader className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : course.is_premium ? (
          <>
            <Lock className="h-5 w-5 mr-2" />
            Enroll for ${course.price}
          </>
        ) : (
          <>
            <Check className="h-5 w-5 mr-2" />
            Enroll for Free
          </>
        )}
      </button>

      {course.is_premium && (
        <p className="text-xs text-gray-500 text-center mt-2">
          You'll be redirected to complete payment
        </p>
      )}
    </div>
  );
};

export default EnrollButton;