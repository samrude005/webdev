import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: confirmation
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const navigate = useNavigate();

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      // We keep the 2-step UI, but in Firebase the code is emailed to the user.
      setStep(2);
    } catch (error) {
      console.error('Forgot password error:', error);
      let message = 'Failed to send reset email. Please try again.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    // With Firebase, the reset is done via the link in the email, not here.
    // We simply inform the user to check their inbox.
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 ? (
            <form className="space-y-6" onSubmit={handleRequestCode}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="you@example.com"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  We'll send you a reset code to this email address
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </div>
            </form>
          ) : (
            <>
              {generatedCode && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Reset Code Generated!</span>
                  </div>
                  <p className="text-sm">Your reset code is: <span className="font-mono font-bold text-lg">{generatedCode}</span></p>
                  <p className="text-xs mt-1">In a real app, this would be sent to your email.</p>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleResetPassword}>
                <div>
                  <label htmlFor="resetCode" className="block text-sm font-medium text-gray-700">
                    Reset Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="resetCode"
                      name="resetCode"
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter 6-digit code"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setResetCode('');
                      setNewPassword('');
                      setConfirmPassword('');
                      setError('');
                    }}
                    className="flex-1 flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
