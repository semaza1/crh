import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        loadProfile(data.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event);
        setUser(session?.user || null);
        
        if (session?.user && event === 'SIGNED_IN') {
          loadProfile(session.user);
        } else if (!session?.user) {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (authUser) => {
    try {
      console.log('Loading profile for:', authUser.id);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors

      if (error) {
        console.error('Profile error:', error);
      }

      if (data) {
        console.log('Profile loaded:', data);
        setUserProfile(data);
      } else {
        console.log('No profile found, creating and saving fallback');
        // Create a fallback profile
        const fallback = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          role: 'user',
          phone: authUser.user_metadata?.phone || '',
          interests: authUser.user_metadata?.interests || ''
        };
        
        // Save to database so it persists
        const { error: insertError } = await supabase
          .from('users')
          .insert([fallback]);
          
        if (insertError) {
          console.error('Error saving fallback profile to DB:', insertError);
        }
        
        setUserProfile(fallback);
      }
    } catch (err) {
      console.error('Load profile exception:', err);
      setUserProfile({
        id: authUser.id,
        email: authUser.email || '',
        name: 'User',
        role: 'user'
      });
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, name, phone = '', interests = '') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone, interests } }
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      signUp,
      signIn,
      signOut,
      isAdmin: userProfile?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};