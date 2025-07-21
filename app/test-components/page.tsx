"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

// Import our new components
import { DatePicker } from "@/components/ui/forms/DatePicker"
import { ToastProvider, useToast } from "@/components/ui/feedback/Toast"
import { ErrorBoundary } from "@/components/ui/feedback/ErrorBoundary"
import {
  Modal,
  ModalTrigger,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  ConfirmModal,
  AlertModal
} from "@/components/ui/layout/Modal"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerFooter,
  MobileDrawer
} from "@/components/ui/layout/Drawer"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  CardTabs,
  UnderlineTabs
} from "@/components/ui/layout/Tabs"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  FAQAccordion,
  SettingsAccordion
} from "@/components/ui/layout/Accordion"

// Import Task 4.3 components
import { PackageInfoSection } from "@/components/forms/PackageInfoSection"
import { PackageInfo, Weight, Dimensions } from "@/lib/types"

// Test component for error boundary
function ErrorComponent() {
  const [shouldError, setShouldError] = React.useState(false)
  
  if (shouldError) {
    throw new Error("This is a test error for the ErrorBoundary!")
  }
  
  return (
    <Button 
      variant="destructive" 
      onClick={() => setShouldError(true)}
    >
      Trigger Error
    </Button>
  )
}

function ToastDemo() {
  const { addToast } = useToast()
  
  return (
    <div className="space-y-2">
      <Button 
        onClick={() => addToast({ 
          title: "Success!", 
          description: "Your action was completed successfully.",
          type: "success",
          duration: 8000
        })}
      >
        Success Toast
      </Button>
      <Button 
        variant="destructive"
        onClick={() => addToast({ 
          title: "Error occurred", 
          description: "Something went wrong. Please try again.",
          type: "error",
          duration: 8000
        })}
      >
        Error Toast
      </Button>
      <Button 
        variant="outline"
        onClick={() => addToast({ 
          title: "Information", 
          description: "Here's some useful information for you.",
          type: "info",
          duration: 8000
        })}
      >
        Info Toast
      </Button>
    </div>
  )
}

