import type { Meta, StoryObj } from "@storybook/react-vite";

import Text from "./Text";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/Text",
  component: Text,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

function ComponentWithChildren() {
  return <Text> Forgot Password? </Text>;
}

export const Default: Story = {
  args: {},
  render: () => <ComponentWithChildren />,
};

export const Link: Story = {
  args: {
    className: "underline",
  },
  render: () => <ComponentWithChildren />,
};
