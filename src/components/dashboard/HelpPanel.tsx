import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, HelpCircle, Phone, Mail } from "lucide-react";

const HelpPanel = () => {
  const faqs = [
    {
      question: "How do I calculate a route?",
      answer: "Enter your starting point (fire station or current location) and the fire site address, then tap 'Calculate Optimal Route'. The system will display the fastest route along with nearby hydrants and water sources."
    },
    {
      question: "How do I pin a location on the map?",
      answer: "Select 'Pin on map' option for Address 1 or tap 'Pin destination on map' for Address 2. Then tap anywhere on the map to place the pin. You can drag the pin to adjust its position."
    },
    {
      question: "What do the incident statuses mean?",
      answer: "Active: Incident is ongoing. Resolved: Fire has been addressed. Archived: Closed and stored for records. Cancel: Used for false alarms. Updating status closes the current route."
    },
    {
      question: "How do I export route information?",
      answer: "While an incident is Active, tap the 'Export to PDF' button at the bottom of the control panel. This generates a printable document with route details, hydrant locations, and water sources."
    },
    {
      question: "What if I lose internet connection?",
      answer: "Enable 'Offline Cache' in Settings to store map data locally. Previously loaded areas will remain accessible without internet connection."
    }
  ];

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl md:text-2xl font-bold">Help & Support</h2>
        <p className="text-sm text-muted-foreground">Quick guide and frequently asked questions</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Quick Guide */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
              Quick Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[hsl(var(--fire-orange))] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
              <p className="text-sm">Enter your starting point using the fire station address, GPS, or by pinning on the map.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[hsl(var(--fire-orange))] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
              <p className="text-sm">Enter the fire site destination address or pin it directly on the map.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[hsl(var(--fire-orange))] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
              <p className="text-sm">Tap "Calculate Optimal Route" to view the fastest path and nearby water sources.</p>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-[hsl(var(--fire-orange))] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
              <p className="text-sm">Update incident status when the situation changes to close the route.</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
              Contact Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium">Emergency Hotline: 911</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm">BFP Bulan: (056) 211-1234</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm break-all">support@bfp-bulan.gov.ph</span>
            </div>
          </CardContent>
        </Card>

        {/* FAQs - Full width */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[hsl(var(--fire-orange))]" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-sm text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpPanel;
