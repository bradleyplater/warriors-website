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
}

// Responsive chart dimensions
const getChartDimensions = (isMobile: boolean) => ({
  width: isMobile ? 350 : 600,
  height: isMobile ? 280 : 320,
  margin: isMobile 
    ? { top: 20, right: 20, bottom: 50, left: 65 }
    : { top: 25, right: 25, bottom: 60, left: 70 }
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
  showLegend = true
}: GenericLineChartProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { width, height, margin } = getChartDimensions(isMobile);
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

  // Create scales
  const xScale = scalePoint<string>({
    range: [0, xMax],
    domain: chartData.map(d => String(d.x)),
    padding: 0.2
  });

  const yScale = scaleLinear<number>({
    range: [yMax, 0],
    domain: [0, Math.max(...allDataPoints.map(d => d.y)) * 1.1],
    nice: true
  });

  // Accessor functions
  const getX = (d: typeof chartData[0]) => xScale(String(d.x)) ?? 0;
  const getY = (d: typeof chartData[0]) => yScale(d.y) ?? 0;

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="mx-auto">
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
          <LinePath<typeof chartData[0]>
            data={chartData}
            x={getX}
            y={getY}
            stroke={lineColor}
            strokeWidth={3}
            curve={curveMonotoneX}
          />
          
          {/* Average Line */}
          {showAverage && (
            <LinePath<typeof averageData[0]>
              data={averageData}
              x={getX}
              y={getY}
              stroke={averageColor}
              strokeWidth={2}
              strokeDasharray="5,5"
            />
          )}
          
          {/* Additional Lines */}
          {additionalLines.map((line, index) => (
            <LinePath<DataPoint>
              key={index}
              data={line.data}
              x={(d) => xScale(String(d.x)) ?? 0}
              y={(d) => yScale(d.y) ?? 0}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              strokeDasharray={line.strokeDasharray}
              curve={curveMonotoneX}
            />
          ))}
          
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
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5" style={{ backgroundColor: lineColor }}></div>
            <span className="text-sm text-gray-700">{mainLineLabel}</span>
          </div>
          {showAverage && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 border-dashed border-t-2" style={{ borderColor: averageColor }}></div>
              <span className="text-sm text-gray-700">{averageLineLabel}</span>
            </div>
          )}
          {additionalLines.map((line, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-0.5" 
                style={{ 
                  backgroundColor: line.color,
                  borderTop: line.strokeDasharray ? `2px dashed ${line.color}` : 'none'
                }}
              ></div>
              <span className="text-sm text-gray-700">{line.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
