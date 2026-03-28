import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { scaleLinear, scalePoint } from '@visx/scale';
import { curveMonotoneX } from '@visx/curve';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { useEffect, useState } from 'react';

interface DataPoint {
  x: string | number;
  y: number;
  date?: string;
  opponent?: string;
}

interface LineSeries {
  data: DataPoint[];
  color: string;
  label: string;
  showPoints?: boolean;
  showLabels?: boolean;
  strokeWidth?: number;
  strokeDasharray?: string;
}

interface GenericLineChartProps {
  data: DataPoint[];
  xLabel?: string;
  yLabel?: string;
  lineColor?: string;
  pointColor?: string;
  showGrid?: boolean;
  showPoints?: boolean;
  showPointLabels?: boolean;
  showAverage?: boolean;
  averageColor?: string;
  additionalLines?: LineSeries[];
  mainLineLabel?: string;
  averageLineLabel?: string;
  showLegend?: boolean;
  width?: number;
  height?: number;
  onHoverLine?: (label: string | null) => void;
  hoveredLineLabel?: string | null;
  showEndLabels?: boolean;
}

// Responsive chart dimensions
const getChartDimensions = (isMobile: boolean, customWidth?: number, customHeight?: number, showEndLabels?: boolean) => ({
  width: customWidth || (isMobile ? 350 : 850),
  height: customHeight || (isMobile ? 280 : 500),
  margin: isMobile 
    ? { top: 20, right: showEndLabels ? 60 : 20, bottom: 50, left: 65 }
    : { top: 30, right: showEndLabels ? 120 : 30, bottom: 70, left: 80 }
});

