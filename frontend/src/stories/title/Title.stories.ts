import type { Meta, StoryObj } from "@storybook/react-vite";

import Title from "./Title";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/Title",
  component: Title,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PageTitle: Story = {
  args: {
    label: "Page Title",
    type: "page",
  },
};

export const SectionTitle: Story = {
  args: {
    label: "Section Title",
    type: "section",
  },
};
