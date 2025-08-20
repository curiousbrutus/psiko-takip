'use client';

import { TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  Tooltip,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { format } from 'date-fns';

const chartConfig = {
  score: {
    label: 'Skor',
    color: 'hsl(var(--primary))',
  },
};

const getClinicalThresholds = (testName: string) => {
  if (testName === 'GAD-7') {
    return [
      {
        y: 5,
        label: 'Hafif Anksiyete',
        stroke: 'orange',
        strokeDasharray: '3 3',
      },
      { y: 10, label: 'Orta Anksiyete', stroke: 'red', strokeDasharray: '3 3' },
      {
        y: 15,
        label: 'Şiddetli Anksiyete',
        stroke: 'darkred',
        strokeDasharray: '3 3',
      },
    ];
  }
  if (testName === 'PHQ-9') {
    return [
      { y: 5, label: 'Hafif', stroke: '#FBBF24' },
      { y: 10, label: 'Orta', stroke: '#F59E0B' },
      { y: 15, label: 'Orta-Şiddetli', stroke: '#D97706' },
      { y: 20, label: 'Şiddetli', stroke: '#B45309' },
    ];
  }
  return [];
};

export default function ProgressChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  const testName = data[0]?.testName || 'Bilinmeyen Test';
  const thresholds = getClinicalThresholds(testName);
  const maxScore = testName === 'GAD-7' ? 21 : 27; // Max score for GAD-7 is 21, PHQ-9 is 27

  const chartData = data.map(item => ({
    date: format(item.completedAt, 'dd MMM'),
    score: item.score,
  }));

  const allianceData = data
    .filter(item => item.allianceScore !== undefined)
    .map(item => ({
      date: format(item.completedAt, 'dd MMM'),
      score: item.allianceScore,
    }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>{testName} İlerleme Grafiği</CardTitle>
          <CardDescription>
            Danışanın {testName} puanlarının zaman içindeki değişimi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={value => value}
              />
              <YAxis
                domain={[0, maxScore]}
                allowDataOverflow={true}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltipContent indicator="dot" />} />
              {thresholds.map(line => (
                <ReferenceLine
                  key={line.label}
                  y={line.y}
                  label={{
                    value: line.label,
                    position: 'insideTopRight',
                    fill: line.stroke,
                    fontSize: 10,
                  }}
                  stroke={line.stroke}
                  strokeDasharray="3 3"
                />
              ))}
              <Area
                dataKey="score"
                type="natural"
                fill="var(--color-score)"
                fillOpacity={0.4}
                stroke="var(--color-score)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Terapötik İttifak Grafiği</CardTitle>
          <CardDescription>
            Danışanın seanslar hakkındaki geri bildirimleri (Ortalama Puan).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart accessibilityLayer data={allianceData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={value => value}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                allowDataOverflow={true}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltipContent indicator="dot" />} />
              <Area
                dataKey="score"
                type="natural"
                fill="var(--color-score)"
                fillOpacity={0.4}
                stroke="var(--color-score)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
