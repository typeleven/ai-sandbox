import { useFormContext } from 'react-hook-form';
import { HiExclamationCircle } from 'react-icons/hi';

function classNames(...classes) { return classes.filter(Boolean).join(' '); }

export default function TextArea({
	label,
	placeholder = '',
	helperText = '',
	id,
	type = 'text',
	readOnly = false,
	validation = undefined,
	...rest
}) {
	const {
		register,
		formState: { errors },
	} = useFormContext();

	return (
		<div>
			<label htmlFor={id} className='block text-sm font-normal text-gray-700'>
				{label}
			</label>
			<div className='relative mt-1'>
				<textarea
					{...register(id, validation)}
					rows={3}
					{...rest}
					//@ts-ignore
					type={type}
					name={id}
					id={id}
					readOnly={readOnly}
					className={classNames(
						readOnly
							? 'bg-gray-100 focus:ring-0 cursor-not-allowed border-gray-300 focus:border-gray-300'
							: errors[id]
								? 'focus:ring-red-500 border-red-500 focus:border-red-500'
								: 'focus:ring-primary-500 border-gray-300 focus:border-primary-500',
						'block w-full rounded-md shadow-sm'
					)}
					placeholder={placeholder}
					aria-describedby={id}
				/>
				{errors[id] && (
					<div className='absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none'>
						<HiExclamationCircle className='text-xl text-red-500' />
					</div>
				)}
			</div>
			<div className='mt-1'>
				{helperText !== '' && (
					<p className='text-xs text-gray-500'>{helperText}</p>
				)}
				{errors[id] && (
					//@ts-ignore
					<span className='text-sm text-red-500'>{errors[id].message}</span>
				)}
			</div>
		</div>
	);
}
