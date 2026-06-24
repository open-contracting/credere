import type { Meta, StoryObj } from "@storybook/react-vite";

import DashboardItemContainer from "./DashboardItemContainer";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/DashboardItemContainer",
  component: DashboardItemContainer,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof DashboardItemContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    description: "Application(s) received",
    value: "15",
  },
};

export const Red: Story = {
  args: {
    description: "Application(s) received",
    value: "15",
    color: "red",
  },
};
