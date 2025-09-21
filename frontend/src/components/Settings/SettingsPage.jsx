import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Separator } from "../ui/separator";
import { useSelector } from "react-redux";
import { User, Building2, Bell, Shield, CreditCard } from "lucide-react";

const SettingsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || user?.displayName?.split(' ')[0] || user?.fullName?.split(' ')[0] || "",
    lastName: user?.lastName || user?.displayName?.split(' ')[1] || user?.fullName?.split(' ')[1] || "",
    email: user?.email || "",
    companyName: user?.company?.name || user?.companyName || "",
    companySize: user?.companySize || "",
    industry: user?.industry || "",
    notifications: {
      emailUpdates: true,
      regulationAlerts: true,
      deadlineReminders: true,
      weeklyDigest: false,
    },
    privacy: {
      profileVisibility: true,
      dataSharing: false,
      analyticsOptIn: true,
    }
  });

  // Load settings from database and update form data when user data changes
  useEffect(() => {
    console.log("Full user object for company lookup:", user);
    const loadSettings = async () => {
      if (user?.uid) {
        try {
          // Fetch user settings and company data
          const [settingsResponse, onboardingResponse] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_BASE_URL}/settings?user_id=${user.uid}`),
            fetch(`${import.meta.env.VITE_API_BASE_URL}/onboarding/status/${user.uid}`)
          ]);

          // Parse responses
          const settings = settingsResponse.ok ? await settingsResponse.json() : null;
          const onboardingData = onboardingResponse.ok ? await onboardingResponse.json() : null;

          console.log("Fetched settings:", settings);
          console.log("Fetched onboarding data:", onboardingData);

          setFormData(prev => ({
            ...prev,
            firstName: settings?.first_name || user?.firstName || user?.displayName?.split(' ')[0] || user?.fullName?.split(' ')[0] || prev.firstName,
            lastName: settings?.last_name || user?.lastName || user?.displayName?.split(' ')[1] || user?.fullName?.split(' ')[1] || prev.lastName,
            email: user?.email || prev.email,
            companyName: onboardingData?.company?.name || user?.company?.name || user?.companyName || prev.companyName,
            companySize: settings?.company_size || user?.companySize || prev.companySize,
            industry: settings?.industry || user?.industry || prev.industry,
            notifications: {
              emailUpdates: settings?.email_updates ?? true,
              regulationAlerts: settings?.regulation_alerts ?? true,
              deadlineReminders: settings?.deadline_reminders ?? true,
              weeklyDigest: settings?.weekly_digest ?? false,
            },
            privacy: {
              profileVisibility: settings?.profile_visibility ?? true,
              dataSharing: settings?.data_sharing ?? false,
              analyticsOptIn: settings?.analytics_opt_in ?? true,
            }
          }));
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
    };

    loadSettings();
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    console.log("User object:", user);
    console.log("User ID:", user?.uid);
    if (!user?.uid) {
      console.log("No user ID found, cannot save settings");
      return;
    }

    console.log("Saving settings:", formData);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/settings?user_id=${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          company_size: formData.companySize,
          industry: formData.industry,
          email_updates: formData.notifications.emailUpdates,
          regulation_alerts: formData.notifications.regulationAlerts,
          deadline_reminders: formData.notifications.deadlineReminders,
          weekly_digest: formData.notifications.weeklyDigest,
          profile_visibility: formData.privacy.profileVisibility,
          data_sharing: formData.privacy.dataSharing,
          analytics_opt_in: formData.privacy.analyticsOptIn,
        }),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        console.log('Settings saved successfully:', updatedSettings);
        // TODO: Show success message
      } else {
        console.error('Failed to save settings:', response.statusText);
        // TODO: Show error message
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // TODO: Show error message
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ margin: '-2rem', width: 'calc(100% + 4rem)', height: '100vh' }}>
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-gray-900">Settings</h1>
          <p className="text-lg text-gray-600 mt-3">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-12">
          <TabsList className="grid w-full grid-cols-5 h-16 bg-white border border-gray-200 rounded-xl shadow-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2 text-base font-medium px-6 py-4 text-gray-600 hover:text-gray-900">
              <User className="w-5 h-5" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="company" className="flex items-center gap-2 text-base font-medium px-6 py-4 text-gray-600 hover:text-gray-900">
              <Building2 className="w-5 h-5" />
              Company
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2 text-base font-medium px-6 py-4 text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2 text-base font-medium px-6 py-4 text-gray-600 hover:text-gray-900">
              <Shield className="w-5 h-5" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2 text-base font-medium px-6 py-4 text-gray-600 hover:text-gray-900">
              <CreditCard className="w-5 h-5" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-8">
            <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="pb-8 border-b border-gray-100">
                <CardTitle className="text-2xl font-semibold text-gray-900">Profile Information</CardTitle>
                <CardDescription className="text-lg text-gray-600 mt-2">
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-900">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                      className="h-11 border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-900">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                      className="h-11 border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-900">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    readOnly
                    disabled
                    className="h-11 border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500">Email address cannot be changed</p>
                </div>
                <Separator className="my-8 border-gray-200" />
                <div className="flex justify-end">
                  <Button onClick={handleSave} className="px-8 py-2 h-11 bg-orange-500 hover:bg-orange-600 text-white">Save Changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="space-y-8">
            <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="pb-8 border-b border-gray-100">
                <CardTitle className="text-2xl font-semibold text-gray-900">Company Details</CardTitle>
                <CardDescription className="text-lg text-gray-600 mt-2">
                  Manage your company information and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <div className="space-y-3">
                  <Label htmlFor="companyName" className="text-sm font-medium text-gray-900">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="Enter company name"
                    className="h-11 border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                  />
              </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="companySize" className="text-sm font-medium text-gray-900">Company Size</Label>
                    <select
                      id="companySize"
                      value={formData.companySize}
                      onChange={(e) => handleInputChange("companySize", e.target.value)}
                      className="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
                  <div className="space-y-3">
                    <Label htmlFor="industry" className="text-sm font-medium text-gray-900">Industry</Label>
                    <Input
                      id="industry"
                      value={formData.industry}
                      onChange={(e) => handleInputChange("industry", e.target.value)}
                      placeholder="e.g., Technology, Healthcare"
                      className="h-11 border-gray-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
                    />
                </div>
              </div>
                <Separator className="my-8 border-gray-200" />
                <div className="flex justify-end">
                  <Button onClick={handleSave} className="px-8 py-2 h-11 bg-orange-500 hover:bg-orange-600 text-white">Save Changes</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="notifications" className="space-y-8">
            <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="pb-8 border-b border-gray-100">
                <CardTitle className="text-2xl font-semibold text-gray-900">Notification Preferences</CardTitle>
                <CardDescription className="text-lg text-gray-600 mt-2">
                  Choose how you want to be notified about updates and reminders
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
              <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-gray-900">Email Updates</Label>
                    <div className="text-sm text-gray-600">
                      Receive general updates and news about Raylow
                    </div>
                  </div>
                <Switch
                  checked={formData.notifications.emailUpdates}
                  onCheckedChange={(checked) =>
                    handleNestedChange("notifications", "emailUpdates", checked)
                  }
                  className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-gray-200 border border-gray-300 data-[state=checked]:border-orange-600 [&>span]:bg-white [&>span]:data-[state=checked]:bg-white [&>span]:data-[state=unchecked]:bg-gray-600"
                />
              </div>
                <Separator className="border-gray-200" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-gray-900">Regulation Alerts</Label>
                    <div className="text-sm text-gray-600">
                      Get notified about new regulations that may affect you
                    </div>
                </div>
                <Switch
                  checked={formData.notifications.regulationAlerts}
                  onCheckedChange={(checked) =>
                    handleNestedChange("notifications", "regulationAlerts", checked)
                  }
                  className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-gray-200 border border-gray-300 data-[state=checked]:border-orange-600 [&>span]:bg-white [&>span]:data-[state=checked]:bg-white [&>span]:data-[state=unchecked]:bg-gray-600"
                />
              </div>
                <Separator className="border-gray-200" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-gray-900">Deadline Reminders</Label>
                    <div className="text-sm text-gray-600">
                      Receive reminders about upcoming compliance deadlines
                    </div>
                </div>
                <Switch
                  checked={formData.notifications.deadlineReminders}
                  onCheckedChange={(checked) =>
                    handleNestedChange("notifications", "deadlineReminders", checked)
                  }
                  className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-gray-200 border border-gray-300 data-[state=checked]:border-orange-600 [&>span]:bg-white [&>span]:data-[state=checked]:bg-white [&>span]:data-[state=unchecked]:bg-gray-600"
                />
              </div>
                <Separator className="border-gray-200" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-gray-900">Weekly Digest</Label>
                    <div className="text-sm text-gray-600">
                      Get a weekly summary of your compliance progress
                    </div>
                </div>
                <Switch
                  checked={formData.notifications.weeklyDigest}
                  onCheckedChange={(checked) =>
                    handleNestedChange("notifications", "weeklyDigest", checked)
                  }
                  className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-gray-200 border border-gray-300 data-[state=checked]:border-orange-600 [&>span]:bg-white [&>span]:data-[state=checked]:bg-white [&>span]:data-[state=unchecked]:bg-gray-600"
                />
              </div>
                <Separator className="border-gray-200" />
              <div className="flex justify-end">
                  <Button onClick={handleSave} className="px-8 py-2 h-11 bg-orange-500 hover:bg-orange-600 text-white">Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="privacy" className="space-y-8">
            <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="pb-8 border-b border-gray-100">
                <CardTitle className="text-2xl font-semibold text-gray-900">Privacy Settings</CardTitle>
                <CardDescription className="text-lg text-gray-600 mt-2">
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-gray-900">Profile Visibility</Label>
                    <div className="text-sm text-gray-600">
                      Allow your profile to be visible to team members
                    </div>
                </div>
                <Switch
                  checked={formData.privacy.profileVisibility}
                  onCheckedChange={(checked) =>
                    handleNestedChange("privacy", "profileVisibility", checked)
                  }
                  className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-gray-200 border border-gray-300 data-[state=checked]:border-orange-600 [&>span]:bg-white [&>span]:data-[state=checked]:bg-white [&>span]:data-[state=unchecked]:bg-gray-600"
                />
              </div>
                <Separator className="border-gray-200" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-gray-900">Data Sharing</Label>
                    <div className="text-sm text-gray-600">
                      Share anonymized data to help improve our services
                    </div>
                </div>
                <Switch
                  checked={formData.privacy.dataSharing}
                  onCheckedChange={(checked) =>
                    handleNestedChange("privacy", "dataSharing", checked)
                  }
                  className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-gray-200 border border-gray-300 data-[state=checked]:border-orange-600 [&>span]:bg-white [&>span]:data-[state=checked]:bg-white [&>span]:data-[state=unchecked]:bg-gray-600"
                />
              </div>
                <Separator className="border-gray-200" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-sm font-medium text-gray-900">Analytics</Label>
                    <div className="text-sm text-gray-600">
                      Allow us to collect usage analytics to improve your experience
                    </div>
                </div>
                <Switch
                  checked={formData.privacy.analyticsOptIn}
                  onCheckedChange={(checked) =>
                    handleNestedChange("privacy", "analyticsOptIn", checked)
                  }
                  className="data-[state=checked]:bg-orange-500 data-[state=unchecked]:bg-gray-200 border border-gray-300 data-[state=checked]:border-orange-600 [&>span]:bg-white [&>span]:data-[state=checked]:bg-white [&>span]:data-[state=unchecked]:bg-gray-600"
                />
              </div>
                <Separator className="border-gray-200" />
              <div className="flex justify-end">
                  <Button onClick={handleSave} className="px-8 py-2 h-11 bg-orange-500 hover:bg-orange-600 text-white">Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="billing" className="space-y-8">
            <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="pb-8 border-b border-gray-100">
                <CardTitle className="text-2xl font-semibold text-gray-900">Billing & Subscription</CardTitle>
                <CardDescription className="text-lg text-gray-600 mt-2">
                  Manage your subscription and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">Current Plan</h3>
                      <p className="text-sm text-gray-600">Free Plan</p>
                    </div>
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">Upgrade Plan</Button>
                  </div>
                </div>
                <Separator className="border-gray-200" />
              <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Billing History</h4>
                  <div className="text-sm text-gray-600">
                    No billing history available for free plan
                  </div>
              </div>
                <Separator className="border-gray-200" />
              <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Usage</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Regulation assessments</span>
                      <span className="text-gray-600">2 of 5 used</span>
                  </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: "40%" }}></div>
                    </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;