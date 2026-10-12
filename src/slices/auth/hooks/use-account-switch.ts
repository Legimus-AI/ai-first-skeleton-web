import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

/**
 * Another tab signed in as someone else, or into another organization (`accountKey` is
 * `userId:organizationId`): drop every answer cached for the previous account and reload the page.
 * Returns the account whose data the cache holds: it changes once the new account's data is in.
 */
export function useReloadOnAccountSwitch(accountKey: string | null): string | null {
	const queryClient = useQueryClient()
	const router = useRouter()
	const shownAccountKeyRef = useRef(accountKey)
	const [loadedAccountKey, setLoadedAccountKey] = useState(accountKey)

	useEffect(() => {
		if (!accountKey) return
		const shownAccountKey = shownAccountKeyRef.current
		shownAccountKeyRef.current = accountKey
		if (shownAccountKey === null) {
			setLoadedAccountKey(accountKey)
			return
		}
		if (shownAccountKey === accountKey) return
		// WHY: resetQueries, not clear(): it drops every answer AND tells the mounted queries, so they
		// refetch; after clear() they keep the removed answers. It resolves once those refetches end.
		void queryClient.resetQueries().then(() => {
			if (shownAccountKeyRef.current === accountKey) setLoadedAccountKey(accountKey)
		})
		void router.invalidate()
	}, [accountKey, queryClient, router])

	return loadedAccountKey
}
