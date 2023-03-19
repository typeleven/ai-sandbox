import Input from '@components/forms/Input';
import Button from '@components/forms/Button';
import { FormProvider } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/router'

import { useState } from 'react'
import Link from 'next/link';

export default function Component() {
	const router = useRouter()
	const supabase = useSupabaseClient()
	const session = useSession()
	const methods = useForm({ mode: 'onTouched' });
	const { handleSubmit } = methods;

	console.log({ supabase, session })

	const [result, setResult] = useState(null)

	const onSubmit = async (formData) => {


		const { data, error } = await supabase.auth.signInWithPassword({
			email: formData.email,
			password: formData.password,
		})

		setResult({ data, error })

		if (!error) router.push('/')

		// console.log({ data, error })
	};

	return (
		<>
			<div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
				<div className="sm:mx-auto sm:w-full sm:max-w-md">
					<h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Login to your account</h2>
				</div>

				<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
					<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
						<FormProvider {...methods}>
							<form
								onSubmit={handleSubmit(onSubmit)}
								className='max-w-sm mt-2 space-y-5'
							>
								<InputSection />
								<Button className="flex w-full justify-center" type='submit'>Login</Button>

							</form>
							{result?.error &&
								<div className='text-red-600 mt-5 inline-flex items-center'>
									<ExclamationTriangleIcon className="-ml-0.5 mr-2 h-7 w-7" />{result.error.message}
								</div>
							}
							<div className='mt-3'>
								<Link href='reset' className='text-blue-600'>Forgot your your password?</Link>
							</div>
							<div className='mt-3'>
								<Link href='signup' className='text-blue-600'>Don&apos;t have an account? Sign up</Link>
							</div>
						</FormProvider>
					</div>
				</div>
			</div>
		</>
	)
}

function InputSection() {
	return (
		<section id='text-input' className='space-y-4'>
			<div className='space-y-2' id='text-input-normal'>
				<h3 className='text-lg'>Email</h3>
				<Input id='email' type='email' />
				<h3 className='text-lg'>Password</h3>
				<Input id='password' type='password' />
			</div>
		</section>
	);
}