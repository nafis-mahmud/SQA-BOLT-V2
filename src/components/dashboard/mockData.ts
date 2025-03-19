import { ProjectCardProps } from "./ProjectCard";

// Mock data for demonstration
export let categories = [
  { id: "all", name: "All Projects", count: 12 },
  { id: "manual-testing", name: "Manual Testing", count: 7 },
  { id: "automation-testing", name: "Automation Testing (AI Agent)", count: 5 },
];

export const mockProjects: ProjectCardProps[] = [
  {
    id: "1",
    title: "E-commerce Website Testing",
    description:
      "Comprehensive manual testing of the e-commerce website including checkout flow and user account features.",
    category: "Manual Testing",
    resources: 12,
    flows: 8,
    datasets: 5,
    dashboards: 3,
    teamMembers: [
      {
        id: "1",
        name: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      },
      {
        id: "2",
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      },
      {
        id: "3",
        name: "Bob Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      },
      {
        id: "4",
        name: "Alice Brown",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
      },
    ],
    lastUpdated: "2 days ago",
  },
  {
    id: "2",
    title: "Login Flow Automation",
    description:
      "Automated testing of user authentication flows using AI-powered test generation.",
    category: "Automation Testing (AI Agent)",
    resources: 8,
    flows: 5,
    datasets: 3,
    dashboards: 2,
    teamMembers: [
      {
        id: "2",
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      },
      {
        id: "5",
        name: "Mike Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      },
    ],
    lastUpdated: "1 week ago",
  },
  {
    id: "3",
    title: "Mobile App Regression Testing",
    description:
      "Manual regression testing suite for the iOS and Android mobile applications.",
    category: "Manual Testing",
    resources: 6,
    flows: 4,
    datasets: 2,
    dashboards: 1,
    teamMembers: [
      {
        id: "1",
        name: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      },
      {
        id: "3",
        name: "Bob Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      },
      {
        id: "6",
        name: "Sarah Lee",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      },
    ],
    lastUpdated: "3 days ago",
  },
  {
    id: "4",
    title: "API Integration Tests",
    description:
      "Automated testing of RESTful API endpoints with AI-generated test cases and assertions.",
    category: "Automation Testing (AI Agent)",
    resources: 10,
    flows: 6,
    datasets: 4,
    dashboards: 2,
    teamMembers: [
      {
        id: "4",
        name: "Alice Brown",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
      },
      {
        id: "5",
        name: "Mike Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      },
    ],
    lastUpdated: "5 days ago",
  },
  {
    id: "5",
    title: "Payment Gateway Testing",
    description:
      "Manual testing of payment gateway integrations with various credit card providers.",
    category: "Manual Testing",
    resources: 7,
    flows: 3,
    datasets: 5,
    dashboards: 2,
    teamMembers: [
      {
        id: "2",
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      },
      {
        id: "6",
        name: "Sarah Lee",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      },
    ],
    lastUpdated: "2 weeks ago",
  },
  {
    id: "6",
    title: "Cross-browser Compatibility Tests",
    description:
      "Automated testing across multiple browsers and screen sizes using AI-powered visual comparison.",
    category: "Automation Testing (AI Agent)",
    resources: 9,
    flows: 4,
    datasets: 6,
    dashboards: 3,
    teamMembers: [
      {
        id: "1",
        name: "John Doe",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      },
      {
        id: "3",
        name: "Bob Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=bob",
      },
      {
        id: "5",
        name: "Mike Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
      },
    ],
    lastUpdated: "1 day ago",
  },
];
