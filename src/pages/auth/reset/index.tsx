import Input from '@components/forms/Input';
import Button from '@components/forms/Button';
import { FormProvider } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'
import { useRouter } from 'next/router'
import type { GetServerSideProps, NextPage } from "next"
import { useState } from 'react'
import Link from 'next/link';

export const getServerSideProps = async context => ({ props: { headers: context.req.headers || null } });

export default function Component({ headers }) {
	const router = useRouter()
	const supabase = useSupabaseClient()
	const session = useSession()
	const methods = useForm({ mode: 'onTouched' });
	const { handleSubmit } = methods;

	console.log({ supabase, session, router, headers })

	const [result, setResult] = useState(null)

	const onSubmit = async (formData) => {

		const { data, error } = await supabase.auth
			.resetPasswordForEmail(formData.email, { redirectTo: `${headers.referer}/confirm` })


		console.log({ data, error })
		setResult({ data, error })

		// if (!error) router.push('/')

	};

	const SuccessMessage = () => {
		return (<>
			<div className='my-5 inline-flex items-center' >
				Check your email for password reset instructions.
			</div >
		</>
		)
	}

	const SignupForm = () => {
		return (<FormProvider {...methods}>
			<form
				onSubmit={handleSubmit(onSubmit)}
				className='max-w-sm mt-2 space-y-5'
			>
				<InputSection />
				<Button className="flex w-full justify-center" type='submit'>Send reset password instructions</Button>

			</form>
			{result?.error &&
				<div className='text-red-600 mt-5 inline-flex items-center'>
					<ExclamationTriangleIcon className="-ml-0.5 mr-2 h-7 w-7" />{result.error.message}
				</div>
			}

			<div className='mt-3'>
				<Link href='./login' className='text-blue-600'>Already have an account? Login</Link>
			</div>
		</FormProvider>)
	}

	return (
		<>
			<div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
				<div className="sm:mx-auto sm:w-full sm:max-w-md">
					<h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Password Reset</h2>
				</div>

				<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
					<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
						{result?.data && !result?.error ? <SuccessMessage /> : <SignupForm />}
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

			</div>
		</section>
	);
}