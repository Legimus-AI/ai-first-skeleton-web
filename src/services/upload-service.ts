// Sends a file straight to the storage bucket through the presigned PUT the API returned.
// The second named exception to INVARIANTS #7: the bucket is another origin and checks a signature,
// not the session, so this request cannot go through the api-client.
import type { CreateUploadResponse } from '@repo/shared'
import { ApiError } from '@/services/api-error'

type UploadTarget = CreateUploadResponse['data']['upload']

// WHY: a browser refuses to set Content-Length (a forbidden header) and derives it from the body.
const BROWSER_SET_HEADER = 'content-length'

/** PUTs `file` to `upload.url` with the signed headers; throws an ApiError when the bucket refuses it. */
export async function uploadToPresignedUrl(upload: UploadTarget, file: File): Promise<void> {
	const headers = Object.entries(upload.headers).filter(
		([name]) => name.toLowerCase() !== BROWSER_SET_HEADER,
	)
	// WHY: the File itself, never a stream or re-encoded copy, or the signed size and type stop matching;
	// credentials omitted because the session cookie must never reach the bucket's origin.
	const res = await fetch(upload.url, {
		method: upload.method,
		headers,
		body: file,
		credentials: 'omit',
	})
	// The message names only the status: the URL is a bearer credential and stays out of errors.
	if (!res.ok) {
		throw new ApiError(`Upload to storage failed with status ${res.status}`, 'INTERNAL_ERROR', {
			status: res.status,
		})
	}
}
