import { useEffect, useState } from 'react';
import type { Route } from '../+types/root';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Our Journey - Warriors" },
    { name: 'description', content: 'Explore the complete history and timeline of the Warriors hockey team from inception to present day' },
  ];
}

interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  images: string[];
  awards?: Award[];
  gameResult?: {
    opponent: string;
    score: string;
    venue?: string;
  };
}

interface Award {
  category: string;
  winner: string;
}

const responsive = {
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
    slidesToSlide: 1
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 1
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1
  }
};

function PhotoCarousel({ images, eventTitle }: { images: string[]; eventTitle: string }) {
  if (images.length === 0) {
    return null;
  }

  if (images.length === 1) {
    return (
      <div className="mb-6">
        <div className="px-2">
          <img
            src={images[0]}
            alt={`${eventTitle} - Photo`}
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Carousel
        responsive={responsive}
        infinite={true}
        autoPlay={true}
        autoPlaySpeed={4000}
        keyBoardControl={true}
        customTransition="all .5"
        transitionDuration={500}
        containerClass="carousel-container"
        removeArrowOnDeviceType={["tablet", "mobile"]}
        dotListClass="custom-dot-list-style"
        itemClass="carousel-item-padding-40-px"
      >
        {images.map((image, index) => (
          <div key={index} className="px-2">
            <img
              src={image}
              alt={`${eventTitle} - Photo ${index + 1}`}
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
}

function TimelineItem({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  return (
    <div className="relative">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-3 md:left-6 top-12 md:top-16 w-0.5 h-full bg-gradient-to-b from-gray-500 to-gray-300 z-0"></div>
      )}
      
      {/* Timeline dot */}
      <div className="absolute left-2 md:left-4 top-6 md:top-8 w-3 h-3 md:w-4 md:h-4 bg-gray-600 rounded-full border-2 md:border-4 border-white shadow-lg z-10"></div>
      
      {/* Content */}
      <div className="ml-8 md:ml-16 mb-8 md:mb-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <h3 className="text-lg md:text-xl lg:text-2xl font-bold">{event.title}</h3>
              <span className="text-blue-100 font-medium text-sm md:text-base">{event.date}</span>
            </div>
            {event.gameResult && (
              <div className="mt-2 text-blue-100 text-sm md:text-base">
                <span className="font-medium">vs {event.gameResult.opponent}</span>
                <span className="mx-2">•</span>
                <span className="font-bold">{event.gameResult.score}</span>
                {event.gameResult.venue && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{event.gameResult.venue}</span>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Photo Carousel */}
          <div className="p-4 md:p-6">
            <PhotoCarousel images={event.images} eventTitle={event.title} />
            
            {/* Description */}
            <div className="prose max-w-none">
              <p className="text-gray-700 leading-relaxed text-sm md:text-base lg:text-lg">
                {event.description}
              </p>
            </div>
            
            {/* Awards Section */}
            {event.awards && event.awards.length > 0 && (
              <div className="mt-4 md:mt-6 p-3 md:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="text-base md:text-lg font-bold text-yellow-800 mb-3 md:mb-4 flex items-center">
                  <span className="mr-2">🏆</span>
                  Season Awards
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
                  {event.awards.map((award, index) => (
                    <div key={index} className="bg-white p-2 md:p-3 rounded-lg shadow-sm border border-yellow-300">
                      <div className="text-xs md:text-sm font-medium text-yellow-700 mb-1">
                        {award.category}
                      </div>
                      <div className="text-sm md:text-base font-bold text-gray-900">
                        {award.winner}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OurJourney() {
  const timelineEvents: TimelineEvent[] = [
    {
      id: 'tournament-25',
      title: 'Third Tournament Victory',
      date: 'August 2025',
      description: 'The Warriors continued their tournament success story by claiming the Tier 2 championship in their third year. This victory demonstrated the team\'s consistent growth and competitive spirit, establishing them as a formidable force in regional hockey. The tournament showcased the depth of talent and tactical improvements that have become hallmarks of the Warriors organization.',
      images: [] // No images available yet for future event
    },
    {
      id: 'awards-24',
      title: 'Second Annual Awards Evening',
      date: 'October 2024',
      description: 'The Warriors celebrated another successful season with their second annual awards ceremony. This event recognized the outstanding contributions of players, coaches, and supporters who made the 2023/24 season memorable. The evening highlighted individual achievements while emphasizing the team spirit that drives the Warriors forward.',
      images: [
        '/images/events/awards-24/1.jpg',
        '/images/events/awards-24/2.jpg',
        '/images/events/awards-24/3.jpg',
        '/images/events/awards-24/4..jpg',
        '/images/events/awards-24/5.jpg',
        '/images/events/awards-24/6.jpg',
        '/images/events/awards-24/7.jpg'
      ]
    },
    {
      id: 'charity-24',
      title: 'Second Charity Game Victory',
      date: 'August 2024',
      description: 'Building on their charitable efforts, the Warriors hosted their second annual charity game against the Cyclones. This time, the Warriors emerged victorious, combining competitive hockey with community support. The event raised significant funds for local causes while entertaining fans with high-quality hockey action.',
      images: [], // No images available for this event
      gameResult: {
        opponent: 'Cyclones',
        score: 'Warriors Win'
      }
    },
    {
      id: 'tournament-24',
      title: 'Second Tournament Championship',
      date: 'August 2024',
      description: 'The Warriors achieved a major milestone by winning their first tournament championship in their second year. This victory marked a significant step forward in the team\'s development, showcasing improved skills, teamwork, and strategic play. The championship win boosted team morale and established the Warriors as serious contenders in competitive hockey.',
      images: ['/images/events/tournament-24/1.jpg']
    },
    {
      id: 'awards-23',
      title: 'First Annual Awards Evening',
      date: 'November 2023',
      description: 'The Warriors celebrated their inaugural season with a memorable awards ceremony, recognizing the exceptional contributions of players who helped establish the team\'s foundation. This milestone event honored individual achievements while celebrating the collective spirit that would define the Warriors\' identity for years to come.',
      images: [], // No images available for this event
      awards: [
        { category: 'Captain for 2023/24 Season', winner: 'Joshua Turner' },
        { category: 'Captain Assistant for 2023/24 Season', winner: 'Aaron Knight' },
        { category: 'Captain Assistant for 2023/24 Season', winner: 'Rhys Evans' },
        { category: 'MVP', winner: 'Konstantins Grigorjevs' },
        { category: 'Coaches Player of the Year', winner: 'Katie Bmx Plumb' },
        { category: 'Managers Player of the Year', winner: 'Darren Wolf' },
        { category: 'Players Player', winner: 'Aaron Knight' },
        { category: 'Players Player', winner: 'Josh Jt Turner' },
        { category: 'Most Goals of the Year', winner: 'Marcis Klemenss' },
        { category: 'Most Assists of the Year', winner: 'Aaron Knight' },
        { category: 'Most Consistent Defender', winner: 'Joshua Turner' },
        { category: 'Most Consistent Forward', winner: 'Marcis Klemenss' },
        { category: 'Most Improved Player', winner: 'Bradley Plater' },
        { category: 'Most Improved Skater', winner: 'Carlos Gabriel' },
        { category: 'Most Improved Stickhandling', winner: 'Joshua Turner' },
        { category: 'Most Improved Stickhandling', winner: 'Rhys Evans' },
        { category: 'Most Improved Shooting', winner: 'Rhys Evans' },
        { category: 'Biggest MK Lightning Fan', winner: 'Darren Bush' },
        { category: 'Best Attempt at Backflip', winner: 'Dean Ruane' },
        { category: 'Muffin Shot', winner: 'James Donovan' },
        { category: 'Team Enforcer', winner: 'Bradley Plater' },
      ]
    },
    {
      id: 'tournament-23',
      title: 'First Tournament - Plate Runners Up',
      date: 'August 2023',
      description: 'The Warriors made their tournament debut with an impressive showing, reaching the plate final in their first competitive tournament. Though they finished as runners-up, this achievement demonstrated the team\'s rapid development and competitive potential. The experience gained from this tournament would prove invaluable for future competitions.',
      images: ['/images/events/tournament-23/1.jpg']
    },
    {
      id: 'charity-23',
      title: 'First Charity Game - Buzzer Beater Victory',
      date: 'August 2023',
      description: 'In a thrilling charity match against the Cyclones, Aaron Knight delivered a spectacular buzzer-beater goal to secure the Warriors\' victory. This dramatic win not only provided entertainment for fans but also raised funds for local charitable causes, establishing the Warriors as a community-minded organization committed to giving back.',
      images: [], // No images available for this event
      gameResult: {
        opponent: 'Cyclones',
        score: 'Warriors Win (Buzzer Beater)'
      }
    },
    {
      id: 'first-win',
      title: 'Historic First Victory',
      date: 'April 2023',
      description: 'The Warriors achieved a monumental milestone with their first-ever competitive victory, defeating the Cyclones 3-2 at the prestigious Motorpoint Arena. This historic win marked the beginning of the team\'s competitive success and provided validation for all the hard work and dedication invested during their inaugural season.',
      images: [], // No images available for this event
      gameResult: {
        opponent: 'Cyclones',
        score: '3-2 Win',
        venue: 'Motorpoint Arena'
      }
    },
    {
      id: 'first-game',
      title: 'Inaugural Game',
      date: 'November 2022',
      description: 'The Warriors stepped onto the ice for their very first competitive game against the Cyclones in Peterborough. Despite a 5-1 defeat, this historic moment marked the beginning of the Warriors\' journey in competitive hockey. The team showed determination and sportsmanship that would become their trademark, learning valuable lessons that would fuel their future success.',
      images: ['/images/events/first-game/1.jpg'],
      gameResult: {
        opponent: 'Cyclones',
        score: '5-1 Loss',
        venue: 'Peterborough'
      }
    },
    {
      id: 'warriors-start',
      title: 'The Warriors Are Born',
      date: 'August 2022',
      description: 'What began as a simple skills and drills session soon became the foundation of a new recreational ice hockey team. Built on the idea of learning and growing together, the team has evolved with a focus on enjoyment, development, and creating opportunities for new players. With this spirit at its core, the club is committed to fostering a welcoming environment for all new players.',
      images: ['/images/events/warriors-start/1.jpg']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 lg:py-20">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold mb-4 md:mb-6">
              Our Journey
            </h1>
            <p className="text-base md:text-xl lg:text-2xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
              From humble beginnings to championship victories, explore the complete history 
              of the Warriors hockey team and the milestones that shaped our legacy.
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 lg:py-16">
        <div className="relative">
          {timelineEvents.map((event, index) => (
            <TimelineItem 
              key={event.id} 
              event={event} 
              isLast={index === timelineEvents.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Footer Message */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
            The Journey Continues
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-100 leading-relaxed">
            Every game, every practice, every moment adds to our story. 
            Join us as we continue to build the Warriors legacy, one victory at a time.
          </p>
        </div>
      </div>
    </div>
  );
}