export default function ComponentTestPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>()
  const [modalOpen, setModalOpen] = React.useState(false)
  const [confirmModalOpen, setConfirmModalOpen] = React.useState(false)
  const [alertModalOpen, setAlertModalOpen] = React.useState(false)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false)

  // Package info state for Task 4.3 testing
  const [packageInfo, setPackageInfo] = React.useState<PackageInfo>({
    type: 'medium',
    weight: { value: 5, unit: 'lbs' } as Weight,
    dimensions: { length: 12, width: 8, height: 6, unit: 'in' } as Dimensions,
    declaredValue: 100,
    currency: 'USD',
    contents: 'Test contents',
    contentsCategory: 'electronics',
    specialHandling: [],
    multiplePackages: undefined
  })

  const tabsData = [
    {
      value: "overview",
      label: "Overview",
      content: <div className="p-4">Overview content goes here</div>
    },
    {
      value: "analytics",
      label: "Analytics", 
      content: <div className="p-4">Analytics content goes here</div>
    },
    {
      value: "reports",
      label: "Reports",
      content: <div className="p-4">Reports content goes here</div>
    }
  ]

  const cardTabsData = [
    {
      value: "dashboard",
      label: "Dashboard",
      content: <div className="p-4">Dashboard content for card tabs</div>
    },
    {
      value: "metrics",
      label: "Metrics",
      content: <div className="p-4">Metrics content for card tabs</div>
    },
    {
      value: "insights",
      label: "Insights", 
      content: <div className="p-4">Insights content for card tabs</div>
    }
  ]

  const underlineTabsData = [
    {
      value: "summary",
      label: "Summary",
      content: <div className="p-4">Summary content for underline tabs</div>,
      count: 5
    },
    {
      value: "details",
      label: "Details",
      content: <div className="p-4">Details content for underline tabs</div>,
      count: 12
    },
    {
      value: "history",
      label: "History",
      content: <div className="p-4">History content for underline tabs</div>,
      count: 3
    }
  ]

  const faqData = [
    {
      id: "1",
      question: "How do I create a shipping label?",
      answer: "You can create a shipping label by following these steps: 1. Enter package details 2. Select shipping option 3. Add pickup details 4. Review and confirm"
    },
    {
      id: "2", 
      question: "What payment methods are accepted?",
      answer: "We accept Purchase Orders (PO), Bill of Lading (BOL), Third Party billing, Net terms, and Corporate accounts."
    },
    {
      id: "3",
      question: "How can I track my shipment?",
      answer: "Once your shipment is confirmed, you'll receive a tracking number via email. You can use this to track your package on our tracking page."
    }
  ]

  const settingsData = [
    {
      id: "general",
      title: "General Settings",
      description: "Basic account and profile settings",
      content: <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Company Name</label>
          <input className="w-full mt-1 p-2 border rounded" placeholder="Enter company name" />
        </div>
        <div>
          <label className="text-sm font-medium">Contact Email</label>
          <input className="w-full mt-1 p-2 border rounded" placeholder="Enter email" />
        </div>
      </div>
    },
    {
      id: "shipping",
      title: "Shipping Preferences",
      description: "Default shipping options and preferences",
      content: <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Default Package Type</label>
          <select className="w-full mt-1 p-2 border rounded">
            <option>Small Package</option>
            <option>Medium Package</option>
            <option>Large Package</option>
          </select>
        </div>
      </div>
    }
  ]

  return (
    <ToastProvider>
      <div className="container mx-auto p-6 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Component Test Page</h1>
          <p className="text-muted-foreground mt-2">Testing all newly implemented UI components</p>
        </div>

        {/* DatePicker Test */}
        <Card>
          <CardHeader>
            <CardTitle>DatePicker Component</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Standard Date Picker</label>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                placeholder="Select a date"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Business Days Only</label>
              <DatePicker
                placeholder="Business days only"
                businessDaysOnly={true}
                className="mt-1"
              />
            </div>
            {selectedDate && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedDate.toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Toast Test */}
        <Card>
          <CardHeader>
            <CardTitle>Toast Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ToastDemo />
          </CardContent>
        </Card>

        {/* Modal Test */}
        <Card>
          <CardHeader>
            <CardTitle>Modal Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Modal open={modalOpen} onOpenChange={setModalOpen}>
                <ModalTrigger asChild>
                  <Button>Open Modal</Button>
                </ModalTrigger>
                <ModalContent size="md">
                  <ModalHeader>
                    <ModalTitle>Example Modal</ModalTitle>
                    <ModalDescription>
                      This is a demonstration of our modal component with various features.
                    </ModalDescription>
                  </ModalHeader>
                  <ModalBody>
                    <p>This is the modal body content. You can put any content here including forms, text, images, etc.</p>
                  </ModalBody>
                  <ModalFooter>
                    <Button variant="outline" onClick={() => setModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setModalOpen(false)}>
                      Save Changes
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>

              <Button onClick={() => setConfirmModalOpen(true)}>
                Confirm Modal
              </Button>

              <Button onClick={() => setAlertModalOpen(true)}>
                Alert Modal
              </Button>
            </div>

            <ConfirmModal
              open={confirmModalOpen}
              onOpenChange={setConfirmModalOpen}
              title="Confirm Action"
              description="Are you sure you want to proceed? This action cannot be undone."
              confirmText="Yes, proceed"
              cancelText="Cancel"
              variant="destructive"
              onConfirm={() => console.log("Confirmed!")}
            />

            <AlertModal
              open={alertModalOpen}
              onOpenChange={setAlertModalOpen}
              title="Important Notice"
              description="Your session will expire in 5 minutes. Please save your work."
              buttonText="Got it"
            />
          </CardContent>
        </Card>

        {/* Drawer Test */}
        <Card>
          <CardHeader>
            <CardTitle>Drawer Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button>Open Drawer</Button>
                </DrawerTrigger>
                <DrawerContent direction="right" size="md">
                  <DrawerHeader>
                    <DrawerTitle>Settings Panel</DrawerTitle>
                    <DrawerDescription>
                      Configure your application settings here.
                    </DrawerDescription>
                  </DrawerHeader>
                  <DrawerBody>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Notification Settings</label>
                        <div className="mt-2 space-y-2">
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" />
                            <span className="text-sm">Email notifications</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input type="checkbox" />
                            <span className="text-sm">SMS notifications</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </DrawerBody>
                  <DrawerFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setDrawerOpen(false)}
                      data-testid="drawer-cancel-button"
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setDrawerOpen(false)}>
                      Save Settings
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>

              <MobileDrawer
                open={mobileDrawerOpen}
                onOpenChange={setMobileDrawerOpen}
                trigger={<Button variant="outline">Mobile Menu</Button>}
                title="Navigation"
                description="Mobile navigation menu"
              >
                <div className="space-y-2">
                  <a href="#" className="block p-2 hover:bg-muted rounded">Dashboard</a>
                  <a href="#" className="block p-2 hover:bg-muted rounded">Shipping</a>
                  <a href="#" className="block p-2 hover:bg-muted rounded">Reports</a>
                  <a href="#" className="block p-2 hover:bg-muted rounded">Settings</a>
                </div>
              </MobileDrawer>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Test */}
        <Card>
          <CardHeader>
            <CardTitle>Tabs Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Standard Tabs</h3>
              <Tabs defaultValue="tab1">
                <TabsList>
                  <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">
                  <p>This is the content for Tab 1</p>
                </TabsContent>
                <TabsContent value="tab2">
                  <p>This is the content for Tab 2</p>
                </TabsContent>
                <TabsContent value="tab3">
                  <p>This is the content for Tab 3</p>
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Card Style Tabs</h3>
              <CardTabs
                defaultValue="dashboard"
                tabs={cardTabsData}
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Underline Style Tabs</h3>
              <UnderlineTabs
                defaultValue="summary"
                tabs={underlineTabsData}
              />
            </div>
          </CardContent>
        </Card>

        {/* Accordion Test */}
        <Card>
          <CardHeader>
            <CardTitle>Accordion Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Standard Accordion</h3>
              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>What is your shipping process?</AccordionTrigger>
                  <AccordionContent>
                    Our shipping process involves package pickup, sorting, transportation, and delivery. We provide tracking at every step.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>How do you calculate shipping costs?</AccordionTrigger>
                  <AccordionContent>
                    Shipping costs are calculated based on package dimensions, weight, destination, and selected service level.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">FAQ Style Accordion</h3>
              <FAQAccordion
                items={faqData}
                allowMultiple={true}
              />
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Settings Style Accordion</h3>
              <SettingsAccordion
                sections={settingsData}
                defaultOpen={["general"]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Error Boundary Test */}
        <Card>
          <CardHeader>
            <CardTitle>Error Boundary Test</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorBoundary
              onError={(error, errorInfo) => {
                console.error("Error caught by boundary:", error, errorInfo)
              }}
            >
              <ErrorComponent />
            </ErrorBoundary>
          </CardContent>
        </Card>

        {/* Package Info Section Test - Task 4.3 */}
        <Card>
          <CardHeader>
            <CardTitle>Package Information - Task 4.3 Components</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <h2>Package Information</h2>
              <PackageInfoSection
                value={packageInfo}
                onChange={setPackageInfo}
                errors={{}}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </ToastProvider>
  )
}
