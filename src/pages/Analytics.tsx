import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { 
  getAnalyticsTimeSeries,
  getTopPerformingPoems,
  getAnalyticsSummary,
  getReaderDemographics,
  exportAnalyticsToCSV,
  AnalyticsTimeSeriesData,
  PoemPerformanceData,
  AnalyticsSummary
} from "@/lib/analytics";
import { 
  TrendingUp, 
  Users, 
  Feather, 
  Activity, 
  Download, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Eye,
  MessageCircle
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

type TimePeriod = "week" | "month" | "all";

export default function Analytics() {
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("month");
  const [timeSeriesData, setTimeSeriesData] = useState<AnalyticsTimeSeriesData[]>([]);
  const [topPoems, setTopPoems] = useState<PoemPerformanceData[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const demographics = getReaderDemographics();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!user.isPoet) {
      navigate("/");
      return;
    }

    loadAnalyticsData();
  }, [user, navigate, timePeriod]);

  if (!user || !user.isPoet) return null;

  const loadAnalyticsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const days = timePeriod === "week" ? 7 : timePeriod === "month" ? 30 : 90;
      
      // Load all analytics data in parallel
      const [timeSeriesResult, topPoemsResult, summaryResult] = await Promise.all([
        getAnalyticsTimeSeries(user.id, days),
        getTopPerformingPoems(user.id, 5),
        getAnalyticsSummary(user.id, timePeriod)
      ]);
      
      setTimeSeriesData(timeSeriesResult);
      setTopPoems(topPoemsResult);
      setSummary(summaryResult);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Use summary data from database
  const totalClaps = summary?.totalClaps || 0;
  const totalFollowers = summary?.totalFollowers || 0;
  const totalPoems = summary?.totalPoems || 0;
  const avgEngagement = summary?.avgEngagement || 0;
  const clapsGrowth = summary?.clapsGrowth || 0;
  const followerGrowth = summary?.followerGrowth || 0;

  const handleExportData = () => {
    exportAnalyticsToCSV(timeSeriesData, timePeriod);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Track your poetry's performance and audience growth
            </p>
          </div>
          <Button onClick={handleExportData} variant="outline" size="lg">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Time Period Selector */}
        <div className="flex gap-2 mb-8">
          <Button
            variant={timePeriod === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimePeriod("week")}
          >
            Last 7 Days
          </Button>
          <Button
            variant={timePeriod === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimePeriod("month")}
          >
            Last 30 Days
          </Button>
          <Button
            variant={timePeriod === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimePeriod("all")}
          >
            Last 90 Days
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Claps</span>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-xl">👏</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{totalClaps.toLocaleString()}</p>
            <div className={`flex items-center gap-1 text-xs ${clapsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {clapsGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span>{Math.abs(clapsGrowth).toFixed(1)}% vs previous period</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Followers</span>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{totalFollowers.toLocaleString()}</p>
            <div className={`flex items-center gap-1 text-xs ${followerGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {followerGrowth >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span>+{followerGrowth} new followers</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Poems</span>
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Feather className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{totalPoems}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Published works</span>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Engagement Rate</span>
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{avgEngagement}%</p>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span>Above average</span>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Clap Trends Chart */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Clap Trends
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="claps" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Follower Growth Chart */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Follower Growth
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#9ca3af"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="followers" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Top Performing Poems & Demographics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Performing Poems */}
          <Card className="p-6 lg:col-span-2">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Feather className="w-5 h-5 text-primary" />
              Top Performing Poems
            </h3>
            <div className="space-y-4">
              {topPoems.map((poem, index) => (
                <div 
                  key={poem.id}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/poem/${poem.id}`)}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate mb-1">{poem.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <span>👏</span>
                        {poem.claps}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {poem.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {poem.views}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {poem.engagementRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">engagement</p>
                  </div>
                </div>
              ))}
              {topPoems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Feather className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No published poems yet</p>
                  <Button
                    variant="link"
                    onClick={() => navigate("/write")}
                    className="mt-2"
                  >
                    Write your first poem
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Reader Demographics */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Reader Demographics
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={demographics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {demographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {demographics.map((demo) => (
                <div key={demo.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: demo.color }}
                    />
                    <span>{demo.name}</span>
                  </div>
                  <span className="font-medium">{demo.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Engagement Metrics Table */}
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Weekly Performance Report
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Claps</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Followers</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Poems</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-muted-foreground">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {timeSeriesData.slice(-7).reverse().map((data, index) => (
                  <tr key={index} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-4 text-sm">{data.date}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium">{data.claps}</td>
                    <td className="py-3 px-4 text-sm text-right font-medium">
                      {data.followers}
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium">{data.poems}</td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        data.engagement >= 70 
                          ? 'bg-green-100 text-green-700' 
                          : data.engagement >= 50 
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {data.engagement}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Insights Section */}
        <Card className="p-6 mt-6 bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <ArrowUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium mb-1">Strong Engagement</p>
                <p className="text-sm text-muted-foreground">
                  Your average engagement rate of {avgEngagement}% is above the platform average of 45%
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium mb-1">Growing Audience</p>
                <p className="text-sm text-muted-foreground">
                  You gained {followerGrowth} new followers this {timePeriod}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
