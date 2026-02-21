import { supabase } from './supabase';

export interface AnalyticsTimeSeriesData {
  date: string;
  claps: number;
  followers: number;
  poems: number;
  engagement: number;
}

export interface PoemPerformanceData {
  id: string;
  title: string;
  claps: number;
  comments: number;
  views: number;
  engagementRate: number;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalClaps: number;
  totalFollowers: number;
  totalPoems: number;
  avgEngagement: number;
  clapsGrowth: number;
  followerGrowth: number;
}

/**
 * Get analytics time series data for a poet
 */
export async function getAnalyticsTimeSeries(
  poetId: string,
  days: number = 30
): Promise<AnalyticsTimeSeriesData[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get daily clap counts
  const { data: clapData } = await supabase
    .from('poem_claps')
    .select('created_at, clap_count, poem_id')
    .gte('created_at', startDate.toISOString())
    .eq('poem_id', poetId);

  // Get daily follower counts
  const { data: followerData } = await supabase
    .from('follows')
    .select('created_at')
    .eq('followed_id', poetId)
    .gte('created_at', startDate.toISOString());

  // Get poems created
  const { data: poemData } = await supabase
    .from('poems')
    .select('created_at')
    .eq('poet_id', poetId)
    .gte('created_at', startDate.toISOString());

  // Aggregate by date
  const timeSeriesMap = new Map<string, AnalyticsTimeSeriesData>();

  // Initialize all dates
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    timeSeriesMap.set(dateKey, {
      date: dateKey,
      claps: 0,
      followers: 0,
      poems: 0,
      engagement: 0
    });
  }

  // Aggregate claps
  clapData?.forEach(clap => {
    const dateKey = new Date(clap.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const data = timeSeriesMap.get(dateKey);
    if (data) {
      data.claps += clap.clap_count || 0;
    }
  });

  // Aggregate followers (cumulative)
  let cumulativeFollowers = 0;
  followerData?.forEach(follow => {
    const dateKey = new Date(follow.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const data = timeSeriesMap.get(dateKey);
    if (data) {
      cumulativeFollowers++;
      data.followers = cumulativeFollowers;
    }
  });

  // Aggregate poems
  poemData?.forEach(poem => {
    const dateKey = new Date(poem.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const data = timeSeriesMap.get(dateKey);
    if (data) {
      data.poems++;
    }
  });

  // Calculate engagement rate (claps per follower per day)
  timeSeriesMap.forEach(data => {
    if (data.followers > 0) {
      data.engagement = Math.min(100, Math.round((data.claps / data.followers) * 100));
    } else {
      data.engagement = data.claps > 0 ? 50 : 0;
    }
  });

  return Array.from(timeSeriesMap.values()).reverse();
}

/**
 * Get top performing poems for a poet
 */
export async function getTopPerformingPoems(
  poetId: string,
  limit: number = 5
): Promise<PoemPerformanceData[]> {
  // Get all poet's poems with clap counts
  const { data: poems } = await supabase
    .from('poems')
    .select(`
      id,
      title,
      claps_count,
      comments_count,
      created_at
    `)
    .eq('poet_id', poetId)
    .order('claps_count', { ascending: false })
    .limit(limit);

  if (!poems) return [];

  // Calculate performance metrics
  return poems.map(poem => {
    const views = poem.claps_count * (Math.random() * 5 + 5); // Estimated views (5-10x claps)
    const totalEngagement = poem.claps_count + poem.comments_count;
    const engagementRate = views > 0 ? Math.round((totalEngagement / views) * 100) : 0;

    return {
      id: poem.id,
      title: poem.title,
      claps: poem.claps_count || 0,
      comments: poem.comments_count || 0,
      views: Math.floor(views),
      engagementRate,
      createdAt: poem.created_at
    };
  });
}

/**
 * Get analytics summary for a poet
 */
export async function getAnalyticsSummary(
  poetId: string,
  timePeriod: 'week' | 'month' | 'all' = 'month'
): Promise<AnalyticsSummary> {
  const days = timePeriod === 'week' ? 7 : timePeriod === 'month' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get total claps for poet's poems
  const { data: poems } = await supabase
    .from('poems')
    .select('id, claps_count')
    .eq('poet_id', poetId);

  const totalClaps = poems?.reduce((sum, p) => sum + (p.claps_count || 0), 0) || 0;

  // Get follower count
  const { count: totalFollowers } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('followed_id', poetId);

  // Get total poems
  const { count: totalPoems } = await supabase
    .from('poems')
    .select('*', { count: 'exact', head: true })
    .eq('poet_id', poetId);

  // Get time series for growth calculations
  const timeSeries = await getAnalyticsTimeSeries(poetId, days);

  // Calculate growth
  const clapsGrowth = timeSeries.length > 1
    ? ((timeSeries[timeSeries.length - 1].claps - timeSeries[0].claps) / Math.max(1, timeSeries[0].claps)) * 100
    : 0;

  const followerGrowth = timeSeries.length > 1
    ? timeSeries[timeSeries.length - 1].followers - timeSeries[0].followers
    : 0;

  // Calculate average engagement
  const avgEngagement = timeSeries.length > 0
    ? Math.round(timeSeries.reduce((sum, d) => sum + d.engagement, 0) / timeSeries.length)
    : 0;

  return {
    totalClaps,
    totalFollowers: totalFollowers || 0,
    totalPoems: totalPoems || 0,
    avgEngagement,
    clapsGrowth,
    followerGrowth
  };
}

/**
 * Get reader demographics (mock data for now - would need more tracking)
 */
export function getReaderDemographics() {
  return [
    { name: "Poetry Enthusiasts", value: 45, color: "#8b5cf6" },
    { name: "Writers", value: 30, color: "#06b6d4" },
    { name: "Students", value: 15, color: "#10b981" },
    { name: "Casual Readers", value: 10, color: "#f59e0b" }
  ];
}

/**
 * Export analytics data as CSV
 */
export function exportAnalyticsToCSV(
  timeSeries: AnalyticsTimeSeriesData[],
  timePeriod: string
): void {
  const csvContent = [
    ["Date", "Claps", "Followers", "Poems", "Engagement Rate"],
    ...timeSeries.map(d => [d.date, d.claps, d.followers, d.poems, d.engagement])
  ].map(row => row.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `wordstack-analytics-${timePeriod}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
