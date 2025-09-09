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
      description: 'In their third year, the Warriors were invited to compete in another prestigious tournament—this time in Telford. The event featured a three-tier cup structure and brought together strong teams from across the region. Entering as a Tier 3 side, the Warriors made an immediate impact by winning their opening game, earning a place in the Tier 1 semi-final. Although they fell short against a top-tier opponent, the team showed resilience and determination, advancing to the Tier 2 final. There, the Warriors rose to the occasion and secured victory, proudly bringing home yet another trophy in what was a defining moment of their continued growth.',
      images: [] // No images available yet for future event
    },
    {
      id: 'awards-24',
      title: 'Second Annual Awards Evening',
      date: 'October 2024',
      description: 'The Warriors then hosted their second annual awards evening—an even bigger celebration than the year before. With new players having joined the roster, the event became not only a chance to reflect on another season of growth and success, but also a way to welcome fresh faces into the club’s culture. The evening marked a true celebration of how far the team had come, both on and off the ice.',
      images: [
        '/images/events/awards-24/1.jpg',
        '/images/events/awards-24/2.jpg',
        '/images/events/awards-24/3.jpg',
        '/images/events/awards-24/4..jpg',
        '/images/events/awards-24/5.jpg',
        '/images/events/awards-24/6.jpg',
        '/images/events/awards-24/7.jpg'
      ],
      awards: [
        { category: 'MVP', winner: 'Bradley Plater' },
        { category: 'Coaches Player of the Year', winner: 'Nick Mcfarlane' },
        { category: 'Managers Player of the Year', winner: 'Deane Ruane' },
        { category: 'Players Player', winner: 'Oliver McGill' },
        { category: 'Most Goals of the Year', winner: 'Charles Loew' },
        { category: 'Most Assists of the Year', winner: 'Bradley Plater' },
        { category: 'Most Points of the Year', winner: 'Rhys Evans & Charles Loew' },
        { category: 'Most Consistent Defender', winner: 'Joshua Turner' },
        { category: 'Most Consistent Forward', winner: 'Charles Loew' },
        { category: 'Most Improved Player', winner: 'Carlos Garret' },
        { category: 'Most Improved Skater', winner: 'Sandis Zutis' },
        { category: 'Most Improved Stickhandling', winner: 'Callum Jarvis' },
        { category: 'Most Improved Shooting', winner: 'James Donovan' },
        { category: 'Best Goalie', winner: 'Conor Watkins' },
        { category: 'Most Likely To Score An Own Goal', winner: 'Matt Heaton' },
        { category: 'Best Right Hook To Teammate', winner: 'Paul Bush' },
        { category: 'Biggest No Show', winner: 'Chris Jeffs' },
      ]
    },
    {
      id: 'charity-24',
      title: 'Second Charity Game Victory',
      date: 'August 2024',
      description: 'Almost a year after their first charity match, the Warriors once again teamed up with the Nottingham Cyclones—this time taking the cause to the iconic Motorpoint Arena in Nottingham. With the goal of making the event bigger and better, the team succeeded in bringing the community together for another memorable occasion. The game raised an impressive £3,615.72, which was shared between CPSL Mind and Nottinghamshire Mind, further strengthening the Warriors’ commitment to supporting mental health awareness and making a positive impact beyond the ice.',
      images: ['/images/events/charity-game-24/1.jpg', '/images/events/charity-game-24/2.jpg', '/images/events/charity-game-24/3.jpg'],
      gameResult: {
        opponent: 'Cyclones',
        score: 'Warriors Win'
      }
    },
    {
      id: 'tournament-24',
      title: 'Second Tournament Championship',
      date: 'August 2024',
      description: 'Almost a year later, the Warriors were invited back to compete in the MK Development Invitational. After a season spent challenging stronger opponents and growing closer as a team, the Warriors returned with renewed confidence and determination. This time, the hard work paid off. Not only did the team improve on their previous performance, but they also reached the final for one of the tournament’s major prizes—the Cup. In a nail-biting showdown against the MK Icebreakers, the Warriors triumphed to secure their first tournament victory, marking another defining milestone in the club’s history.',
      images: ['/images/events/tournament-24/1.jpg', '/images/events/tournament-24/2.jpg', '/images/events/tournament-24/3.jpg', '/images/events/tournament-24/4.jpg']
    },
    {
      id: 'awards-23',
      title: 'First Annual Awards Evening',
      date: 'November 2023',
      description: 'To close out the season, the Warriors held their annual awards evening—an opportunity to reflect on the year gone by and celebrate the team’s achievements both on and off the ice. The event also recognised the individual successes that contributed to the Warriors’ growth, while staying true to the team’s spirit with plenty of light-hearted fun along the way. It was the perfect way to bring players together to round off an unforgettable season.',
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
      description: 'The Warriors soon reached another key milestone by competing in their first official tournament—the MK Development Invitational. This event brought together teams from across England for an action-packed day of competitive hockey. Despite being less than a year old, the Warriors rose to the challenge and narrowly missed out on securing the second of the two major prizes, finishing as runners-up in the Plate Competition. This achievement marked an important step in the team’s development and proved their ability to compete with more established sides.',
      images: ['/images/events/tournament-23/1.jpg']
    },
    {
      id: 'charity-23',
      title: 'First Charity Game',
      date: 'August 2023',
      description: 'The Warriors’ journey has always been about more than just hockey. Demonstrating their commitment to the wider community, the team hosted the Nottingham Cyclones in Peterborough for a special charity game dedicated to raising awareness around mental health. Supporting both CPSL Mind and Nottinghamshire Mind, the event highlighted the power of sport to bring people together for an important cause. Through the generosity of supporters and players alike, a total of £1,550.78 was raised and shared between the two charities—an achievement that remains a proud moment in the Warriors’ history.',
      images: [], // No images available for this event
      gameResult: {
        opponent: 'Cyclones',
        score: 'Warriors Win'
      }
    },
    {
      id: 'first-win',
      title: 'Historic First Victory',
      date: 'April 2023',
      description: 'The Warriors’ second major milestone came with their very first victory—an achievement that could not have been scripted in a more memorable setting. Inside the iconic Motorpoint Arena in Nottingham, the team triumphed over the Nottingham Cyclones with a hard-fought 3–2 win. That breakthrough moment not only fueled the Warriors’ hunger for future success but also validated the dedication, effort, and resilience invested by every player. It was a victory that made all the hard work feel worthwhile and strengthened the team’s belief in what they could achieve together.',
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
      description: 'The Warriors played their first official game in November 2022 against the Nottingham Cyclones. Although the match ended in a 5–1 defeat, it marked the beginning of an exciting journey. Over the following seasons, the Warriors faced the Cyclones multiple times, turning early setbacks into victories on several occasions. More importantly, that very first game laid the foundation for lasting bonds between teammates—a spirit of camaraderie and determination that continues to define the team today.',
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