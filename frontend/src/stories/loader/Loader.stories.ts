import type { Meta, StoryObj } from "@storybook/react-vite";

import Loader from "./Loader";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/Loader",
  component: Loader,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
