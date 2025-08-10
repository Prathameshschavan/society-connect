import { Shield, Home, ArrowLeft, Lock, AlertTriangle } from 'lucide-react';

const UnauthorizedPage = () => {
  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    // Replace with your home page navigation logic
    console.log('Navigate to home page');
  };

  const handleContactAdmin = () => {
    // Replace with your admin contact logic
    console.log('Contact administrator');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Main Error Display */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-8">
          {/* Icon and Status */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
              <Shield className="w-12 h-12 text-red-600" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <span className="text-2xl font-bold text-red-600">403</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              You don't have permission to access this resource
            </p>
            <p className="text-sm text-gray-500">
              This area is restricted to authorized society members only
            </p>
          </div>

          {/* Reason Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <Lock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 text-sm">Restricted Area</h3>
              <p className="text-xs text-gray-600 mt-1">This section requires special permissions</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <Shield className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 text-sm">Role-Based Access</h3>
              <p className="text-xs text-gray-600 mt-1">Only committee members can access this</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <AlertTriangle className="w-6 h-6 text-gray-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 text-sm">Session Expired</h3>
              <p className="text-xs text-gray-600 mt-1">Please sign in again to continue</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGoBack}
              className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <button
              onClick={handleGoHome}
              className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </button>
            <button
              onClick={handleContactAdmin}
              className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              <Shield className="w-4 h-4" />
              Contact Admin
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Access?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">For Residents:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Contact your society secretary</li>
                <li>• Verify your flat registration</li>
                <li>• Check if maintenance is up to date</li>
                <li>• Ensure your account is activated</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">For Committee Members:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Contact the system administrator</li>
                <li>• Verify your committee role status</li>
                <li>• Check if additional permissions are needed</li>
                <li>• Ensure you're signed in correctly</li>
              </ul>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Need immediate assistance?</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-800">
                    <span className="font-medium">Society Office:</span><br />
                    Monday - Saturday, 9 AM - 6 PM
                  </p>
                </div>
                <div>
                  <p className="text-blue-800">
                    <span className="font-medium">Emergency Contact:</span><br />
                    Available 24/7 for urgent issues
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Society Connect • Secure Community Management
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;