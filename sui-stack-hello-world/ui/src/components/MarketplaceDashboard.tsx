// Enhanced Dashboard for Service Marketplace Analytics
import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  Badge,
  Tabs,
  Grid,
} from "@radix-ui/themes";
import { 
  BarChartIcon, 
  ActivityLogIcon, 
  RocketIcon, 
  DashboardIcon 
} from "@radix-ui/react-icons";

interface ServiceStats {
  id: number;
  name: string;
  category: string;
  usage: number;
  revenue: number;
  trend: "up" | "down" | "stable";
}

interface UserStats {
  totalServicesUsed: number;
  totalSpent: number;
  favoriteCategory: string;
  recentActivities: Activity[];
}

interface Activity {
  serviceName: string;
  timestamp: string;
  amount: number;
  status: "success" | "pending" | "failed";
}

const MOCK_USER_STATS: UserStats = {
  totalServicesUsed: 42,
  totalSpent: 12.5,
  favoriteCategory: "Compute",
  recentActivities: [
    { serviceName: "AI Text Generation", timestamp: "2 hours ago", amount: 0.1, status: "success" },
    { serviceName: "Image Processing", timestamp: "1 day ago", amount: 0.05, status: "success" },
    { serviceName: "Data Analytics API", timestamp: "3 days ago", amount: 0.2, status: "success" },
    { serviceName: "Free API Endpoint", timestamp: "5 days ago", amount: 0, status: "success" },
  ],
};

const MOCK_SERVICE_STATS: ServiceStats[] = [
  { id: 0, name: "AI Text Generation", category: "Compute", usage: 245, revenue: 24.5, trend: "up" },
  { id: 1, name: "Image Processing", category: "Compute", usage: 532, revenue: 26.6, trend: "up" },
  { id: 2, name: "Data Analytics API", category: "Analytics", usage: 128, revenue: 25.6, trend: "stable" },
  { id: 3, name: "Free API Endpoint", category: "API", usage: 1024, revenue: 0, trend: "up" },
];

export function MarketplaceDashboard() {
  const [activeView, setActiveView] = useState<"user" | "admin">("user");

  const topServices = useMemo(() => {
    return [...MOCK_SERVICE_STATS].sort((a, b) => b.usage - a.usage).slice(0, 3);
  }, []);

  const totalRevenue = useMemo(() => {
    return MOCK_SERVICE_STATS.reduce((sum, service) => sum + service.revenue, 0);
  }, []);

  const totalUsage = useMemo(() => {
    return MOCK_SERVICE_STATS.reduce((sum, service) => sum + service.usage, 0);
  }, []);

  return (
    <Card size="4" style={{ marginTop: "20px" }}>
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between">
          <Flex align="center" gap="2">
            <DashboardIcon width="24" height="24" />
            <Heading size="6">Marketplace Dashboard</Heading>
          </Flex>
          <Flex gap="2">
            <Button
              variant={activeView === "user" ? "solid" : "soft"}
              onClick={() => setActiveView("user")}
            >
              User View
            </Button>
            <Button
              variant={activeView === "admin" ? "solid" : "soft"}
              onClick={() => setActiveView("admin")}
            >
              Admin View
            </Button>
          </Flex>
        </Flex>

        {activeView === "user" ? (
          <UserDashboard stats={MOCK_USER_STATS} />
        ) : (
          <AdminDashboard
            services={MOCK_SERVICE_STATS}
            totalRevenue={totalRevenue}
            totalUsage={totalUsage}
            topServices={topServices}
          />
        )}
      </Flex>
    </Card>
  );
}

