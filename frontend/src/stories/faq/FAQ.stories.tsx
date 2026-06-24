import type { Meta, StoryObj } from "@storybook/react-vite";

import FAQContainer from "./FAQContainer";
import { FAQSection } from "./FAQSection";

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: "Example/FAQContainer",
  component: FAQContainer,
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof FAQContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

function ComponentWithChildren() {
  return (
    <FAQContainer>
      <FAQSection title="FAQSection 1">
        Guaranteed loans give high-risk borrowers a way to access financing, and provide protection for the lender.
      </FAQSection>
      <FAQSection title="FAQSection 2">
        The City of Bogota is trying to encourage more SME participation in public sector contracts. Your businesses
        was identified as an SME.
      </FAQSection>
      <FAQSection title="FAQSection 3">
        This project is being run by the Open Contracting Partnership in conjunction with Mastercard. We have partnered
        with Colombian banks such as Bancolombia who are providing the credit offer..
      </FAQSection>
    </FAQContainer>
  );
}

export const Default: Story = {
  args: {},
  render: () => <ComponentWithChildren />,
};
