function classNames(...classes) { return classes.filter(Boolean).join(' '); }


export default function Button({ children = undefined, className = '', text = "Button", ...rest }) {
	return (
		<button
			{...rest}
			className={classNames(
				'mr-2 inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
				className
			)}
		>
			{children || text}
		</button>
	);
}
