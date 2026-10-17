"use client";

import { type ReactNode, useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "~/components/ui/tabs";

export function StyleTargetTabs({
	targets,
}: {
	targets: { id: string; label: string; content: ReactNode }[];
}) {
	const [selected, setSelected] = useState(targets[0]?.id);
	return (
		<Tabs
			selectedKey={selected}
			onSelectionChange={(key) => setSelected(String(key))}
			data-reader-component="StyleTargetTabs"
			data-reader-role="style-targets"
			data-studio-component="StyleTargetTabs"
			data-studio-role="style-targets"
		>
			<TabList aria-label="Style target">
				{targets.map((target) => (
					<Tab key={target.id} id={target.id}>
						{target.label}
					</Tab>
				))}
			</TabList>
			{targets.map((target) => (
				<TabPanel key={target.id} id={target.id}>
					{target.content}
				</TabPanel>
			))}
		</Tabs>
	);
}