export default function GenericLineChart({ 
  data, 
  xLabel = '',
  yLabel = '',
  lineColor = '#8b5cf6',
  pointColor = '#8b5cf6',
  showGrid = true,
  showPoints = true,
  showPointLabels = true,
  showAverage = false,
  averageColor = '#ef4444',
  additionalLines = [],
  mainLineLabel = 'Actual',
  averageLineLabel = 'Average',
  showLegend = true,
  width: customWidth,
  height: customHeight,
  onHoverLine,
  hoveredLineLabel: externalHoveredLabel,
  showEndLabels = false
}: GenericLineChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [internalHoveredLabel, setInternalHoveredLabel] = useState<string | null>(null);

  const hoveredLabel = externalHoveredLabel !== undefined ? externalHoveredLabel : internalHoveredLabel;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { width, height, margin } = getChartDimensions(isMobile, customWidth, customHeight, showEndLabels);
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Prepare data for the line chart
  const chartData = data.map((item, index) => ({
    x: item.x,
    y: item.y,
    index: index
  }));

  // Calculate average line data if needed
  const averageValue = showAverage ? data.reduce((sum, point) => sum + point.y, 0) / data.length : 0;
  const averageData = showAverage ? data.map(point => ({
    x: point.x,
    y: averageValue,
    index: 0
  })) : [];

  // Combine all data for scale calculation
  const allDataPoints = [
    ...chartData,
    ...averageData,
    ...additionalLines.flatMap(line => line.data)
  ];

  if (allDataPoints.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 italic">
        No data to display.
      </div>
    );
  }

  // Create scales
  const xScale = scalePoint<string>({
    range: [0, xMax],
    domain: [...new Set(allDataPoints.map(d => String(d.x)))].sort(),
    padding: 0.2
  });

  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    domain: [0, Math.max(...allDataPoints.map(d => d.y), 0) * 1.1],
    nice: true
  });

  // Accessor functions
  const getX = (d: { x: string | number }) => xScale(String(d.x)) ?? 0;
  const getY = (d: { y: number }) => yScale(d.y) ?? 0;

  const handleMouseEnter = (label: string) => {
    setInternalHoveredLabel(label);
    onHoverLine?.(label);
  };

  const handleMouseLeave = () => {
    setInternalHoveredLabel(null);
    onHoverLine?.(null);
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="mx-auto overflow-visible">
        <Group left={margin.left} top={margin.top}>
          {/* Grid */}
          {showGrid && (
            <>
              <GridRows
                scale={yScale}
                width={xMax}
                strokeDasharray="2,2"
                stroke="#e5e7eb"
                strokeOpacity={0.7}
              />
              <GridColumns
                scale={xScale}
                height={yMax}
                strokeDasharray="2,2"
                stroke="#e5e7eb"
                strokeOpacity={0.7}
              />
            </>
          )}
          
          {/* Main Line */}
          {chartData.length > 0 && (
            <LinePath<typeof chartData[0]>
              data={chartData}
              x={getX}
              y={getY}
              stroke={lineColor}
              strokeWidth={hoveredLabel === mainLineLabel ? 5 : 3}
              strokeOpacity={hoveredLabel && hoveredLabel !== mainLineLabel ? 0.2 : 1}
              onMouseEnter={() => handleMouseEnter(mainLineLabel)}
              onMouseLeave={handleMouseLeave}
            />
          )}
          
          {/* Average Line */}
          {showAverage && (
            <LinePath<typeof averageData[0]>
              data={averageData}
              x={getX}
              y={getY}
              stroke={averageColor}
              strokeWidth={2}
              strokeDasharray="5,5"
              strokeOpacity={hoveredLabel && hoveredLabel !== averageLineLabel ? 0.2 : 1}
              onMouseEnter={() => handleMouseEnter(averageLineLabel)}
              onMouseLeave={handleMouseLeave}
            />
          )}
          
          {/* Additional Lines */}
          {additionalLines.map((line, index) => {
            const isHovered = hoveredLabel === line.label;
            const hasOtherHovered = hoveredLabel && !isHovered;
            
            return (
              <g key={index}>
                {/* Hit area for easier hovering */}
                <LinePath<DataPoint>
                  data={line.data}
                  x={getX}
                  y={getY}
                  stroke="transparent"
                  strokeWidth={20}
                  onMouseEnter={() => handleMouseEnter(line.label)}
                  onMouseLeave={handleMouseLeave}
                />
                <LinePath<DataPoint>
                  data={line.data}
                  x={getX}
                  y={getY}
                  stroke={line.color}
                  strokeWidth={isHovered ? 5 : (line.strokeWidth || 2)}
                  strokeDasharray={line.strokeDasharray}
                  strokeOpacity={hasOtherHovered ? 0.1 : 1}
                  className="transition-all duration-300 pointer-events-none"
                />
                
                {/* Data points for hovered line */}
                {isHovered && line.data.map((d, i) => (
                  <g key={`point-${index}-${i}`}>
                    <circle
                      cx={getX(d)}
                      cy={getY(d)}
                      r={isMobile ? 5 : 7}
                      fill={line.color}
                      stroke="white"
                      strokeWidth={2}
                      className="animate-in fade-in zoom-in duration-300"
                    />
                    <g className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                      <rect
                        x={getX(d) - (isMobile ? 25 : 35)}
                        y={getY(d) - (isMobile ? 35 : 45)}
                        width={isMobile ? 50 : 70}
                        height={isMobile ? 20 : 25}
                        rx={4}
                        fill="white"
                        stroke={line.color}
                        strokeWidth={1}
                        className="shadow-sm"
                      />
                      <text
                        x={getX(d)}
                        y={getY(d) - (isMobile ? 21 : 28)}
                        textAnchor="middle"
                        fontSize={isMobile ? 10 : 12}
                        fill="#111827"
                        fontWeight="900"
                      >
                        {d.y}
                      </text>
                      {d.opponent && (
                        <text
                          x={getX(d)}
                          y={getY(d) + (isMobile ? 20 : 25)}
                          textAnchor="middle"
                          fontSize={9}
                          fill="#6b7280"
                          fontWeight="600"
                          style={{ pointerEvents: 'none' }}
                        >
                          vs {d.opponent}
                        </text>
                      )}
                    </g>
                  </g>
                ))}

                {/* End-of-line Labels */}
                {showEndLabels && line.data.length > 0 && (
                  <text
                    x={getX(line.data[line.data.length - 1]) + 10}
                    y={getY(line.data[line.data.length - 1])}
                    alignmentBaseline="middle"
                    fontSize={isMobile ? 10 : 11}
                    fontWeight={isHovered ? "bold" : "600"}
                    fill={isHovered ? "#111827" : line.color}
                    fillOpacity={hasOtherHovered ? 0.1 : 1}
                    className="transition-all duration-300 pointer-events-none"
                  >
                    {line.label}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Data points */}
          {showPoints && chartData.map((d, i) => (
            <circle
              key={i}
              cx={getX(d)}
              cy={getY(d)}
              r={isMobile ? 4 : 6}
              fill={pointColor}
              stroke="white"
              strokeWidth={isMobile ? 1.5 : 2}
              strokeOpacity={hoveredLabel && hoveredLabel !== mainLineLabel ? 0.2 : 1}
              fillOpacity={hoveredLabel && hoveredLabel !== mainLineLabel ? 0.2 : 1}
            />
          ))}
          
          {/* Point labels */}
          {showPointLabels && chartData.map((d, i) => (
            <text
              key={i}
              x={getX(d)}
              y={getY(d) - (isMobile ? 10 : 15)}
              textAnchor="middle"
              fontSize={isMobile ? 10 : 12}
              fill="#374151"
              fontWeight="bold"
              fillOpacity={hoveredLabel && hoveredLabel !== mainLineLabel ? 0.2 : 1}
            >
              {d.y}
            </text>
          ))}
          
          {/* Axes */}
          <AxisBottom
            top={yMax}
            scale={xScale}
            tickStroke="#6b7280"
            stroke="#6b7280"
            tickValues={
              xScale.domain().length > 15 
                ? xScale.domain().filter((_, i) => i % Math.ceil(xScale.domain().length / 10) === 0) 
                : undefined
            }
            tickLabelProps={() => ({
              fill: '#6b7280',
              fontSize: isMobile ? 10 : 12,
              textAnchor: 'middle',
            })}
            label={xLabel}
            labelProps={{
              fill: '#374151',
              textAnchor: 'middle',
              fontSize: isMobile ? 12 : 14,
              fontWeight: 'bold'
            }}
          />
          <AxisLeft
            scale={yScale}
            tickStroke="#6b7280"
            stroke="#6b7280"
            tickLabelProps={() => ({
              fill: '#6b7280',
              fontSize: isMobile ? 10 : 12,
              textAnchor: 'end',
              dx: '-0.25em',
              dy: '0.25em'
            })}
            label={yLabel}
            labelProps={{
              fill: '#374151',
              textAnchor: 'middle',
              fontSize: isMobile ? 12 : 14,
              fontWeight: 'bold'
            }}
          />
        </Group>
        </svg>
      </div>
      
      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-4 mt-8 px-4">
          {chartData.length > 0 && (
            <div 
              className={`flex items-center gap-2 transition-all duration-300 ${hoveredLabel && hoveredLabel !== mainLineLabel ? 'opacity-20 grayscale scale-95' : 'opacity-100 scale-100'}`}
              onMouseEnter={() => handleMouseEnter(mainLineLabel)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="w-4 h-0.5" style={{ backgroundColor: lineColor }}></div>
              <span className="text-sm font-medium text-gray-700">{mainLineLabel}</span>
            </div>
          )}
          {showAverage && (
            <div 
              className={`flex items-center gap-2 transition-all duration-300 ${hoveredLabel && hoveredLabel !== averageLineLabel ? 'opacity-20 grayscale scale-95' : 'opacity-100 scale-100'}`}
              onMouseEnter={() => handleMouseEnter(averageLineLabel)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="w-4 h-0.5 border-dashed border-t-2" style={{ borderColor: averageColor }}></div>
              <span className="text-sm font-medium text-gray-700">{averageLineLabel}</span>
            </div>
          )}
          {additionalLines.map((line, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-2 cursor-pointer transition-all duration-300 ${hoveredLabel && hoveredLabel !== line.label ? 'opacity-20 grayscale scale-95' : 'opacity-100 scale-100'}`}
              onMouseEnter={() => handleMouseEnter(line.label)}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className="w-4 h-0.5 rounded-full" 
                style={{ 
                  backgroundColor: line.color,
                  borderTop: line.strokeDasharray ? `2px dashed ${line.color}` : 'none'
                }}
              ></div>
              <span className={`text-xs font-semibold ${hoveredLabel === line.label ? 'text-gray-900' : 'text-gray-600'}`}>{line.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
