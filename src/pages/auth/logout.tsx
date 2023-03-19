import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useRouter } from 'next/router'


export default function Component() {
	const router = useRouter()
	const supabase = useSupabaseClient()

	const logout = async () => {
		const { error } = await supabase.auth.signOut()
		if (!error) router.push('/auth/login')


	}

	logout()

	return null
}

