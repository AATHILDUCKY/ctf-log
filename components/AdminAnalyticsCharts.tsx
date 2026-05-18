'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type MonthlyPoint = {
  month: string;
  writeups: number;
  views: number;
};

type CategoryPoint = {
  category: string;
  writeups: number;
};

type TopWriteup = {
  title: string;
  views: number;
};

export default function AdminAnalyticsCharts({
  monthlyData,
  categoryData,
  topWriteups,
}: {
  monthlyData: MonthlyPoint[];
  categoryData: CategoryPoint[];
  topWriteups: TopWriteup[];
}) {
  const pieColors = ['#8be9fd', '#50fa7b', '#ffb86c', '#bd93f9', '#ff79c6', '#f1fa8c', '#6272a4'];

  const safeTopWriteups = useMemo(
    () => topWriteups.map((item) => ({ ...item, title: item.title.length > 32 ? `${item.title.slice(0, 32)}...` : item.title })),
    [topWriteups],
  );

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <section className="rounded-lg border border-dracula-line/40 bg-dracula-selection/10 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-dracula-comment">Views Trend (6 Months)</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 8, right: 12, left: -10, bottom: 8 }}>
              <defs>
                <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8be9fd" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#8be9fd" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#44475a" />
              <XAxis dataKey="month" stroke="#6272a4" tickLine={false} axisLine={false} />
              <YAxis stroke="#6272a4" tickLine={false} axisLine={false} />
              <Tooltip cursor={{ stroke: '#8be9fd', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="views" stroke="#8be9fd" strokeWidth={2} fill="url(#viewsFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-dracula-line/40 bg-dracula-selection/10 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-dracula-comment">Writeups by Category</h3>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={categoryData} dataKey="writeups" nameKey="category" cx="50%" cy="50%" outerRadius={95} label>
                {categoryData.map((entry, index) => (
                  <Cell key={entry.category} fill={pieColors[index % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-lg border border-dracula-line/40 bg-dracula-selection/10 p-4 xl:col-span-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-dracula-comment">Top Viewed Writeups</h3>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={safeTopWriteups} margin={{ top: 8, right: 12, left: 8, bottom: 46 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#44475a" />
              <XAxis dataKey="title" angle={-12} textAnchor="end" interval={0} height={60} stroke="#6272a4" />
              <YAxis stroke="#6272a4" tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="views" fill="#50fa7b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
