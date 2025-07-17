interface SpotlightCardProps {
  cardHeader: string;
  children: React.ReactNode;
}

export default function SpotlightCard({
  cardHeader,
  children,
}: SpotlightCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 max-h-full max-w-8/10 w-full aspect-[4/3] flex flex-col justify-between">
      <h2 className="text-xl font-semibold text-gray-800 text-center">
        {cardHeader}
      </h2>
      <div className="flex flex-col items-center justify-center flex-grow">
        {children}
      </div>
    </div>
  );
}
