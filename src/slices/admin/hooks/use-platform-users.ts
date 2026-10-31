import {
	keepPreviousData,
	queryOptions,
	useMutation,
	useQuery,
	useQueryClient,
} from '@tanstack/react-query'
import { toast } from 'sonner'
import { listPlatformUsers, setUserBanned } from '@/slices/auth/auth-client'
import { authErrorMessage } from '@/slices/auth/auth-error'

const PLATFORM_USERS_KEY = ['admin', 'users'] as const

interface PlatformUsersParams {
	page: number
	limit: number
}

export const platformUsersQueryOptions = ({ page, limit }: PlatformUsersParams) =>
	queryOptions({
		queryKey: [...PLATFORM_USERS_KEY, { page, limit }],
		queryFn: async () => {
			const { users, total } = await listPlatformUsers({ limit, offset: (page - 1) * limit })
			const totalPages = Math.ceil(total / limit)
			return { users, meta: { page, limit, total, totalPages, hasMore: page < totalPages } }
		},
		placeholderData: keepPreviousData,
		retry: false,
	})

/** One page of every user on the platform (platform admins only), most recently updated first. */
export function usePlatformUsers(params: PlatformUsersParams) {
	return useQuery(platformUsersQueryOptions(params))
}

/** Bans a user (their sessions end and they cannot sign in) or lifts the ban. */
export function useSetUserBanned() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: setUserBanned,
		onSuccess: (_data, { banned }) => {
			toast.success(banned ? 'Usuario bloqueado' : 'Usuario desbloqueado')
		},
		onError: (error) => {
			toast.error('No pudimos cambiar el acceso del usuario', {
				description: authErrorMessage(error),
			})
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey: PLATFORM_USERS_KEY }),
	})
}
