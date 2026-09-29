import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import Input from "./input";
import Label from "./label";
import { Radio, RadioGroup } from "./radio-group";
import { SearchField } from "./search-field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./select";
import { Slider } from "./slider";
import { Switch } from "./switch";
import Textarea from "./textarea";

function ControlsShowcase(): React.JSX.Element {
	return (
		<div className="grid max-w-xl gap-6">
			<div className="grid gap-2">
				<Label htmlFor="title">Tale title</Label>
				<Input id="title" placeholder="The Ember Archive" />
			</div>
			<div className="grid gap-2">
				<Label htmlFor="summary">Summary</Label>
				<Textarea id="summary" placeholder="Describe this part of the tale" />
			</div>
			<SearchField placeholder="Search scenes and elements" />
			<Select aria-label="Scene layout" defaultValue="grid">
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Choose layout" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="stack">Stack</SelectItem>
					<SelectItem value="grid">Grid</SelectItem>
					<SelectItem value="free">Free</SelectItem>
				</SelectContent>
			</Select>
			<div className="flex flex-wrap gap-5">
				<Checkbox defaultSelected>Visible in Reader</Checkbox>
				<Switch defaultSelected>Snap camera</Switch>
			</div>
			<RadioGroup aria-label="Layout mode" defaultValue="grid">
				<Radio value="stack">Stack</Radio>
				<Radio value="grid">Grid</Radio>
				<Radio value="free">Free</Radio>
			</RadioGroup>
			<Slider defaultValue={40} label="Scene spacing" maxValue={100} />
		</div>
	);
}

function FormSubmissionShowcase(): React.JSX.Element {
	const [result, setResult] = useState("");

	return (
		<form
			className="grid max-w-sm gap-4"
			onSubmit={(event) => {
				event.preventDefault();
				const data = new FormData(event.currentTarget);
				setResult(
					`visibility=${String(data.get("visibility"))}; editable=${String(data.get("editable"))}`,
				);
			}}
		>
			<Select name="visibility" aria-label="Visibility" defaultValue="private">
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="private">Private</SelectItem>
					<SelectItem value="public">Public</SelectItem>
				</SelectContent>
			</Select>
			<Checkbox name="editable" value="true" defaultSelected>
				Editable
			</Checkbox>
			<Button type="submit">Submit form</Button>
			<output aria-live="polite">{result}</output>
		</form>
	);
}

const meta = {
	component: ControlsShowcase,
	parameters: {
		docs: {
			description: {
				component:
					"Accessible Talescape form primitives backed by React Aria. Default density serves application forms; compact density is designed for Studio inspectors and tool panels.",
			},
		},
	},
	tags: ["autodocs"],
	title: "Design System/Primitives/Form Controls",
} satisfies Meta<typeof ControlsShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {};

export const CompactStudioDensity: Story = {
	render: () => (
		<div className="grid max-w-sm gap-4 border-2 border-foreground bg-background p-3">
			<div className="grid gap-1">
				<Label htmlFor="scene-name" className="text-[10px] uppercase">
					Scene name
				</Label>
				<Input
					id="scene-name"
					density="compact"
					defaultValue="The Ember Archive"
				/>
			</div>
			<Textarea density="compact" defaultValue="Opening scene" />
			<SearchField density="compact" placeholder="Filter elements" />
			<Select aria-label="Compact layout" defaultValue="grid">
				<SelectTrigger density="compact" className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="stack">Stack</SelectItem>
					<SelectItem value="grid">Grid</SelectItem>
				</SelectContent>
			</Select>
			<Checkbox density="compact" defaultSelected>
				Show during bridge
			</Checkbox>
			<Switch density="compact">Enable intro</Switch>
			<Slider
				density="compact"
				defaultValue={200}
				label="Intro length"
				maxValue={1000}
				step={50}
			/>
		</div>
	),
};

export const Disabled: Story = {
	render: () => (
		<div className="grid max-w-sm gap-4">
			<Input disabled value="Locked title" readOnly />
			<Textarea disabled value="Locked description" readOnly />
			<Checkbox isDisabled>Unavailable option</Checkbox>
			<Switch isDisabled>Unavailable setting</Switch>
			<Slider isDisabled value={30} label="Locked value" />
		</div>
	),
};

export const Invalid: Story = {
	render: () => (
		<div className="grid max-w-sm gap-4">
			<Input aria-invalid="true" defaultValue="Invalid value" />
			<Textarea aria-invalid="true" defaultValue="Invalid description" />
		</div>
	),
};

export const EmptyAndResponsive: Story = {
	render: () => (
		<div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
			<Input placeholder="Empty text field" />
			<SearchField placeholder="Empty search field" />
		</div>
	),
};

export const KeyboardAndChangeInteractions: Story = {
	render: () => {
		const onChange = fn();
		return (
			<div className="grid max-w-sm gap-4">
				<Input aria-label="Editable title" onChange={onChange} />
				<Checkbox onChange={onChange}>Include scene</Checkbox>
				<Switch onChange={onChange}>Enable transition</Switch>
			</div>
		);
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole("textbox", { name: "Editable title" });
		await userEvent.type(input, "Ember");
		await expect(input).toHaveValue("Ember");

		const checkbox = canvas.getByRole("checkbox", { name: "Include scene" });
		await userEvent.click(checkbox);
		await expect(checkbox).toBeChecked();

		const toggle = canvas.getByRole("switch", { name: "Enable transition" });
		await userEvent.click(toggle);
		await expect(toggle).toBeChecked();
	},
};

export const SelectInteraction: Story = {
	render: () => (
		<div className="max-w-sm">
			<Select aria-label="Layout choice" defaultValue="stack">
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="stack">Stack</SelectItem>
					<SelectItem value="grid">Grid</SelectItem>
					<SelectItem value="free">Free</SelectItem>
				</SelectContent>
			</Select>
		</div>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole("button");
		await userEvent.click(trigger);
		await userEvent.click(
			await within(document.body).findByRole("option", { name: "Free" }),
		);
		await expect(trigger).toHaveTextContent("Free");
	},
};

export const FormSubmission: Story = {
	render: () => <FormSubmissionShowcase />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByRole("button", { name: "Submit form" }));
		await expect(canvas.getByRole("status")).toHaveTextContent(
			"visibility=private; editable=true",
		);
	},
};
