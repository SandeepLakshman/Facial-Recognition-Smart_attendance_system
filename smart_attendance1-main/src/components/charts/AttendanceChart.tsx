import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AttendanceChartProps {
  weeklyData: { name: string; attendance: number }[];
  monthlyData: { name: string; present: number; absent: number }[];
  subjectData: { name: string; value: number; color: string }[];
}

export function AttendanceChart({ weeklyData, monthlyData, subjectData }: AttendanceChartProps) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Trend - Using AreaChart for better visuals */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Weekly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData.length > 0 ? weeklyData : [{ name: 'No Data', attendance: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="attendance" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject-wise Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={subjectData.length > 0 ? subjectData : [{ name: 'No Data', value: 100, color: '#333' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(subjectData.length > 0 ? subjectData : [{ name: 'No Data', value: 100, color: '#333' }]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {subjectData.map((entry, index) => (
                <div key={index} className="flex items-center text-xs">
                  <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: entry.color }}></span>
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}