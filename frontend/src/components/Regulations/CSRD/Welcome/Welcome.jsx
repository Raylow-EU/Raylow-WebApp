import {
  Calendar,
  Shield,
  Target,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Building2,
  FileText,
  Award,
  Zap,
  TrendingUp
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

const WelcomeCSRD = () => {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const keyFeatures = [
    {
      icon: Users,
      title: "Who Must Report",
      subtitle: "Phased Implementation",
      description: "Large public-interest entities first, followed by other large companies and listed SMEs. Non-EU companies with significant EU activity may also be in scope.",
      timeline: "Starting FY2024",
      status: "active"
    },
    {
      icon: CheckCircle,
      title: "Key Requirements",
      subtitle: "Four Core Pillars",
      items: [
        "Double materiality assessment",
        "ESRS-aligned disclosures",
        "Limited assurance requirements",
        "Digital tagging and filing"
      ],
      status: "requirements"
    },
    {
      icon: Clock,
      title: "Implementation Timeline",
      subtitle: "Multi-Year Rollout",
      description: "Reporting phases over several years based on company type and size, with early cohorts starting FY2024 reporting.",
      progress: 35,
      status: "timeline"
    },
    {
      icon: Zap,
      title: "How Raylow Helps",
      subtitle: "End-to-End Solution",
      description: "We streamline materiality assessments, map ESRS requirements, set up data collection, and prepare assured, digitally tagged reports.",
      status: "solution"
    }
  ];

  const quickStats = [
    { label: "EU Companies Affected", value: "50K+", change: "+15%" },
    { label: "ESRS Standards", value: "12", change: "Complete" },
    { label: "Implementation Years", value: "3", change: "2024-2026" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50/50 to-emerald-50/30 p-6" style={{ margin: '-2rem', width: 'calc(100% + 4rem)', height: '100vh' }}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Hero Section with Modern Design */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white via-gray-50 to-emerald-50 rounded-2xl border border-gray-200"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/20 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-100/30 rounded-full blur-2xl translate-y-32 -translate-x-32"></div>

          <div className="relative px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="h-14 w-14 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">CSRD</h1>
                  <p className="text-gray-600 text-lg">Corporate Sustainability Reporting Directive</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200 shadow-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700 text-sm font-medium">{formattedDate}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {quickStats.map((stat, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-600 text-sm mb-1">{stat.label}</div>
                  <div className="text-emerald-600 text-xs font-medium">{stat.change}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 border border-gray-200 shadow-sm">
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                The CSRD expands who must report ESG information, mandates European Sustainability
                Reporting Standards (ESRS), and brings assurance and digital tagging to create
                comparable, decision-useful sustainability information.
              </p>
              <div className="flex items-center space-x-4">
                <Link to="/dashboard/csrd/dashboard">
                  <Button className="bg-emerald-600 text-white hover:bg-emerald-700 font-medium px-6">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
                  Effective 2024
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Feature Cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {keyFeatures.map((feature, index) => (
            <Card key={index} className={`group hover:shadow-lg transition-all duration-300 border border-gray-200 ${
              feature.status === 'solution' ? 'bg-emerald-50 border-emerald-200 shadow-md' : 'bg-white hover:border-gray-300'
            }`}>
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      feature.status === 'solution' ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}>
                      <feature.icon className={`h-5 w-5 ${
                        feature.status === 'solution' ? 'text-emerald-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">{feature.title}</CardTitle>
                      <CardDescription className="text-sm font-medium text-emerald-600">
                        {feature.subtitle}
                      </CardDescription>
                    </div>
                  </div>
                  {feature.timeline && (
                    <Badge variant="outline" className="text-emerald-700 border-emerald-300">
                      {feature.timeline}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {feature.items ? (
                  <div className="space-y-2">
                    {feature.items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                )}

                {feature.progress && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Implementation Progress</span>
                      <span className="text-sm text-gray-500">{feature.progress}%</span>
                    </div>
                    <Progress value={feature.progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action Section */}
        <Card className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-green-600 border-0 text-white shadow-xl">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-6 w-6" />
                  <h3 className="text-xl font-semibold">Ready to Get Started?</h3>
                </div>
                <p className="text-emerald-50 text-lg max-w-2xl">
                  Begin your CSRD compliance journey with our comprehensive assessment and reporting tools.
                </p>
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard/csrd/flashcards">
                    <Button variant="secondary" className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-lg">
                      Start Assessment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/dashboard/csrd/dashboard">
                    <Button variant="ghost" className="text-white border-white/30 hover:bg-white/10">
                      View Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="h-24 w-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Award className="h-12 w-12 text-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default WelcomeCSRD;


