interface SpotlightCardProps {
  cardHeader: string;
  children: React.ReactNode;
}

export default function SpotlightCard({
  cardHeader,
  children,
}: SpotlightCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 md:p-6 w-full aspect-[4/3] flex flex-col">
      <h3 className="text-base md:text-lg font-semibold text-gray-800 text-center mb-3">
        {cardHeader}
      </h3>
      <div className="flex flex-col items-center justify-center flex-grow">
        {children}
      </div>
    </div>
  );
}
