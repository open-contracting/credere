import type { Meta, StoryObj } from "@storybook/react-vite";

import LinkButton from "./LinkButton";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/LinkButton",
  component: LinkButton,
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: 'color' },
    icon: {
      table: {
        disable: true,
      },
    },
  },
} satisfies Meta<typeof LinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
  args: {
    label: "Link Button",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: "Link Button",
  },
};
