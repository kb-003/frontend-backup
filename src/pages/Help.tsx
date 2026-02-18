import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Map as MapIcon, Settings, HelpCircle, User, Search, Navigation, Droplets, AlertTriangle, Phone, Mail, BookOpen, Shield } from "lucide-react";
import bfpLogo from "@/assets/bfp-logo.png";

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Getting Started",
      icon: BookOpen,
      questions: [
        {
          q: "How do I calculate a route to a fire site?",
          a: "Enter your starting point (or use the default fire station address) in Address 1, then enter the fire site location in Address 2. Click 'Calculate Optimal Route' to view the best path along with nearby hydrants and water sources."
        },
        {
          q: "What do the different map markers represent?",
          a: "Red building icons represent Fire Stations, red hydrant icons show Fire Hydrants, blue droplet icons indicate Rivers, circle markers show Wells, and circular wave markers indicate Sea access points."
        },
        {
          q: "How do I use my current location as the starting point?",
          a: "Select 'Use my current location' option below the Address 1 input field. The system will use your device's GPS to determine your position."
        }
      ]
    },
    {
      category: "Fire Hydrants",
      icon: Droplets,
      questions: [
        {
          q: "How do I find the nearest fire hydrant?",
          a: "After calculating a route, the system automatically displays the nearest functional hydrants in the Route Information panel. Hydrants are also visible on the map as red markers."
        },
        {
          q: "What do the hydrant status colors mean?",
          a: "Green (Functional) means the hydrant is operational, Yellow (Under Maintenance) indicates scheduled maintenance, and Red (Non-Functional) means the hydrant is currently not working."
        },
        {
          q: "How is road width information useful?",
          a: "Road width helps determine if fire trucks can access the hydrant location. Wider roads allow for larger apparatus and easier maneuvering during emergencies."
        }
      ]
    },
    {
      category: "Water Sources",
      icon: Droplets,
      questions: [
        {
          q: "What types of water sources are tracked?",
          a: "The system tracks Rivers, Wells, and Sea access points. Each source includes location coordinates, road width for accessibility, and landmark information."
        },
        {
          q: "When should I use alternative water sources?",
          a: "Alternative water sources like rivers or wells are useful when hydrants are unavailable, non-functional, or when additional water supply is needed for large fires."
        }
      ]
    },
    {
      category: "Navigation",
      icon: Navigation,
      questions: [
        {
          q: "How accurate are the route estimates?",
          a: "Route estimates are based on real-time traffic data and road conditions. Actual travel time may vary based on traffic, weather, and emergency response conditions."
        },
        {
          q: "Can I export route information?",
          a: "Yes, after calculating a route, click the 'Export to PDF' button to download a document containing the route details, hydrant locations, and water source information."
        },
        {
          q: "How do I recalculate a route?",
          a: "Simply enter new addresses and click 'Calculate Optimal Route' again. The map will update with the new route and nearby resources."
        }
      ]
    },
    {
      category: "Emergency Procedures",
      icon: AlertTriangle,
      questions: [
        {
          q: "What should I do if all nearby hydrants are non-functional?",
          a: "The system will automatically suggest alternative water sources such as rivers or wells. Contact dispatch for additional tanker support if needed."
        },
        {
          q: "How do I report a hydrant issue?",
          a: "Supervisors can update hydrant status through the Admin panel. Go to Manage Hydrants, find the hydrant, and update its status accordingly."
        }
      ]
    },
    {
      category: "Account & Security",
      icon: Shield,
      questions: [
        {
          q: "How do I change my password?",
          a: "Navigate to your Profile page and click on 'Change Password'. You'll need to enter your current password and then your new password twice to confirm."
        },
        {
          q: "Who can access the Admin panel?",
          a: "Only users with Supervisor roles can access the Admin panel. Supervisors can manage hydrants, water sources, and user accounts."
        },
        {
          q: "How do I update my profile information?",
          a: "Click on the Profile icon in the sidebar to access your profile page. From there, you can update your name, contact information, and profile picture."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      item => 
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className="bg-gradient-to-b from-[hsl(var(--fire-orange))] to-[hsl(var(--fire-red))] flex flex-col items-center py-4 gap-6 w-16">
          <img src={bfpLogo} alt="BFP" className="w-10 h-10" />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => navigate("/dashboard")}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors"
              >
                <MapIcon className="w-6 h-6 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Map</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => navigate("/settings")}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors"
              >
                <Settings className="w-6 h-6 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-3 bg-white/20 rounded-lg transition-colors">
                <HelpCircle className="w-6 h-6 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Help</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => navigate("/profile")}
                className="p-3 hover:bg-white/10 rounded-lg transition-colors mt-auto"
              >
                <User className="w-6 h-6 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Profile</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Help Center</h1>
              <p className="text-muted-foreground">Find answers to common questions about the Emergency Response Navigator</p>
            </div>

            {/* Search */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-[hsl(var(--fire-orange))]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
                    Route Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Learn how to calculate routes and navigate to fire sites</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-[hsl(var(--fire-orange))]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
                    Water Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Understand hydrants and alternative water sources</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-[hsl(var(--fire-orange))]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
                    Admin Guide
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Manage users, hydrants, and system settings</p>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Sections */}
            <div className="space-y-6">
              {filteredFaqs.map((category, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <category.icon className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((item, qIdx) => (
                        <AccordionItem key={qIdx} value={`item-${idx}-${qIdx}`}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact Support */}
            <Card className="mt-8 bg-gradient-to-r from-[hsl(var(--fire-orange))]/10 to-[hsl(var(--fire-red))]/10 border-[hsl(var(--fire-orange))]/30">
              <CardHeader>
                <CardTitle>Still need help?</CardTitle>
                <CardDescription>Contact our support team for additional assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
                    <span className="text-sm">Emergency: 911 / BFP Hotline: 160</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
                    <span className="text-sm">support@bfp.gov.ph</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Help;
