import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const TestPage = () => {
  const [tests, setTests] = useState({
    env: { status: 'pending', message: '' },
    connection: { status: 'pending', message: '' },
    database: { status: 'pending', message: '' },
    auth: { status: 'pending', message: '' }
  });

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    // Test 1: Environment Variables
    const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
    const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    setTests(prev => ({
      ...prev,
      env: {
        status: hasUrl && hasKey ? 'success' : 'error',
        message: hasUrl && hasKey 
          ? 'Environment variables are set' 
          : 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env file'
      }
    }));

    if (!hasUrl || !hasKey) return;

    // Test 2: Supabase Connection
    try {
      const { data, error } = await supabase.auth.getSession();
      setTests(prev => ({
        ...prev,
        connection: {
          status: error ? 'error' : 'success',
          message: error ? error.message : 'Connected to Supabase'
        }
      }));
    } catch (err) {
      setTests(prev => ({
        ...prev,
        connection: {
          status: 'error',
          message: err.message || 'Failed to connect'
        }
      }));
      return;
    }

    // Test 3: Database Access
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);
      
      setTests(prev => ({
        ...prev,
        database: {
          status: error ? 'error' : 'success',
          message: error 
            ? `Database error: ${error.message}` 
            : 'Database accessible'
        }
      }));
    } catch (err) {
      setTests(prev => ({
        ...prev,
        database: {
          status: 'error',
          message: err.message || 'Database query failed'
        }
      }));
    }

    // Test 4: Auth Test
    try {
      const { data, error } = await supabase.auth.getUser();
      setTests(prev => ({
        ...prev,
        auth: {
          status: 'success',
          message: data.user 
            ? `Logged in as ${data.user.email}` 
            : 'Not logged in (this is OK)'
        }
      }));
    } catch (err) {
      setTests(prev => ({
        ...prev,
        auth: {
          status: 'warning',
          message: 'Auth check failed: ' + err.message
        }
      }));
    }
  };

  const StatusIcon = ({ status }) => {
    if (status === 'success') return <CheckCircle className="h-6 w-6 text-green-600" />;
    if (status === 'error') return <XCircle className="h-6 w-6 text-red-600" />;
    if (status === 'warning') return <AlertCircle className="h-6 w-6 text-yellow-600" />;
    return <div className="h-6 w-6 border-2 border-gray-300 rounded-full animate-spin border-t-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 CRH System Diagnostics
          </h1>
          <p className="text-gray-600 mb-8">
            Running tests to check your setup...
          </p>

          <div className="space-y-4">
            {Object.entries(tests).map(([key, test]) => (
              <div
                key={key}
                className={`border rounded-lg p-4 flex items-start ${
                  test.status === 'success' ? 'border-green-200 bg-green-50' :
                  test.status === 'error' ? 'border-red-200 bg-red-50' :
                  test.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-gray-200 bg-gray-50'
                }`}
              >
                <StatusIcon status={test.status} />
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-900 capitalize mb-1">
                    {key === 'env' ? 'Environment Variables' :
                     key === 'connection' ? 'Supabase Connection' :
                     key === 'database' ? 'Database Access' :
                     'Authentication'}
                  </h3>
                  <p className="text-sm text-gray-700">{test.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Debug Info:</h2>
            <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm space-y-1">
              <p><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL || '❌ Not set'}</p>
              <p><strong>Has Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Yes' : '❌ No'}</p>
              <p><strong>Environment:</strong> {import.meta.env.MODE}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button
              onClick={runTests}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Run Tests Again
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Go to Home
            </a>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Fixes:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• If env test fails: Create .env file in project root</li>
            <li>• If connection fails: Check Supabase URL and key</li>
            <li>• If database fails: Run the SQL setup in Supabase</li>
            <li>• Restart dev server after changing .env: npm run dev</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestPage;