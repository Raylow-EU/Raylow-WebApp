import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { BsCalendar, BsShield } from "react-icons/bs";
import {
  FaChartLine,
  FaIndustry,
  FaEye,
  FaBullseye,
} from "react-icons/fa";
import {
  HiTrendingUp,
  HiTrendingDown,
} from "react-icons/hi";
import { MdInsights } from "react-icons/md";

// shadcn/ui components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
        {/* Enhanced Header */}
        <div className="relative">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-emerald-400/5 to-emerald-300/5 rounded-2xl"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/20 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>

          <div className="relative bg-white/70 backdrop-blur-sm border border-white/50 rounded-2xl p-8 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-600 uppercase tracking-wider">
                    CSRD Dashboard
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                  Hello, {getFirstName()} 👋
                </h1>
                <p className="text-lg text-gray-600 font-medium">
                  Welcome back to your compliance center
                </p>
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
                    <span>Last updated: Today</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                    <span>
                      Next deadline: {dashboardData?.stats.nextDeadline}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Date Card */}
                <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <BsCalendar className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Today
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Profile Section */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">
                      Compliance Score
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${dashboardData?.stats.complianceScore}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-lg font-bold text-emerald-600">
                        {dashboardData?.stats.complianceScore}%
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <Avatar className="h-14 w-14 ring-4 ring-emerald-100 ring-offset-2 ring-offset-white shadow-lg">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-bold text-lg">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Emissions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.stats.totalEmissions.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">tCO₂e</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                <FaIndustry className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <HiTrendingDown className="h-4 w-4 text-emerald-600 mr-1" />
              <span className="text-emerald-600 font-medium">
                {dashboardData?.stats.reductionTarget}% reduction
              </span>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Compliance Score
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.stats.complianceScore}%
                </p>
                <Progress
                  value={dashboardData?.stats.complianceScore}
                  className="w-full h-2 mt-2"
                />
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                <BsShield className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <HiTrendingUp className="h-4 w-4 text-emerald-600 mr-1" />
              <span className="text-emerald-600 font-medium">
                +5.2% this quarter
              </span>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  ESRS Standards
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.stats.esrsStandards.completed}/
                  {dashboardData?.stats.esrsStandards.total}
                </p>
                <p className="text-sm text-gray-500">Standards covered</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                <MdInsights className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm font-medium text-emerald-600">
                {Math.round(
                  (dashboardData?.stats.esrsStandards.completed /
                    dashboardData?.stats.esrsStandards.total) *
                    100
                )}
                % Complete
              </span>
            </div>
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm border border-gray-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.stats.riskScore}
                </p>
                <p className="text-sm text-gray-500">Low risk</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center shadow-sm">
                <FaBullseye className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <HiTrendingDown className="h-4 w-4 text-emerald-600 mr-1" />
              <span className="text-emerald-600 font-medium">
                12% below target
              </span>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-white border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Emissions by Scope
            </h3>
            <div className="space-y-3">
              {dashboardData?.emissionsByScope?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        index === 0
                          ? "bg-emerald-500"
                          : index === 1
                          ? "bg-emerald-400"
                          : "bg-emerald-300"
                      }`}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">
                      {item.value.toLocaleString()} tCO₂e
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Monthly Progress
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">This Month</span>
                <span className="font-semibold text-emerald-600">130 tCO₂e</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Target</span>
                <span className="font-semibold text-gray-900">140 tCO₂e</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Reduction</span>
                <span className="font-semibold text-emerald-600">-7.1%</span>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-500">Progress to target</span>
                  <span className="text-emerald-600 font-medium">107%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full w-full"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/dashboard/csrd/flashcards">
            <Card className="p-6 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <MdInsights className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Start Assessment
                  </h3>
                  <p className="text-sm text-gray-600">Begin CSRD compliance</p>
                </div>
              </div>
            </Card>
          </Link>

          <Card className="p-6 bg-white border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                <FaEye className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Materiality Assessment
                </h3>
                <p className="text-sm text-gray-600">
                  Double materiality analysis
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-emerald-500 rounded-lg flex items-center justify-center">
                <FaChartLine className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Generate Report</h3>
                <p className="text-sm text-gray-600">ESRS-aligned report</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>ESRS Standards Progress</CardTitle>
            <CardDescription>
              Track your compliance across environmental standards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData?.esrsBreakdown?.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                      {item.standard}
                    </span>
                    <span className="font-medium text-gray-900">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {item.progress}%
                  </span>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Interactive Chart Test */}
        <Card className="py-4 sm:py-0 border-gray-200/50">
          <CardHeader className="flex flex-col items-stretch border-b border-gray-200 !p-0 sm:flex-row">
            <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
              <CardTitle className="text-gray-700 font-medium">Emissions Tracking</CardTitle>
              <CardDescription className="text-gray-500">Monthly emissions data by scope for the last 3 months</CardDescription>
            </div>
            <div className="flex">
              {["desktop", "mobile"].map((key) => {
                const chart = key;
                return (
                  <button
                    key={chart}
                    data-active={activeChart === chart}
                    className="data-[active=true]:bg-gray-50/50 flex flex-1 flex-col justify-center gap-1 border-t border-gray-200 px-6 py-4 text-left even:border-l even:border-gray-200 sm:border-t-0 sm:border-l sm:border-gray-200 sm:px-8 sm:py-6"
                    onClick={() => setActiveChart(chart)}
                  >
                    <span className="text-gray-500 text-xs font-medium">{testChartConfig[chart].label}</span>
                    <span className="text-lg leading-none font-bold sm:text-3xl text-gray-900">
                      {total[key].toLocaleString()}<span className="text-sm font-normal text-gray-500 ml-1">tCO₂e</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </CardHeader>
          <CardContent className="px-2 sm:p-6">
            <div className="aspect-auto h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
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
                    cursor={{ strokeDasharray: "3 3" }}
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    formatter={(value, name) => [value, name === activeChart ? (activeChart === 'desktop' ? 'Desktop' : 'Mobile') : name]}
                  />
                  <Line
                    dataKey={activeChart}
                    type="monotone"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
