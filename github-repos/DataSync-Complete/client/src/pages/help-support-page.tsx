import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, ExternalLink, Mail, MessageSquare, HelpCircle, BookOpen } from "lucide-react";

export default function HelpSupportPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("faq");
  const [searchTerm, setSearchTerm] = useState("");
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // FAQ data
  const faqItems = [
    {
      question: "How do I connect a Google Sheet to the dashboard?",
      answer: "To connect a Google Sheet, go to the Dashboard and click on \"Create New Table\". Then, enter your Google Sheet URL in the provided field and click \"Connect\". Make sure your Google Sheet is shared with the appropriate permissions."
    },
    {
      question: "What are custom columns and how do I use them?",
      answer: "Custom columns allow you to add additional data to your tables that doesn't exist in the source Google Sheet. To add a custom column, open any table and click the \"Add Column\" button in the toolbar. You can choose from different column types like text, number, date, etc."
    },
    {
      question: "How often does the data refresh?",
      answer: "By default, data refreshes every 30 minutes. You can change this interval in Settings > Integrations. You can also manually refresh a table at any time by clicking the refresh button in the table view."
    },
    {
      question: "How do I export data from my tables?",
      answer: "To export data, open any table view and click the \"Export\" button in the table toolbar. Your data will be downloaded as a CSV file that you can open in Excel or other spreadsheet programs."
    },
    {
      question: "Can I collaborate with my team?",
      answer: "Yes! DataSync supports team collaboration. Go to Settings > Team and invite members via email. You can assign different permission levels to control what each team member can view or edit."
    },
    {
      question: "How do I change my password or account settings?",
      answer: "Go to Settings > Security to change your password and manage other security settings. For general account settings like your name or email, go to Settings > Account."
    }
  ];
  
  // Documentation links
  const documentationLinks = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of DataSync and how to set up your first dashboard",
      url: "#"
    },
    {
      title: "Google Sheets Integration",
      description: "Detailed guide to connecting and syncing with Google Sheets",
      url: "#"
    },
    {
      title: "Custom Columns",
      description: "Learn how to extend your tables with custom data",
      url: "#"
    },
    {
      title: "Data Export & Sharing",
      description: "Options for exporting and sharing your dashboard data",
      url: "#"
    },
    {
      title: "User Management & Permissions",
      description: "Guide to team collaboration and access control",
      url: "#"
    },
    {
      title: "API Documentation",
      description: "Technical documentation for developers",
      url: "#"
    }
  ];
  
  // Filtered FAQ based on search term
  const filteredFaq = searchTerm
    ? faqItems.filter(item => 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : faqItems;

  // Filtered documentation based on search term
  const filteredDocs = searchTerm
    ? documentationLinks.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : documentationLinks;
  
  // Handle contact form submission
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate form
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message sent",
        description: "We've received your message and will respond shortly.",
      });
      
      // Reset form
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    }, 1500);
  };
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Support</h1>
        <p className="text-slate-500 mb-6">Find answers to common questions or get in touch with our support team.</p>
        
        <div className="max-w-3xl mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <Input
              type="search"
              placeholder="Search for help topics..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 max-w-xl mb-8">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact Us
            </TabsTrigger>
          </TabsList>
          
          {/* FAQ Tab */}
          <TabsContent value="faq">
            <div className="max-w-3xl">
              {searchTerm && filteredFaq.length === 0 ? (
                <p className="text-center py-8 text-slate-500">
                  No results found for "{searchTerm}". Try a different search term or contact support.
                </p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaq.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-slate-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
              
              <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
                <div className="flex items-start">
                  <MessageSquare className="h-5 w-5 text-indigo-600 mt-0.5 mr-3" />
                  <div>
                    <h3 className="font-medium text-indigo-900">Can't find what you're looking for?</h3>
                    <p className="text-indigo-700 text-sm mt-1">
                      Our support team is ready to help you. Click on the "Contact Us" tab to send us a message.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Documentation Tab */}
          <TabsContent value="docs">
            <div className="max-w-3xl">
              {searchTerm && filteredDocs.length === 0 ? (
                <p className="text-center py-8 text-slate-500">
                  No documentation found for "{searchTerm}". Try a different search term.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredDocs.map((doc, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{doc.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-500">{doc.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" asChild>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                            <ExternalLink className="h-4 w-4" />
                            Read Guide
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Contact Us Tab */}
          <TabsContent value="contact">
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>
                  Have a question or need help? Fill out the form below and our support team will get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleContactSubmit}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        id="name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input 
                        id="email"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </label>
                    <Input 
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <Textarea 
                      id="message"
                      rows={6}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending Message
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <div className="mt-8 max-w-2xl border-t pt-8">
              <h3 className="text-xl font-semibold mb-4">Other Ways to Reach Us</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <div className="bg-blue-100 text-blue-600 h-10 w-10 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Email Support</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      For general inquiries or support questions
                    </p>
                    <a href="mailto:support@datasync.com" className="text-sm text-blue-600 mt-1 block">
                      support@datasync.com
                    </a>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="bg-purple-100 text-purple-600 h-10 w-10 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Live Chat</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Chat with our support team in real-time
                    </p>
                    <button className="text-sm text-purple-600 mt-1">
                      Start Live Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}