import { deLocalizeUrl } from '$lib/paraglide/runtime';
import type { RequestEvent } from '@sveltejs/kit';

// Accept a SvelteKit RequestEvent (or a compatible object with a `url` property)
export const reroute = (request: RequestEvent | { url: string }) => deLocalizeUrl((request as any).url).pathname;
