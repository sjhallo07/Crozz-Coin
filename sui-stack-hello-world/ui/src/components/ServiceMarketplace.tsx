// Service Marketplace Component for Crozz Ecosystem
import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  Badge,
  TextField,
  TextArea,
  Dialog,
  Tabs,
} from "@radix-ui/themes";
import { useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { InfoCircledIcon, RocketIcon, CheckCircledIcon } from "@radix-ui/react-icons";
import { SecondaryWindow } from "./SecondaryWindow";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  isActive: boolean;
  usageCount: number;
  revenue: number;
  category: "compute" | "storage" | "api" | "analytics" | "other";
}

// Mock data for demonstration
const MOCK_SERVICES: Service[] = [
  {
    id: 0,
    name: "AI Text Generation",
    description: "Generate high-quality text content using advanced AI models. Perfect for blogs, articles, and creative writing.",
    price: 0.1,
    isActive: true,
    usageCount: 245,
    revenue: 24.5,
    category: "compute",
  },
  {
    id: 1,
    name: "Image Processing",
    description: "Transform and optimize images with various filters and effects. Supports batch processing.",
    price: 0.05,
    isActive: true,
    usageCount: 532,
    revenue: 26.6,
    category: "compute",
  },
  {
    id: 2,
    name: "Data Analytics API",
    description: "Real-time data analytics and insights. Process large datasets and generate actionable reports.",
    price: 0.2,
    isActive: true,
    usageCount: 128,
    revenue: 25.6,
    category: "analytics",
  },
  {
    id: 3,
    name: "Free API Endpoint",
    description: "Test our API infrastructure with a free endpoint. No payment required, perfect for testing integrations.",
    price: 0,
    isActive: true,
    usageCount: 1024,
    revenue: 0,
    category: "api",
  },
];

const CATEGORY_COLORS = {
  compute: "blue",
  storage: "green",
  api: "purple",
  analytics: "orange",
  other: "gray",
} as const;

