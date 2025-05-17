import clsx from "clsx";

interface CoverPageProps {
	children?: React.ReactNode;
	className?: string;
}

function CoverPage({ children, className }: CoverPageProps) {
	return (
		<div
			className={clsx(
				"relative min-h-screen w-full bg-amber-500 pt-14 ",
				className,
			)}
		>
			{children}
		</div>
	);
}

export default CoverPage;
