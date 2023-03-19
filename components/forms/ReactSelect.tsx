import { Controller, useFormContext } from 'react-hook-form';
import Select from 'react-select';

export default function ReactSelect({
	disabled = undefined,
	label,
	helperText,
	id,
	placeholder = undefined,
	validation = undefined,
	options,
	defaultValue = undefined,
}) {
	const customStyles = {
		control: (styles, state) => ({
			...styles,
			border: state.isFocused ? '0' : '1px solid rgb(209, 213, 219)',
			boxShadow: state.isFocused ? '0 0 0 0.1rem rgb(0, 196, 253)' : 0,
			'*': {
				boxShadow: 'none !important',
			},
		}),
		option: (styles, state) => ({
			...styles,
			color: 'black',
			background: state.isSelected ? '#D1D5DB' : 'white',
			':hover': {
				background: '#E5E7EB',
			},
		}),
	};

	const errorStyles = {
		control: (styles) => ({
			...styles,
			border: 'none',
			boxShadow: '0 0 0 0.04rem #EF4444',
			'*': {
				boxShadow: 'none !important',
			},
		}),
		option: (styles, state) => ({
			...styles,
			color: 'black',
			background: state.isSelected ? '#D1D5DB' : 'white',
			':hover': {
				background: '#E5E7EB',
			},
		}),
	};

	const optionsObject = options.map((option) => {
		return {
			value: option,
			label: option,
		};
	});

	const {
		control,
		formState: { errors },
	} = useFormContext();

	return (
		<div>
			<label htmlFor={id} className='block text-sm font-normal text-gray-700'>
				{label}
			</label>
			<div className='relative mt-1'>
				<Controller
					name={id}
					//@ts-ignore
					id={id}
					isClearable
					defaultValue={
						defaultValue ? { value: defaultValue, label: defaultValue } : ''
					}
					control={control}
					rules={validation}
					render={({ field }) => {
						const styles = errors[id] ? errorStyles : customStyles;
						return (
							<Select
								{...field}
								isDisabled={disabled}
								placeholder={placeholder}
								options={optionsObject}
								styles={styles}
							/>
						);
					}}
				/>
				<div className='mt-1'>
					{helperText && <p className='text-xs text-gray-500'>{helperText}</p>}
					{errors[id] && (
						//@ts-ignore
						<span className='text-sm text-red-500'>{errors[id].message}</span>
					)}
				</div>
			</div>
		</div>
	);
}
