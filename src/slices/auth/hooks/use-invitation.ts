import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { HOME_PATH } from '@/constants/routes'
import { acceptInvitation, getInvitation, rejectInvitation } from '../auth-client'
import { authErrorMessage } from '../auth-error'

/** The invitation as its recipient sees it; only asked once someone is signed in. */
export function useInvitation(invitationId: string | undefined, signedIn: boolean) {
	return useQuery({
		queryKey: ['auth', 'invitation', invitationId],
		queryFn: invitationId && signedIn ? () => getInvitation(invitationId) : skipToken,
		retry: false,
	})
}

/** Accepts or rejects the invitation, then opens the app with the resulting membership. */
export function useAnswerInvitation(invitationId: string) {
	const queryClient = useQueryClient()
	const navigate = useNavigate()
	return useMutation({
		mutationFn: (accept: boolean) =>
			accept ? acceptInvitation(invitationId) : rejectInvitation(invitationId),
		onSuccess: (_data, accepted) => {
			// The membership changed: nothing cached under the previous one may show.
			queryClient.clear()
			toast.success(accepted ? 'Te uniste al equipo' : 'Rechazaste la invitación')
			void navigate({ href: HOME_PATH })
		},
		onError: (error) => {
			toast.error('No pudimos responder la invitación', { description: authErrorMessage(error) })
		},
	})
}
