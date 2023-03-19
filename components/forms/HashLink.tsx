function classNames(...classes) { return classes.filter(Boolean).join(' '); }
import UnstyledLink from './UnstyledLink';

export default function HashLink({ className = '', children, ...rest }) {
	return (
		<UnstyledLink
			{...rest}
			className={classNames(
				'inline-block font-bold focus:outline-none hash-anchor',
				className
			)}
		>
			{children}
		</UnstyledLink>
	);
}