function UserDashboard({ stats }: { stats: UserStats }) {
  return (
    <Tabs.Root defaultValue="overview">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Recent Activity</Tabs.Trigger>
        <Tabs.Trigger value="spending">Spending</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="overview">
        <Box mt="4">
          <Grid columns="3" gap="3">
            <Card style={{ background: "var(--blue-a2)" }}>
              <Flex direction="column" gap="2">
                <Text size="2" color="gray">Total Services Used</Text>
                <Text size="6" weight="bold">{stats.totalServicesUsed}</Text>
                <Badge color="blue" size="1">All Time</Badge>
              </Flex>
            </Card>

            <Card style={{ background: "var(--green-a2)" }}>
              <Flex direction="column" gap="2">
                <Text size="2" color="gray">Total Spent</Text>
                <Text size="6" weight="bold">{stats.totalSpent} SUI</Text>
                <Badge color="green" size="1">Since Start</Badge>
              </Flex>
            </Card>

            <Card style={{ background: "var(--purple-a2)" }}>
              <Flex direction="column" gap="2">
                <Text size="2" color="gray">Favorite Category</Text>
                <Text size="6" weight="bold">{stats.favoriteCategory}</Text>
                <Badge color="purple" size="1">Most Used</Badge>
              </Flex>
            </Card>
          </Grid>

          <Card mt="4">
            <Heading size="4" mb="3">Usage Breakdown</Heading>
            <Flex direction="column" gap="2">
              <Flex justify="between" align="center">
                <Text size="2">Compute Services</Text>
                <Flex gap="2" align="center">
                  <Box style={{ width: "200px", height: "8px", background: "var(--gray-5)", borderRadius: "4px" }}>
                    <Box style={{ width: "60%", height: "100%", background: "var(--blue-9)", borderRadius: "4px" }} />
                  </Box>
                  <Text size="2" weight="bold">60%</Text>
                </Flex>
              </Flex>
              <Flex justify="between" align="center">
                <Text size="2">Analytics Services</Text>
                <Flex gap="2" align="center">
                  <Box style={{ width: "200px", height: "8px", background: "var(--gray-5)", borderRadius: "4px" }}>
                    <Box style={{ width: "25%", height: "100%", background: "var(--orange-9)", borderRadius: "4px" }} />
                  </Box>
                  <Text size="2" weight="bold">25%</Text>
                </Flex>
              </Flex>
              <Flex justify="between" align="center">
                <Text size="2">API Services</Text>
                <Flex gap="2" align="center">
                  <Box style={{ width: "200px", height: "8px", background: "var(--gray-5)", borderRadius: "4px" }}>
                    <Box style={{ width: "15%", height: "100%", background: "var(--purple-9)", borderRadius: "4px" }} />
                  </Box>
                  <Text size="2" weight="bold">15%</Text>
                </Flex>
              </Flex>
            </Flex>
          </Card>
        </Box>
      </Tabs.Content>

      <Tabs.Content value="activity">
        <Box mt="4">
          <Card>
            <Heading size="4" mb="3">Recent Activity</Heading>
            <Flex direction="column" gap="3">
              {stats.recentActivities.map((activity, idx) => (
                <Flex key={idx} justify="between" align="center" p="2" style={{ 
                  borderBottom: idx < stats.recentActivities.length - 1 ? "1px solid var(--gray-5)" : "none" 
                }}>
                  <Flex direction="column" gap="1">
                    <Text size="2" weight="bold">{activity.serviceName}</Text>
                    <Text size="1" color="gray">{activity.timestamp}</Text>
                  </Flex>
                  <Flex direction="column" align="end" gap="1">
                    <Badge color={activity.status === "success" ? "green" : "orange"}>
                      {activity.status}
                    </Badge>
                    <Text size="2" weight="bold">
                      {activity.amount === 0 ? "FREE" : `${activity.amount} SUI`}
                    </Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Card>
        </Box>
      </Tabs.Content>

      <Tabs.Content value="spending">
        <Box mt="4">
          <Grid columns="2" gap="3">
            <Card>
              <Heading size="4" mb="2">Monthly Spending</Heading>
              <Flex direction="column" gap="2">
                <Flex justify="between">
                  <Text size="2">This Month</Text>
                  <Text size="2" weight="bold">5.2 SUI</Text>
                </Flex>
                <Flex justify="between">
                  <Text size="2">Last Month</Text>
                  <Text size="2" weight="bold">7.3 SUI</Text>
                </Flex>
                <Flex justify="between">
                  <Text size="2">Average</Text>
                  <Text size="2" weight="bold">6.25 SUI</Text>
                </Flex>
              </Flex>
            </Card>

            <Card>
              <Heading size="4" mb="2">Most Used Services</Heading>
              <Flex direction="column" gap="2">
                <Flex justify="between">
                  <Text size="2">1. AI Text Generation</Text>
                  <Badge color="blue">15 uses</Badge>
                </Flex>
                <Flex justify="between">
                  <Text size="2">2. Image Processing</Text>
                  <Badge color="blue">12 uses</Badge>
                </Flex>
                <Flex justify="between">
                  <Text size="2">3. Data Analytics</Text>
                  <Badge color="blue">8 uses</Badge>
                </Flex>
              </Flex>
            </Card>
          </Grid>
        </Box>
      </Tabs.Content>
    </Tabs.Root>
  );
}

interface AdminDashboardProps {
  services: ServiceStats[];
  totalRevenue: number;
  totalUsage: number;
  topServices: ServiceStats[];
}

function AdminDashboard({ services, totalRevenue, totalUsage, topServices }: AdminDashboardProps) {
  return (
    <Tabs.Root defaultValue="overview">
      <Tabs.List>
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="services">Services</Tabs.Trigger>
        <Tabs.Trigger value="revenue">Revenue</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="overview">
        <Box mt="4">
          <Grid columns="3" gap="3">
            <Card style={{ background: "var(--green-a2)" }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <RocketIcon />
                  <Text size="2" color="gray">Total Revenue</Text>
                </Flex>
                <Text size="6" weight="bold">{totalRevenue.toFixed(2)} SUI</Text>
                <Badge color="green" size="1">+12.5% this week</Badge>
              </Flex>
            </Card>

            <Card style={{ background: "var(--blue-a2)" }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <ActivityLogIcon />
                  <Text size="2" color="gray">Total Usage</Text>
                </Flex>
                <Text size="6" weight="bold">{totalUsage}</Text>
                <Badge color="blue" size="1">All services</Badge>
              </Flex>
            </Card>

            <Card style={{ background: "var(--orange-a2)" }}>
              <Flex direction="column" gap="2">
                <Flex align="center" gap="2">
                  <BarChartIcon />
                  <Text size="2" color="gray">Active Services</Text>
                </Flex>
                <Text size="6" weight="bold">{services.length}</Text>
                <Badge color="orange" size="1">Marketplace</Badge>
              </Flex>
            </Card>
          </Grid>

          <Card mt="4">
            <Heading size="4" mb="3">Top Performing Services</Heading>
            <Flex direction="column" gap="3">
              {topServices.map((service, idx) => (
                <Flex key={service.id} justify="between" align="center" p="2" style={{ 
                  borderBottom: idx < topServices.length - 1 ? "1px solid var(--gray-5)" : "none" 
                }}>
                  <Flex align="center" gap="3">
                    <Text size="3" weight="bold" color="gray">#{idx + 1}</Text>
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="bold">{service.name}</Text>
                      <Badge color="blue" size="1">{service.category}</Badge>
                    </Flex>
                  </Flex>
                  <Flex direction="column" align="end" gap="1">
                    <Text size="2" weight="bold">{service.usage} uses</Text>
                    <Text size="1" color="gray">{service.revenue} SUI earned</Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Card>
        </Box>
      </Tabs.Content>

      <Tabs.Content value="services">
        <Box mt="4">
          <Card>
            <Heading size="4" mb="3">All Services</Heading>
            <Flex direction="column" gap="2">
              {services.map((service) => (
                <Flex key={service.id} justify="between" align="center" p="3" style={{ 
                  background: "var(--gray-a2)", 
                  borderRadius: "6px" 
                }}>
                  <Flex direction="column" gap="1">
                    <Flex align="center" gap="2">
                      <Text size="2" weight="bold">{service.name}</Text>
                      <Badge color="blue" size="1">{service.category}</Badge>
                      {service.trend === "up" && <Text size="1">📈</Text>}
                      {service.trend === "down" && <Text size="1">📉</Text>}
                      {service.trend === "stable" && <Text size="1">➡️</Text>}
                    </Flex>
                    <Text size="1" color="gray">
                      ID: {service.id} • {service.usage} total uses
                    </Text>
                  </Flex>
                  <Flex direction="column" align="end" gap="1">
                    <Text size="2" weight="bold">{service.revenue} SUI</Text>
                    <Text size="1" color="gray">revenue</Text>
                  </Flex>
                </Flex>
              ))}
            </Flex>
          </Card>
        </Box>
      </Tabs.Content>

      <Tabs.Content value="revenue">
        <Box mt="4">
          <Grid columns="2" gap="3">
            <Card>
              <Heading size="4" mb="2">Revenue Breakdown</Heading>
              <Flex direction="column" gap="2">
                {services.filter(s => s.revenue > 0).map((service) => (
                  <Flex key={service.id} justify="between" align="center">
                    <Text size="2">{service.name}</Text>
                    <Text size="2" weight="bold">{service.revenue} SUI</Text>
                  </Flex>
                ))}
                <Box style={{ borderTop: "2px solid var(--gray-6)", marginTop: "8px", paddingTop: "8px" }}>
                  <Flex justify="between" align="center">
                    <Text size="2" weight="bold">Total</Text>
                    <Text size="2" weight="bold">{totalRevenue.toFixed(2)} SUI</Text>
                  </Flex>
                </Box>
              </Flex>
            </Card>

            <Card>
              <Heading size="4" mb="2">Withdraw Revenue</Heading>
              <Flex direction="column" gap="3">
                <Box>
                  <Text size="2" color="gray" mb="1">Available Balance</Text>
                  <Text size="5" weight="bold">{totalRevenue.toFixed(2)} SUI</Text>
                </Box>
                <Button size="3" style={{ width: "100%" }}>
                  Withdraw All Revenue
                </Button>
                <Text size="1" color="gray">
                  Revenue will be transferred to the admin address registered during marketplace deployment.
                </Text>
              </Flex>
            </Card>
          </Grid>
        </Box>
      </Tabs.Content>
    </Tabs.Root>
  );
}
