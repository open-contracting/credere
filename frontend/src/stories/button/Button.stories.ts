import type { Meta, StoryObj } from "@storybook/react-vite";

import Button from "./Button";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    // backgroundColor: { control: 'color' },
    icon: {
      table: {
        disable: true,
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Primary: Story = {
  args: {
    label: "Button",
  },
};

export const PrimaryDisabled: Story = {
  args: {
    label: "Button",
    disabled: true,
  },
};

export const Secondary: Story = {
  args: {
    primary: false,
    label: "Button",
  },
};

export const Large: Story = {
  args: {
    size: "large",
    label: "Large Default Button",
  },
};

export const Small: Story = {
  args: {
    size: "small",
    label: "Small Button",
  },
};

export const WithoutIcon: Story = {
  args: {
    noIcon: true,
    primary: false,
    label: "No Icon Button",
  },
};
