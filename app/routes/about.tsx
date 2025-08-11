import { Link } from 'react-router';
import type { Route } from '../+types/root';
import { SocialIcon } from 'react-social-icons';

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: 'About Us - Warriors' },
    { name: 'description', content: 'Learn about the Warriors recreational ice hockey team from Peterborough' },
  ];
}

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">About the Warriors</h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
              A recreational ice hockey team bringing together players of all skill levels in Peterborough
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Who We Are Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Who We Are</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              The Warriors are a recreational ice hockey team based in Peterborough, uniting players who share 
              a passion for the game. We welcome all skill levels - from complete beginners to experienced players 
              seeking competitive hockey in a supportive community.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our mission is simple: provide a welcoming environment where everyone can improve their skills, 
              build lasting friendships, and have fun playing the sport we love. Whether it's your first time 
              on skates or you're a seasoned player, there's a place for you with the Warriors.
            </p>
          </div>
        </div>

        {/* Image Showcase */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">Our Journey</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Charity Game */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="/images/team/charity-game.JPG" 
                  alt="Warriors Charity Game"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Community Impact</h3>
                <p className="text-gray-700">
                  We believe in giving back to our community. Our charity games help raise funds and awareness 
                  for local causes while bringing people together through hockey.
                </p>
              </div>
            </div>

            {/* Tournament Win */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="/images/team/tournament-win.jpg" 
                  alt="Warriors Tournament Victory"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Celebrating Success</h3>
                <p className="text-gray-700">
                  Hard work and team spirit pay off! Our tournament victories are a testament to the 
                  dedication and camaraderie that defines the Warriors family.
                </p>
              </div>
            </div>

            {/* Tournament */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="aspect-video overflow-hidden">
                <img 
                  src="/images/team/tournament.JPG" 
                  alt="Warriors Tournament Team"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Team Unity</h3>
                <p className="text-gray-700">
                  From practice sessions to tournament play, we support each other on and off the ice. 
                  The Warriors are more than a team - we're a hockey family.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 md:p-12 text-white text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join the Warriors?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Whether you're a beginner or experienced player, there's a place for you on our team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/players" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Meet Our Players
            </Link>
            <Link 
              to="/player-stats" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Team Stats
            </Link>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Connect With Us</h2>
          <p className="text-lg text-gray-700 mb-8">
            Follow us on social media to stay updated with game schedules, team news, and community events.
          </p>
          
          <div className="flex justify-center space-x-6">
            <SocialIcon url="https://www.facebook.com/profile.php?id=100084577901994" network="facebook" className="w-12 h-12" />
            <SocialIcon url="https://www.instagram.com/peterboroughwarriors" network="instagram" className="w-12 h-12" />
          </div>
        </div>
      </div>
    </div>
  );
}