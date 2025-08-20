import { Link } from 'react-router';

interface NotFoundProps {
  title?: string;
  message?: string;
  showHomeLink?: boolean;
}

export default function NotFound({ 
  title = "404 - Page Not Found",
  message = "Looks like this page took a penalty and got sent to the sin bin!",
  showHomeLink = true 
}: NotFoundProps) {
  const hockeyQuips = [
    "This page is offside!",
    "Looks like we missed the net on this one.",
    "Page not found - must be in the penalty box!",
    "This URL got checked into the boards.",
    "404: The page you're looking for is in the locker room.",
    "Oops! This page got a game misconduct.",
    "This content is currently on the injured reserve list.",
    "Page not found - it must be on a power play break!"
  ];

  const randomQuip = hockeyQuips[Math.floor(Math.random() * hockeyQuips.length)];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Hockey Puck Animation */}
        <div className="mb-8 relative">
          <div className="inline-block">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-black rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <div className="text-white font-bold text-4xl md:text-5xl">404</div>
            </div>
            {/* Hockey stick */}
            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 rotate-45">
              <div className="w-16 h-2 bg-amber-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Oops!
          </h1>
          
          <div className="space-y-3">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700">
              {title}
            </h2>
            
            <p className="text-lg text-gray-600 max-w-lg mx-auto">
              {message}
            </p>
            
            {/* Random hockey quip */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg max-w-md mx-auto">
              <p className="text-blue-800 font-medium italic">
                "{randomQuip}"
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            {showHomeLink && (
              <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Back to Home Ice
              </Link>
            )}
            
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Go Back
            </button>
          </div>

          {/* Fun Stats */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-red-600">0</div>
                <div className="text-sm text-gray-600">Pages Found</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">404</div>
                <div className="text-sm text-gray-600">Error Code</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">∞</div>
                <div className="text-sm text-gray-600">Better Pages Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
