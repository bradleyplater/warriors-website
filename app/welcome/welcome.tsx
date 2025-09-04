import { Link } from 'react-router';

export function Welcome() {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        {/* Background Image */}
        <img 
          src="/images/team/tournament-win.jpg"
          alt="Tournament Victory"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-12 z-10">
          <div className="text-center">
            <img
              src="/images/warriors-logo-white.png"
              alt="Warriors Logo"
              className="h-16 md:h-20 w-auto mx-auto mb-6"
            />
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Peterborough Warriors
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Recreational ice hockey team bringing together players of all skill levels
            </p>
            
            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                to="/team" 
                className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                View Player Stats
              </Link>
              <Link 
                to="/team" 
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                Team Performance
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sponsors & Photographer Section */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div className="text-center mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-white mb-2">
              Our Partners
            </h2>
            <p className="text-sm text-gray-300">
              Proudly supported by our sponsors and photographer
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Sponsors */}
            <div>
              <h3 className="text-base font-medium text-white mb-4 text-center">
                Sponsors
              </h3>
              <div className="flex flex-wrap justify-center items-center gap-6">
                <img
                  src="/images/sponsor-logos/ask-to-build.png"
                  alt="Ask to Build"
                  className="h-12 md:h-16 w-auto object-contain hover:scale-105 transition-transform duration-200"
                />
                <img
                  src="/images/sponsor-logos/hockaine.jpg"
                  alt="Hockaine"
                  className="h-12 md:h-16 w-auto object-contain hover:scale-105 transition-transform duration-200"
                />
                <img
                  src="/images/sponsor-logos/hockey-jam.jpg"
                  alt="Hockey Jam"
                  className="h-12 md:h-16 w-auto object-contain hover:scale-105 transition-transform duration-200"
                />
              </div>
            </div>
            
            {/* Photographer */}
            <div>
              <h3 className="text-base font-medium text-white mb-4 text-center">
                Official Photographer
              </h3>
              <div className="flex justify-center">
                <div className="text-center">
                  <img
                    src="/images/sponsor-logos/j70.jpg"
                    alt="J70 Photography"
                    className="h-16 md:h-20 w-auto object-contain mx-auto mb-2 hover:scale-105 transition-transform duration-200"
                  />
                  <p className="text-sm text-gray-300">
                    Capturing our best moments
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Explore the Warriors
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our team's journey, upcoming games, and player achievements
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Spotlights */}
          <Link 
            to="/spotlights" 
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 text-center group"
          >
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              Team Spotlights
            </h3>
            <p className="text-gray-600 text-sm">
              Current season highlights and key statistics
            </p>
          </Link>

          {/* Upcoming Games */}
          <Link 
            to="/upcoming-games" 
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 text-center group"
          >
            <div className="text-4xl mb-4">🏒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              Upcoming Games
            </h3>
            <p className="text-gray-600 text-sm">
              View our fixture list with dates and venues
            </p>
          </Link>

          {/* Player Stats */}
          <Link 
            to="/team" 
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 text-center group"
          >
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              Player Stats
            </h3>
            <p className="text-gray-600 text-sm">
              Individual player performance and statistics
            </p>
          </Link>

          {/* Team Stats */}
          <Link 
            to="/team" 
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 text-center group"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
              Team Stats
            </h3>
            <p className="text-gray-600 text-sm">
              Overall team performance and records
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
