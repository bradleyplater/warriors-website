import { Link } from 'react-router';
import type { Route } from '../+types/root';
import { SocialIcon } from 'react-social-icons';
import { GiBrain, GiHockey, GiOnTarget } from "react-icons/gi";
import { FaHandshakeSimple } from 'react-icons/fa6';
import { RiUserCommunityLine } from 'react-icons/ri';

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: 'About Us - Warriors' },
    { name: 'description', content: 'Learn about the Warriors recreational ice hockey team from Peterborough' },
  ];
}

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
            About the Warriors
          </h1>
          <p className="text-sm md:text-base text-gray-600 text-center mt-2">
            Learn about our team, mission, and community impact
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="text-center">
            <img
              src="images/warriors-logo-white.png"
              alt="Warriors Logo"
              className="h-16 md:h-20 w-auto mx-auto mb-6"
            />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Peterborough Warriors
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              A recreational ice hockey team bringing together players of all skill levels in Peterborough
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        {/* Mission & Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <GiOnTarget className="text-4xl" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Our Mission</h3>
            </div>
            <p className="text-sm md:text-base text-gray-700 text-center leading-relaxed">
              To provide a welcoming environment where players of all skill levels can improve, 
              build friendships, and enjoy the sport we love. From beginners to experienced players, 
              everyone has a place with the Warriors.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaHandshakeSimple className="text-4xl" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900">Our Values</h3>
            </div>
            <p className="text-sm md:text-base text-gray-700 text-center leading-relaxed">
              Teamwork, respect, and community spirit drive everything we do. We believe in 
              supporting each other on and off the ice, creating lasting bonds that extend 
              beyond hockey.
            </p>
          </div>
        </div>

        {/* What We Offer */}
        <div className="mb-12">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-8">
            What We Offer
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <GiHockey className="text-4xl" />
              </div>
              <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Regular Games</h4>
              <p className="text-sm text-gray-700">
                Regular games and tournaments to keep your skills sharp and competitive spirit alive.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <GiBrain className="text-4xl" />
              </div>
              <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Skill Development</h4>
              <p className="text-sm text-gray-700">
                Training sessions and mentorship opportunities to help players improve at every level.
              </p>  
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <RiUserCommunityLine className="text-4xl" />
              </div>
              <h4 className="text-base md:text-lg font-semibold text-gray-900 mb-3">Community Impact</h4>
              <p className="text-sm text-gray-700">
                Charity games and community events that give back to Peterborough and surrounding areas.
              </p>
            </div>
          </div>
        </div>

        {/* Team Gallery */}
        <div className="mb-12">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-8">
            Our Journey in Pictures
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="/images/team/charity-game.jpg" 
                  alt="Warriors Charity Game"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-semibold text-gray-900 mb-2">Community Impact</h4>
                <p className="text-sm text-gray-700">
                  Raising funds and awareness for local causes through charity games.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="/images/team/tournament-win.jpg" 
                  alt="Warriors Tournament Victory"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-semibold text-gray-900 mb-2">Tournament Success</h4>
                <p className="text-sm text-gray-700">
                  Celebrating victories that showcase our team spirit and dedication.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="/images/team/tournament.jpg" 
                  alt="Warriors Tournament Team"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="p-4">
                <h4 className="text-base font-semibold text-gray-900 mb-2">Team Unity</h4>
                <p className="text-sm text-gray-700">
                  More than teammates - we're a hockey family supporting each other.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Get Involved */}
        <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8 text-center mb-12">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            Ready to Join the Warriors?
          </h3>
          <p className="text-sm md:text-base text-gray-700 mb-6 max-w-2xl mx-auto">
            Whether you're picking up a stick for the first time or you're a seasoned player, 
            there's a place for you on our team. Come be part of the Warriors family!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/players" 
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Meet Our Players
            </Link>
            <Link 
              to="/player-stats" 
              className="border border-gray-300 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              View Team Stats
            </Link>
          </div>
        </div>

        {/* Connect With Us */}
        <div className="text-center">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
            Stay Connected
          </h3>
          <p className="text-sm md:text-base text-gray-700 mb-6">
            Follow us for game schedules, team news, and community events
          </p>
          
          <div className="flex justify-center space-x-4">
            <a 
              href="https://www.facebook.com/profile.php?id=100084577901994" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <SocialIcon url="https://www.facebook.com/profile.php?id=100084577901994" network="facebook" className="w-8 h-8" />
            </a>
            <a 
              href="https://www.instagram.com/peterboroughwarriors" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-700 transition-colors"
            >
              <SocialIcon url="https://www.instagram.com/peterboroughwarriors" network="instagram" className="w-8 h-8" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}