import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties } from "react";
import { geometryShapes } from "./geometry";

const colors = [
	["Background", "--ts-background"],
	["Surface", "--ts-surface"],
	["Surface subtle", "--ts-surface-subtle"],
	["Surface raised", "--ts-surface-raised"],
	["Ink", "--ts-ink"],
	["Pink", "--ts-pink"],
	["Cyan", "--ts-cyan"],
	["Yellow", "--ts-yellow"],
	["Green", "--ts-green"],
	["Red", "--ts-red"],
] as const;

const contentTypes = [
	["Branch", "--ts-branch"],
	["Scene", "--ts-scene"],
	["Frame", "--ts-frame"],
	["Keyframe", "--ts-keyframe"],
	["Element", "--ts-element"],
	["Trigger", "--ts-trigger"],
	["Part", "--ts-part"],
	["Entry", "--ts-entry"],
	["Page", "--ts-page"],
] as const;

const meta = {
	parameters: {
		controls: { disable: true },
		docs: {
			description: {
				component:
					"Production Talescape tokens and geometry. These examples read the same CSS variables used by application components.",
			},
		},
	},
	tags: ["autodocs"],
	title: "Design System/Foundations/Overview",
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function TokenSection({
	children,
	title,
}: {
	children: React.ReactNode;
	title: string;
}) {
	return (
		<section className="grid gap-4 border-ts-border-muted border-b pb-8">
			<h2 className="font-display text-2xl uppercase">{title}</h2>
			{children}
		</section>
	);
}

function ColorGrid({
	items,
}: {
	items: ReadonlyArray<readonly [string, string]>;
}) {
	return (
		<div className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-3">
			{items.map(([label, token]) => (
				<div
					className="overflow-hidden border border-ts-border bg-ts-surface shadow-[var(--ts-shadow-subtle)]"
					key={token}
				>
					<div
						className="h-16 border-ts-border-muted border-b"
						style={{ background: `var(${token})` }}
					/>
					<div className="p-3">
						<p className="font-bold text-sm">{label}</p>
						<code className="text-ts-text-muted text-xs">{token}</code>
					</div>
				</div>
			))}
		</div>
	);
}

export const Colors: Story = {
	render: () => (
		<div className="grid gap-8">
			<TokenSection title="Core colors">
				<ColorGrid items={colors} />
			</TokenSection>
			<TokenSection title="Content types">
				<ColorGrid items={contentTypes} />
			</TokenSection>
		</div>
	),
};

export const Typography: Story = {
	render: () => (
		<TokenSection title="Typography">
			<div className="grid gap-5">
				<p className="font-display text-5xl uppercase">Ideas into worlds.</p>
				<h1 className="font-display text-4xl uppercase">
					Talescape heading one
				</h1>
				<h2 className="font-display text-3xl uppercase">
					Talescape heading two
				</h2>
				<h3 className="font-bold text-xl">Compact interface heading</h3>
				<p className="max-w-2xl text-base">
					Body text remains quiet and readable so expressive headers and actions
					can carry the visual identity without overwhelming dense editor tools.
				</p>
				<p className="font-black text-primary text-xs uppercase">
					Overline and metadata label
				</p>
			</div>
		</TokenSection>
	),
};

export const SpacingRadiusAndShadows: Story = {
	render: () => (
		<div className="grid gap-8">
			<TokenSection title="Spacing">
				<div className="grid gap-3">
					{[2, 4, 8, 12, 16, 24, 32, 48, 64].map((size) => (
						<div className="flex items-center gap-3" key={size}>
							<code className="w-10 text-xs">{size}px</code>
							<div className="h-4 bg-ts-cyan" style={{ width: `${size}px` }} />
						</div>
					))}
				</div>
			</TokenSection>
			<TokenSection title="Radius and shadows">
				<div className="flex flex-wrap gap-7">
					{[
						["Sharp", "--ts-radius-none", "--ts-shadow-none"],
						["Subtle", "--ts-radius-xs", "--ts-shadow-subtle"],
						["Raised", "--ts-radius-sm", "--ts-shadow-raised"],
						["Comic", "--ts-radius-md", "--ts-shadow-comic"],
					].map(([label, radius, shadow]) => (
						<div
							className="grid h-28 w-40 place-items-center border-2 border-ts-border-strong bg-ts-surface"
							key={label}
							style={{
								borderRadius: `var(${radius})`,
								boxShadow: `var(${shadow})`,
							}}
						>
							{label}
						</div>
					))}
				</div>
			</TokenSection>
		</div>
	),
};

export const Geometry: Story = {
	render: () => (
		<TokenSection title="Angular geometry">
			<div className="grid grid-cols-[repeat(auto-fit,minmax(11rem,1fr))] gap-5">
				{geometryShapes.map((shape) => (
					<div
						className="ts-geometry ts-geometry-clip grid h-20 place-items-center bg-ts-surface-dark px-5 font-black text-ts-text-inverse text-xs uppercase"
						data-ts-shape={shape}
						data-ts-slant="lg"
						key={shape}
					>
						{shape}
					</div>
				))}
			</div>
		</TokenSection>
	),
};

export const Motion: Story = {
	render: () => (
		<TokenSection title="Motion">
			<div className="flex flex-wrap gap-5">
				{[
					["Fast", "--ts-duration-fast"],
					["Default", "--ts-duration-default"],
					["Slow", "--ts-duration-slow"],
				].map(([label, duration]) => (
					<button
						type="button"
						className="hover:-translate-y-1 border-2 border-ts-border-strong bg-ts-surface px-5 py-3 font-black text-xs uppercase hover:bg-ts-yellow hover:shadow-[var(--ts-shadow-comic)]"
						key={label}
						style={
							{
								transitionDuration: `var(${duration})`,
								transitionProperty: "transform, background-color, box-shadow",
								transitionTimingFunction: "var(--ts-ease-standard)",
							} as CSSProperties
						}
					>
						{label}
					</button>
				))}
			</div>
		</TokenSection>
	),
};
