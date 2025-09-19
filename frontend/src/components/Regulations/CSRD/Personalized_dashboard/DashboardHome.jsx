import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Factory,
  Shield,
  Target,
  BarChart3,
  Eye,
  FileText,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

// shadcn/ui components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";


const DashboardHome = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeChart, setActiveChart] = useState("desktop");

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Chart data for interactive chart
  const chartData = [
    { date: "2024-04-01", desktop: 222, mobile: 150 },
    { date: "2024-04-02", desktop: 97, mobile: 180 },
    { date: "2024-04-03", desktop: 167, mobile: 120 },
    { date: "2024-04-04", desktop: 242, mobile: 260 },
    { date: "2024-04-05", desktop: 373, mobile: 290 },
    { date: "2024-04-06", desktop: 301, mobile: 340 },
    { date: "2024-04-07", desktop: 245, mobile: 180 },
    { date: "2024-04-08", desktop: 409, mobile: 320 },
    { date: "2024-04-09", desktop: 59, mobile: 110 },
    { date: "2024-04-10", desktop: 261, mobile: 190 },
    { date: "2024-04-11", desktop: 327, mobile: 350 },
    { date: "2024-04-12", desktop: 292, mobile: 210 },
    { date: "2024-04-13", desktop: 342, mobile: 380 },
    { date: "2024-04-14", desktop: 137, mobile: 220 },
    { date: "2024-04-15", desktop: 120, mobile: 170 },
    { date: "2024-04-16", desktop: 138, mobile: 190 },
    { date: "2024-04-17", desktop: 446, mobile: 360 },
    { date: "2024-04-18", desktop: 364, mobile: 410 },
    { date: "2024-04-19", desktop: 243, mobile: 180 },
    { date: "2024-04-20", desktop: 89, mobile: 150 },
    { date: "2024-04-21", desktop: 137, mobile: 200 },
    { date: "2024-04-22", desktop: 224, mobile: 170 },
    { date: "2024-04-23", desktop: 138, mobile: 230 },
    { date: "2024-04-24", desktop: 387, mobile: 290 },
    { date: "2024-04-25", desktop: 215, mobile: 250 },
    { date: "2024-04-26", desktop: 75, mobile: 130 },
    { date: "2024-04-27", desktop: 383, mobile: 420 },
    { date: "2024-04-28", desktop: 122, mobile: 180 },
    { date: "2024-04-29", desktop: 315, mobile: 240 },
    { date: "2024-04-30", desktop: 454, mobile: 380 },
    { date: "2024-05-01", desktop: 165, mobile: 220 },
    { date: "2024-05-02", desktop: 293, mobile: 310 },
    { date: "2024-05-03", desktop: 247, mobile: 190 },
    { date: "2024-05-04", desktop: 385, mobile: 420 },
    { date: "2024-05-05", desktop: 481, mobile: 390 },
    { date: "2024-05-06", desktop: 498, mobile: 520 },
    { date: "2024-05-07", desktop: 388, mobile: 300 },
    { date: "2024-05-08", desktop: 149, mobile: 210 },
    { date: "2024-05-09", desktop: 227, mobile: 180 },
    { date: "2024-05-10", desktop: 293, mobile: 330 },
    { date: "2024-05-11", desktop: 335, mobile: 270 },
    { date: "2024-05-12", desktop: 197, mobile: 240 },
    { date: "2024-05-13", desktop: 197, mobile: 160 },
    { date: "2024-05-14", desktop: 448, mobile: 490 },
    { date: "2024-05-15", desktop: 473, mobile: 380 },
    { date: "2024-05-16", desktop: 338, mobile: 400 },
    { date: "2024-05-17", desktop: 499, mobile: 420 },
    { date: "2024-05-18", desktop: 315, mobile: 350 },
    { date: "2024-05-19", desktop: 235, mobile: 180 },
    { date: "2024-05-20", desktop: 177, mobile: 230 },
    { date: "2024-05-21", desktop: 82, mobile: 140 },
    { date: "2024-05-22", desktop: 81, mobile: 120 },
    { date: "2024-05-23", desktop: 252, mobile: 290 },
    { date: "2024-05-24", desktop: 294, mobile: 220 },
    { date: "2024-05-25", desktop: 201, mobile: 250 },
    { date: "2024-05-26", desktop: 213, mobile: 170 },
    { date: "2024-05-27", desktop: 420, mobile: 460 },
    { date: "2024-05-28", desktop: 233, mobile: 190 },
    { date: "2024-05-29", desktop: 78, mobile: 130 },
    { date: "2024-05-30", desktop: 340, mobile: 280 },
    { date: "2024-05-31", desktop: 178, mobile: 230 },
    { date: "2024-06-01", desktop: 178, mobile: 200 },
    { date: "2024-06-02", desktop: 470, mobile: 410 },
    { date: "2024-06-03", desktop: 103, mobile: 160 },
    { date: "2024-06-04", desktop: 439, mobile: 380 },
    { date: "2024-06-05", desktop: 88, mobile: 140 },
    { date: "2024-06-06", desktop: 294, mobile: 250 },
    { date: "2024-06-07", desktop: 323, mobile: 370 },
    { date: "2024-06-08", desktop: 385, mobile: 320 },
    { date: "2024-06-09", desktop: 438, mobile: 480 },
    { date: "2024-06-10", desktop: 155, mobile: 200 },
    { date: "2024-06-11", desktop: 92, mobile: 150 },
    { date: "2024-06-12", desktop: 492, mobile: 420 },
    { date: "2024-06-13", desktop: 81, mobile: 130 },
    { date: "2024-06-14", desktop: 426, mobile: 380 },
    { date: "2024-06-15", desktop: 307, mobile: 350 },
    { date: "2024-06-16", desktop: 371, mobile: 310 },
    { date: "2024-06-17", desktop: 475, mobile: 520 },
    { date: "2024-06-18", desktop: 107, mobile: 170 },
    { date: "2024-06-19", desktop: 341, mobile: 290 },
    { date: "2024-06-20", desktop: 408, mobile: 450 },
    { date: "2024-06-21", desktop: 169, mobile: 210 },
    { date: "2024-06-22", desktop: 317, mobile: 270 },
    { date: "2024-06-23", desktop: 480, mobile: 530 },
    { date: "2024-06-24", desktop: 132, mobile: 180 },
    { date: "2024-06-25", desktop: 141, mobile: 190 },
    { date: "2024-06-26", desktop: 434, mobile: 380 },
    { date: "2024-06-27", desktop: 448, mobile: 490 },
    { date: "2024-06-28", desktop: 149, mobile: 200 },
    { date: "2024-06-29", desktop: 103, mobile: 160 },
    { date: "2024-06-30", desktop: 446, mobile: 400 },
  ];

  const testChartConfig = {
    views: {
      label: "Emissions",
    },
    desktop: {
      label: "Scope 1",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Scope 2",
      color: "hsl(var(--chart-2))",
    },
  };

  const total = {
    desktop: chartData.reduce((acc, curr) => acc + curr.desktop, 0),
    mobile: chartData.reduce((acc, curr) => acc + curr.mobile, 0),
  };

  useEffect(() => {
    // Enhanced demo data with more sophisticated charts
    const demo = {
      stats: {
        totalEmissions: 2403,
        complianceScore: 87,
        reductionTarget: 12.3,
        esrsStandards: { completed: 8, total: 12 },
        carbonIntensity: 15.7,
        riskScore: 23,
        nextDeadline: "March 2025",
      },
      emissionsByScope: [
        { name: "Scope 1", value: 192, percentage: 8, fill: "var(--chart-1)" },
        { name: "Scope 2", value: 360, percentage: 15, fill: "var(--chart-2)" },
        {
          name: "Scope 3",
          value: 1849,
          percentage: 77,
          fill: "var(--chart-3)",
        },
      ],
      monthlyEmissions: [
        { month: "Jan", emissions: 220, target: 200, date: "2024-01-01" },
        { month: "Feb", emissions: 180, target: 190, date: "2024-02-01" },
        { month: "Mar", emissions: 240, target: 210, date: "2024-03-01" },
        { month: "Apr", emissions: 200, target: 200, date: "2024-04-01" },
        { month: "May", emissions: 210, target: 185, date: "2024-05-01" },
        { month: "Jun", emissions: 170, target: 175, date: "2024-06-01" },
        { month: "Jul", emissions: 190, target: 165, date: "2024-07-01" },
        { month: "Aug", emissions: 150, target: 160, date: "2024-08-01" },
        { month: "Sep", emissions: 165, target: 155, date: "2024-09-01" },
        { month: "Oct", emissions: 140, target: 150, date: "2024-10-01" },
        { month: "Nov", emissions: 155, target: 145, date: "2024-11-01" },
        { month: "Dec", emissions: 130, target: 140, date: "2024-12-01" },
      ],
      complianceProgress: [
        {
          category: "Environmental",
          progress: 88,
          color: "var(--chart-1)",
          standards: 4,
          total: 5,
        },
        {
          category: "Social",
          progress: 76,
          color: "var(--chart-2)",
          standards: 3,
          total: 4,
        },
        {
          category: "Governance",
          progress: 92,
          color: "var(--chart-3)",
          standards: 3,
          total: 3,
        },
      ],
      esrsBreakdown: [
        {
          standard: "E1",
          name: "Climate Change",
          progress: 95,
          color: "var(--chart-1)",
        },
        {
          standard: "E2",
          name: "Pollution",
          progress: 82,
          color: "var(--chart-2)",
        },
        {
          standard: "E3",
          name: "Water Resources",
          progress: 78,
          color: "var(--chart-3)",
        },
        {
          standard: "E4",
          name: "Biodiversity",
          progress: 65,
          color: "var(--chart-4)",
        },
        {
          standard: "E5",
          name: "Circular Economy",
          progress: 70,
          color: "var(--chart-5)",
        },
      ],
      riskMatrix: [
        {
          category: "Financial Risk",
          current: 15,
          target: 10,
          fill: "var(--chart-1)",
        },
        {
          category: "Operational Risk",
          current: 25,
          target: 18,
          fill: "var(--chart-2)",
        },
        {
          category: "Regulatory Risk",
          current: 30,
          target: 20,
          fill: "var(--chart-3)",
        },
        {
          category: "Reputational Risk",
          current: 18,
          target: 12,
          fill: "var(--chart-4)",
        },
      ],
    };
    setDashboardData(demo);
    setLoading(false);
  }, []);

  const getFirstName = () => {
    const displayName = user?.displayName || user?.fullName;
    if (!displayName) return "User";
    return displayName.split(" ")[0];
  };

  const getInitials = () => {
    const displayName = user?.displayName || user?.fullName || "U";
    return displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Strategic Header with CSRD Green Theme */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="h-6 w-6 text-emerald-600" />
                  <h1 className="text-2xl font-semibold text-gray-900">CSRD Compliance Center</h1>
                </div>
                <p className="text-gray-600">Corporate Sustainability Reporting Directive</p>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Last Sync</p>
                  <p className="text-sm font-medium text-gray-900">{formattedDate}</p>
                </div>

                <div className="h-8 w-px bg-gray-200"></div>

                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{getFirstName()}</p>
                    <p className="text-xs text-gray-500">Compliance Manager</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Actions Bar */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="text-sm font-medium text-emerald-900">Next Priority Action</p>
                    <p className="text-xs text-emerald-700">Complete materiality assessment by {dashboardData?.stats.nextDeadline}</p>
                  </div>
                </div>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Start Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators with Context */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Performance Overview</h2>
            <p className="text-sm text-gray-600">Track your progress against CSRD requirements and industry benchmarks</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Emissions - Red for high impact */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Carbon Emissions</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <TrendingDown className="h-3 w-3" />
                    <span>-{dashboardData?.stats.reductionTarget}%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {dashboardData?.stats.totalEmissions.toLocaleString()}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-600 mb-1">
                      <TrendingDown className="h-3 w-3 text-green-600" />
                      <span>12% below industry avg</span>
                    </div>
                    <p className="text-xs text-gray-500">tCO₂e annually</p>
                  </div>
                  <div className="ml-4">
                    <Factory className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance - Emerald as primary theme */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Compliance Score</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                    dashboardData?.stats.complianceScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
                    dashboardData?.stats.complianceScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    <span>+5.2%</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {dashboardData?.stats.complianceScore}%
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-600 mb-1">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      <span>Above target (80%)</span>
                    </div>
                    <p className="text-xs text-gray-500">CSRD readiness</p>
                  </div>
                  <div className="ml-4">
                    <Shield className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Standards - Amber for progress */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">ESRS Implementation</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                    <BarChart3 className="h-3 w-3" />
                    <span>
                      {Math.round(
                        (dashboardData?.stats.esrsStandards.completed /
                          dashboardData?.stats.esrsStandards.total) *
                          100
                      )}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {dashboardData?.stats.esrsStandards.completed} of {dashboardData?.stats.esrsStandards.total}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-600 mb-1">
                      <TrendingUp className="h-3 w-3 text-emerald-600" />
                      <span>4 standards remaining</span>
                    </div>
                    <p className="text-xs text-gray-500">Standards complete</p>
                  </div>
                  <div className="ml-4">
                    <BarChart3 className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Risk - Red/Green semantic meaning */}
            <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Risk Assessment</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <TrendingDown className="h-3 w-3" />
                    <span>Low</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      {dashboardData?.stats.riskScore}/100
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-600 mb-1">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      <span>Well below threshold</span>
                    </div>
                    <p className="text-xs text-gray-500">Risk score</p>
                  </div>
                  <div className="ml-4">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>


        {/* Strategic Emissions Analysis */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Emissions Trend Analysis</h2>
              <p className="text-sm text-gray-600">Track your carbon footprint reduction progress vs. science-based targets</p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>On track for 2030 target (-50%)</span>
            </div>
          </div>

          <Card className="border-gray-200">
            <CardHeader className="flex flex-col items-stretch border-b border-gray-200 !p-0 sm:flex-row">
              <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-4">
                <CardTitle className="text-gray-900 font-semibold">Monthly Carbon Footprint</CardTitle>
                <CardDescription className="text-gray-600">Compare Scope 1 (direct) vs Scope 2 (energy) emissions</CardDescription>
              </div>
              <div className="flex">
                {["desktop", "mobile"].map((key) => {
                  const chart = key;
                  return (
                    <button
                      key={chart}
                      data-active={activeChart === chart}
                      className="data-[active=true]:bg-blue-50 data-[active=true]:border-blue-200 flex flex-1 flex-col justify-center gap-1 border-t border-gray-200 px-6 py-4 text-left even:border-l even:border-gray-200 sm:border-t-0 sm:border-l sm:border-gray-200 sm:px-8 sm:py-6 hover:bg-gray-50 transition-colors"
                      onClick={() => setActiveChart(chart)}
                    >
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">{testChartConfig[chart].label}</span>
                      <span className="text-lg leading-none font-bold sm:text-2xl text-gray-900">
                        {total[key].toLocaleString()}<span className="text-sm font-normal text-gray-500 ml-1">tCO₂e</span>
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {activeChart === chart ? 'Current view' : 'Click to view'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="aspect-auto h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tick={{ fontSize: 12, fill: '#6b7280' }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        });
                      }}
                    />
                    <YAxis hide />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3", stroke: "#10b981" }}
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        });
                      }}
                      formatter={(value, name) => [
                        `${value} tCO₂e`,
                        name === activeChart ? (activeChart === 'desktop' ? 'Scope 1 Emissions' : 'Scope 2 Emissions') : name
                      ]}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line
                      dataKey={activeChart}
                      type="monotone"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps - Integrated Action Flow */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Recommended Next Steps</h2>
            <p className="text-sm text-gray-600">Complete these actions to improve your compliance readiness</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/dashboard/csrd/flashcards" className="group">
              <Card className="p-6 border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 transition-all duration-200 cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 bg-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-700 transition-colors">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">Start Assessment</h3>
                      <span className="bg-emerald-600 text-white text-xs px-2 py-1 rounded-full font-medium">Priority</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Begin your CSRD compliance evaluation</p>
                    <p className="text-xs text-emerald-700 font-medium">Estimated: 15 minutes</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Card className="p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-amber-600 rounded-lg flex items-center justify-center group-hover:bg-amber-700 transition-colors">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">Materiality Analysis</h3>
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">Next</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Identify material sustainability topics</p>
                  <p className="text-xs text-amber-700 font-medium">Estimated: 45 minutes</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-700 transition-colors">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">Generate Report</h3>
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">Later</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Create ESRS-compliant sustainability report</p>
                  <p className="text-xs text-emerald-700 font-medium">Available after assessment</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardHome;
