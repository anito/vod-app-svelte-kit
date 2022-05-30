// @ts-nocheck
import { derived } from 'svelte/store';
import { session } from '$app/stores';
import { __ticker__ } from '$lib/utils';

function createStore() {
	const INTERVAL = 2;
	let exp;

	return derived(
		session,
		($s, set) => {
			exp = $s.expires;
			if (!(exp instanceof Date)) {
				exp = new Date(exp);
			}

			clearInterval(__ticker__.interval);
			__ticker__.interval = setInterval(() => {
				let time = exp - new Date();
				set(time > 0 ? time : 0);
			}, INTERVAL * 1000);

			// no more subscribers
			return () => {
				clearInterval(__ticker__.interval);

				console.log(
					'%c TICKER ENDED',
					'background: #ff5722; color: #ffffff; padding:4px 6px 3px 0;'
				);

				/**
				 * Stop condition (value === 0) was possibly met
				 * remove it to re-enable
				 */
				set(void 0);
			};
		},
		void 0
	);
}

export const ticker = createStore();
