import { Box, Card, Flex, Heading, Text, Grid } from "@radix-ui/themes";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const mockData = [
  { month: "Jan", tvl: 2400, users: 240 },
  { month: "Feb", tvl: 3210, users: 321 },
  { month: "Mar", tvl: 2290, users: 229 },
  { month: "Apr", tvl: 2000, users: 200 },
  { month: "May", tvl: 2181, users: 218 },
  { month: "Jun", tvl: 2500, users: 250 },
];

export function OverviewPanel() {
  return (
    <Box>
      <Heading size="5" style={{ marginBottom: "2rem", color: "#e0e7ff" }}>
        Ecosystem Overview
      </Heading>

      <Grid columns="2" gap="4" style={{ marginBottom: "2rem" }}>
        <Card
          style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #2d1b69 100%)",
            border: "1px solid #3b3366",
          }}
        >
          <Flex direction="column" gap="2">
            <Text size="2" style={{ color: "#a5b4fc" }}>
              Total Value Locked
            </Text>
            <Text size="7" style={{ fontWeight: "bold", color: "#e0e7ff" }}>
              $2.5M
            </Text>
            <Text size="1" style={{ color: "#7c3aed" }}>
              ↑ 12.5% from last month
            </Text>
          </Flex>
        </Card>

        <Card
          style={{
            background: "linear-gradient(135deg, #1a2e4a 0%, #1e3a5f 100%)",
            border: "1px solid #1e4976",
          }}
        >
          <Flex direction="column" gap="2">
            <Text size="2" style={{ color: "#7dd3fc" }}>
              Active Users
            </Text>
            <Text size="7" style={{ fontWeight: "bold", color: "#e0e7ff" }}>
              1,250
            </Text>
            <Text size="1" style={{ color: "#06b6d4" }}>
              ↑ 8.3% from last month
            </Text>
          </Flex>
        </Card>

        <Card
          style={{
            background: "linear-gradient(135deg, #1a2e1a 0%, #1e4620 100%)",
            border: "1px solid #166534",
          }}
        >
          <Flex direction="column" gap="2">
            <Text size="2" style={{ color: "#86efac" }}>
              Total Transactions
            </Text>
            <Text size="7" style={{ fontWeight: "bold", color: "#e0e7ff" }}>
              8,432
            </Text>
            <Text size="1" style={{ color: "#22c55e" }}>
              ↑ 24.1% from last month
            </Text>
          </Flex>
        </Card>

        <Card
          style={{
            background: "linear-gradient(135deg, #2e1b2e 0%, #4a1a4a 100%)",
            border: "1px solid #6b21a8",
          }}
        >
          <Flex direction="column" gap="2">
            <Text size="2" style={{ color: "#f472b6" }}>
              Trading Volume
            </Text>
            <Text size="7" style={{ fontWeight: "bold", color: "#e0e7ff" }}>
              $15.8M
            </Text>
            <Text size="1" style={{ color: "#ec4899" }}>
              ↑ 31.2% from last month
            </Text>
          </Flex>
        </Card>
      </Grid>

      <Card
        style={{
          background: "rgba(30, 27, 75, 0.3)",
          border: "1px solid #3b3366",
          padding: "2rem",
          marginBottom: "2rem",
        }}
      >
        <Heading size="4" style={{ marginBottom: "1rem", color: "#e0e7ff" }}>
          TVL Trend
        </Heading>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3b3366" />
            <XAxis dataKey="month" stroke="#a5b4fc" />
            <YAxis stroke="#a5b4fc" />
            <Tooltip
              contentStyle={{
                background: "#1e1b4b",
                border: "1px solid #3b3366",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#e0e7ff" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="tvl"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: "#8b5cf6", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card
        style={{
          background: "rgba(30, 27, 75, 0.3)",
          border: "1px solid #3b3366",
          padding: "2rem",
        }}
      >
        <Heading size="4" style={{ marginBottom: "1rem", color: "#e0e7ff" }}>
          User Growth
        </Heading>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3b3366" />
            <XAxis dataKey="month" stroke="#a5b4fc" />
            <YAxis stroke="#a5b4fc" />
            <Tooltip
              contentStyle={{
                background: "#1e1b4b",
                border: "1px solid #3b3366",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#e0e7ff" }}
            />
            <Legend />
            <Bar dataKey="users" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </Box>
  );
}
