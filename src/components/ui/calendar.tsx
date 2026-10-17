"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import {
	Calendar as AriaCalendar,
	Button,
	CalendarCell,
	CalendarGrid,
	CalendarGridBody,
	CalendarGridHeader,
	CalendarHeaderCell,
	Heading,
} from "react-aria-components";

export function Calendar(
	props: Omit<ComponentProps<typeof AriaCalendar>, "className" | "children">,
): React.JSX.Element {
	return (
		<AriaCalendar
			data-reader-component="Calendar"
			data-reader-role="calendar-control"
			{...props}
			aria-label={props["aria-label"] ?? "Choose date"}
			className="w-fit max-w-full border-2 border-foreground bg-card p-3 text-card-foreground shadow-[var(--ts-shadow-comic)] data-[disabled]:opacity-50"
		>
			<header className="mb-3 flex items-center justify-between gap-2">
				<Button
					slot="previous"
					aria-label="Previous month"
					className="grid size-8 place-items-center border border-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
				>
					<ChevronLeft size={16} />
				</Button>
				<Heading className="font-bold text-sm" />
				<Button
					slot="next"
					aria-label="Next month"
					className="grid size-8 place-items-center border border-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
				>
					<ChevronRight size={16} />
				</Button>
			</header>
			<CalendarGrid>
				<CalendarGridHeader>
					{(day) => (
						<CalendarHeaderCell className="pb-2 text-muted-foreground text-xs">
							{day}
						</CalendarHeaderCell>
					)}
				</CalendarGridHeader>
				<CalendarGridBody>
					{(date) => (
						<CalendarCell
							date={date}
							className="grid size-8 cursor-pointer place-items-center border border-transparent text-sm outline-none hover:bg-accent data-[selected]:border-foreground data-[selected]:bg-primary data-[selected]:font-black data-[outside-month]:text-muted-foreground data-[selected]:text-primary-foreground data-[unavailable]:line-through data-[disabled]:opacity-30 data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring"
						/>
					)}
				</CalendarGridBody>
			</CalendarGrid>
		</AriaCalendar>
	);
}
