import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tab, TabList, TabPanel, Tabs } from "./tabs";
const meta = {
	title: "Design System/Navigation/Tabs",
	component: Tabs,
	tags: ["autodocs"],
	args: {
		children: null,
		defaultSelectedKey: "details",
		orientation: "horizontal",
		keyboardActivation: "automatic",
		isDisabled: false,
	},
	render: (args) => (
		<Tabs {...args}>
			<TabList aria-label="Sections">
				<Tab id="details">Details</Tab>
				<Tab id="motion">Motion</Tab>
				<Tab id="style">Style</Tab>
			</TabList>
			<TabPanel id="details">Scene details</TabPanel>
			<TabPanel id="motion">Scene motion</TabPanel>
			<TabPanel id="style">Scene style</TabPanel>
		</Tabs>
	),
} satisfies Meta<typeof Tabs>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Editor: Story = { parameters: { componentEditor: true } };
export const Disabled: Story = { args: { isDisabled: true } };