export function ServiceMarketplace() {
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [services, setServices] = useState<Service[]>(MOCK_SERVICES);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"marketplace" | "dashboard">("marketplace");
  
  // New service form state
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "0",
    category: "other" as Service["category"],
  });

  const infoPanels = [
    {
      id: "welcome",
      title: "Welcome to Service Marketplace",
      icon: "🎯",
      content: "Browse and access services on the Crozz ecosystem. Free services require no payment, while premium services are charged in SUI tokens.",
      type: "info" as const,
    },
    {
      id: "admin",
      title: "Admin Features",
      icon: "⚙️",
      content: "Service admins can register new services, set pricing, and track usage statistics through the dashboard.",
      type: "tip" as const,
    },
    {
      id: "payment",
      title: "Secure Payments",
      icon: "🔒",
      content: "All payments are processed on-chain via Sui blockchain, ensuring transparency and security.",
      type: "success" as const,
    },
  ];

  const handleAccessService = (service: Service) => {
    if (!currentAccount) {
      alert("Please connect your wallet first");
      return;
    }

    setSelectedService(service);
  };

  const handleConfirmAccess = () => {
    if (!selectedService || !currentAccount) return;

    // Check if marketplace IDs are configured
    const packageId = import.meta.env.VITE_MARKETPLACE_PACKAGE_ID;
    const marketplaceId = import.meta.env.VITE_MARKETPLACE_OBJECT_ID;
    
    if (!packageId || !marketplaceId) {
      alert("Marketplace not configured. Please set VITE_MARKETPLACE_PACKAGE_ID and VITE_MARKETPLACE_OBJECT_ID in .env");
      return;
    }

    const tx = new Transaction();
    
    if (selectedService.price === 0) {
      // Access free service
      tx.moveCall({
        target: `${packageId}::marketplace::access_free_service`,
        arguments: [
          tx.object(marketplaceId),
          tx.pure.u64(selectedService.id),
        ],
      });
    } else {
      // Access paid service - would need to split coins and pay
      const [coin] = tx.splitCoins(tx.gas, [selectedService.price * 1_000_000_000]); // Convert SUI to MIST
      tx.moveCall({
        target: `${packageId}::marketplace::access_paid_service`,
        arguments: [
          tx.object(marketplaceId),
          tx.pure.u64(selectedService.id),
          coin,
        ],
      });
    }

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          alert(`Successfully accessed ${selectedService.name}!`);
          setSelectedService(null);
        },
        onError: (error) => {
          console.error("Transaction failed:", error);
          alert(`Failed to access service: ${error.message}`);
        },
      }
    );
  };

  const handleRegisterService = () => {
    if (!currentAccount) {
      alert("Please connect your wallet first");
      return;
    }

    // Check if marketplace IDs are configured
    const packageId = import.meta.env.VITE_MARKETPLACE_PACKAGE_ID;
    const marketplaceId = import.meta.env.VITE_MARKETPLACE_OBJECT_ID;
    const adminCapId = import.meta.env.VITE_ADMIN_CAP_ID;
    
    if (!packageId || !marketplaceId || !adminCapId) {
      alert("Marketplace not fully configured. Admin features require VITE_ADMIN_CAP_ID to be set in .env");
      return;
    }

    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::marketplace::register_service`,
      arguments: [
        tx.object(adminCapId),
        tx.object(marketplaceId),
        tx.pure.string(newService.name),
        tx.pure.string(newService.description),
        tx.pure.u64(parseFloat(newService.price) * 1_000_000_000), // Convert SUI to MIST
      ],
    });

    signAndExecute(
      { transaction: tx },
      {
        onSuccess: () => {
          alert("Service registered successfully!");
          setShowAdminDialog(false);
          setNewService({ name: "", description: "", price: "0", category: "other" });
        },
        onError: (error) => {
          console.error("Transaction failed:", error);
          alert(`Failed to register service: ${error.message}`);
        },
      }
    );
  };

  return (
    <>
      <Card size="4" style={{ marginTop: "20px" }}>
        <Flex direction="column" gap="4">
          <Flex align="center" justify="between">
            <Flex align="center" gap="2">
              <RocketIcon width="24" height="24" />
              <Heading size="6">Service Marketplace</Heading>
            </Flex>
            <Button onClick={() => setShowAdminDialog(true)} disabled={!currentAccount}>
              Register Service
            </Button>
          </Flex>

          <Tabs.Root value={activeTab} onValueChange={(val) => setActiveTab(val as any)}>
            <Tabs.List>
              <Tabs.Trigger value="marketplace">Browse Services</Tabs.Trigger>
              <Tabs.Trigger value="dashboard">My Dashboard</Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="marketplace">
              <Box mt="4">
                {!currentAccount && (
                  <Card style={{ background: "var(--amber-a2)", marginBottom: "16px" }}>
                    <Text size="2">
                      ⚠️ Connect your wallet to access services
                    </Text>
                  </Card>
                )}

                <Flex direction="column" gap="3">
                  {services.map((service) => (
                    <Card key={service.id} style={{ position: "relative" }}>
                      <Flex direction="column" gap="2">
                        <Flex align="center" justify="between">
                          <Flex align="center" gap="2">
                            <Heading size="4">{service.name}</Heading>
                            <Badge color={CATEGORY_COLORS[service.category]}>
                              {service.category}
                            </Badge>
                            {service.price === 0 && (
                              <Badge color="green">Free</Badge>
                            )}
                          </Flex>
                          <Flex align="center" gap="2">
                            <Text size="2" weight="bold">
                              {service.price === 0 ? "FREE" : `${service.price} SUI`}
                            </Text>
                            <Button
                              onClick={() => handleAccessService(service)}
                              disabled={!currentAccount || !service.isActive}
                            >
                              Access
                            </Button>
                          </Flex>
                        </Flex>

                        <Text size="2" color="gray">
                          {service.description}
                        </Text>

                        <Flex gap="4" style={{ fontSize: "12px", color: "var(--gray-11)" }}>
                          <Text size="1">
                            📊 {service.usageCount} uses
                          </Text>
                          {service.revenue > 0 && (
                            <Text size="1">
                              💰 {service.revenue.toFixed(2)} SUI earned
                            </Text>
                          )}
                          <Text size="1">
                            {service.isActive ? "✅ Active" : "⏸️ Inactive"}
                          </Text>
                        </Flex>
                      </Flex>
                    </Card>
                  ))}
                </Flex>
              </Box>
            </Tabs.Content>

            <Tabs.Content value="dashboard">
              <Box mt="4">
                <Flex direction="column" gap="4">
                  <Card>
                    <Heading size="4" mb="2">Usage Statistics</Heading>
                    <Flex direction="column" gap="2">
                      <Text size="2">Total Services Used: 42</Text>
                      <Text size="2">Total Spent: 12.5 SUI</Text>
                      <Text size="2">Favorite Category: Compute</Text>
                    </Flex>
                  </Card>

                  <Card>
                    <Heading size="4" mb="2">Recent Activity</Heading>
                    <Flex direction="column" gap="2">
                      <Flex justify="between">
                        <Text size="2">AI Text Generation</Text>
                        <Text size="2" color="gray">2 hours ago</Text>
                      </Flex>
                      <Flex justify="between">
                        <Text size="2">Image Processing</Text>
                        <Text size="2" color="gray">1 day ago</Text>
                      </Flex>
                      <Flex justify="between">
                        <Text size="2">Data Analytics API</Text>
                        <Text size="2" color="gray">3 days ago</Text>
                      </Flex>
                    </Flex>
                  </Card>
                </Flex>
              </Box>
            </Tabs.Content>
          </Tabs.Root>
        </Flex>
      </Card>

      {/* Service Access Dialog */}
      <Dialog.Root open={!!selectedService} onOpenChange={(open) => !open && setSelectedService(null)}>
        <Dialog.Content>
          <Dialog.Title>Access Service</Dialog.Title>
          <Dialog.Description>
            {selectedService && (
              <Flex direction="column" gap="3" mt="3">
                <Text size="3" weight="bold">{selectedService.name}</Text>
                <Text size="2">{selectedService.description}</Text>
                <Flex gap="2" align="center">
                  <Text size="2" weight="bold">Price:</Text>
                  <Text size="2">
                    {selectedService.price === 0 ? "FREE" : `${selectedService.price} SUI`}
                  </Text>
                </Flex>
                {selectedService.price > 0 && (
                  <Card style={{ background: "var(--amber-a2)" }}>
                    <Text size="1">
                      ℹ️ This amount will be deducted from your wallet to access this service.
                    </Text>
                  </Card>
                )}
                <Flex gap="2" justify="end" mt="2">
                  <Button variant="soft" onClick={() => setSelectedService(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmAccess}>
                    Confirm Access
                  </Button>
                </Flex>
              </Flex>
            )}
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Root>

      {/* Admin Dialog for Registering Services */}
      <Dialog.Root open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <Dialog.Content>
          <Dialog.Title>Register New Service</Dialog.Title>
          <Dialog.Description>
            <Flex direction="column" gap="3" mt="3">
              <Box>
                <Text size="2" weight="bold" mb="1">Service Name</Text>
                <TextField.Root
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  placeholder="Enter service name"
                />
              </Box>
              
              <Box>
                <Text size="2" weight="bold" mb="1">Description</Text>
                <TextArea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Describe your service"
                  rows={3}
                />
              </Box>
              
              <Box>
                <Text size="2" weight="bold" mb="1">Price (SUI)</Text>
                <TextField.Root
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                  placeholder="0 for free service"
                  min="0"
                  step="0.01"
                />
              </Box>

              <Card style={{ background: "var(--blue-a2)" }}>
                <Text size="1">
                  ℹ️ You need an Admin Capability NFT to register services. Set price to 0 for free services.
                </Text>
              </Card>

              <Flex gap="2" justify="end" mt="2">
                <Button variant="soft" onClick={() => setShowAdminDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleRegisterService}
                  disabled={!newService.name || !newService.description}
                >
                  Register Service
                </Button>
              </Flex>
            </Flex>
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Root>

      <SecondaryWindow panels={infoPanels} position="bottom" defaultOpen={false} />
    </>
  );
}
