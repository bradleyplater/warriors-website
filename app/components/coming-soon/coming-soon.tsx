import { useState, useEffect } from 'react';

interface ComingSoonProps {
  title?: string;
  message?: string;
  feature?: string;
  showCountdown?: boolean;
  estimatedDate?: string;
}

export default function ComingSoon({ 
  title = "Coming Soon!",
  message = "We're working hard to bring you something amazing!",
  feature = "This feature",
  showCountdown = false,
  estimatedDate = "2025-02-01"
}: ComingSoonProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!showCountdown) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(estimatedDate) - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [estimatedDate, showCountdown]);

  const hockeyQuips = [
    "We're in the penalty box working on this!",
    "Currently in overtime development mode!",
    "This feature is warming up in the locker room!",
    "Our developers are on a power play!",
    "Taking a face-off with some new code!",
    "This section is getting a fresh coat of ice!",
    "We're skating hard to get this ready!",
    "Currently between periods - back soon!"
  ];

  const randomQuip = hockeyQuips[Math.floor(Math.random() * hockeyQuips.length)];

  return (
    <div className="min-h-96 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated Hockey Elements */}
        <div className="mb-8 relative">
          <div className="inline-block relative">
            {/* Hockey Rink */}
            <div className="w-48 h-24 md:w-64 md:h-32 bg-gradient-to-b from-blue-50 to-blue-100 rounded-3xl border-4 border-blue-300 relative overflow-hidden">
              {/* Center Line */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-full bg-red-500"></div>
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 border-2 border-blue-500 rounded-full"></div>
              
              {/* Animated Hockey Puck */}
              <div className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-black rounded-full animate-bounce">
                <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></div>
              </div>
            </div>
            
            {/* Hockey Sticks */}
            <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 rotate-45">
              <div className="w-12 h-1 bg-amber-600 rounded-full"></div>
            </div>
            <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 -rotate-45">
              <div className="w-12 h-1 bg-amber-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          
          <div className="space-y-4">
            <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto">
              {message}
            </p>
            
            {/* Hockey Quip */}
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg max-w-md mx-auto">
              <p className="text-blue-800 font-medium italic">
                "{randomQuip}"
              </p>
            </div>
          </div>

          {/* Countdown Timer */}
          {showCountdown && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Estimated Launch:</h3>
              <div className="grid grid-cols-4 gap-2 md:gap-4 max-w-md mx-auto">
                <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border">
                  <div className="text-xl md:text-2xl font-bold text-blue-600">{timeLeft.days}</div>
                  <div className="text-xs md:text-sm text-gray-600">Days</div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border">
                  <div className="text-xl md:text-2xl font-bold text-blue-600">{timeLeft.hours}</div>
                  <div className="text-xs md:text-sm text-gray-600">Hours</div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border">
                  <div className="text-xl md:text-2xl font-bold text-blue-600">{timeLeft.minutes}</div>
                  <div className="text-xs md:text-sm text-gray-600">Minutes</div>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-lg shadow-sm border">
                  <div className="text-xl md:text-2xl font-bold text-blue-600">{timeLeft.seconds}</div>
                  <div className="text-xs md:text-sm text-gray-600">Seconds</div>
                </div>
              </div>
            </div>
          )}

          {/* Progress Indicators */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Development Progress</h3>
              
              <div className="space-y-3 max-w-md mx-auto">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Planning</span>
                  <span className="text-green-600 font-medium">✓ Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-full"></div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Development</span>
                  <span className="text-blue-600 font-medium">🔨 In Progress</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full w-3/4 animate-pulse"></div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Testing</span>
                  <span className="text-gray-500 font-medium">⏳ Pending</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-400 h-2 rounded-full w-1/4"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Fun Stats */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-purple-600">∞</div>
                <div className="text-sm text-gray-600">Lines of Code</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-green-600">☕</div>
                <div className="text-sm text-gray-600">Coffee Consumed</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-2xl font-bold text-blue-600">🏒</div>
                <div className="text-sm text-gray-600">Hockey Spirit</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-8 pt-6">
            <p className="text-gray-600 text-sm">
              Want updates? Check back soon or follow our progress!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
