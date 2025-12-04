import type { Meta, StoryObj } from "@storybook/react"

import { Hero } from "./Hero"

const meta: Meta<typeof Hero> = {
  component: Hero,
  decorators: (Story) => <Story />,
}

export default meta
type Story = StoryObj<typeof Hero>

export const FirstStory: Story = {
  args: {
    heading: "Get anything you need",
    paragraph: "Get anything you need from the community market, or sign up to provide for your community.",
    image: "/images/hero/Image.jpg",
    buttons: [
      { label: "Provide for your community", path: "#" },
      { label: "Get what you need", path: "3" },
    ],
  },
}
