// @ts-nocheck
import { writable } from 'svelte/store';
import { __session__ } from '$lib/utils';

function createStore() {
	const INTERVAL = 2;
	const { subscribe, update, set } = writable(void 0, (set) => {
		/**
		 * STOP CONDITION: 0 Int
		 */
		// no more subscribers
		return () => {
			clearInterval(__session__.interval);
			__session__.started = false;

			console.log(
				'%c SESSION ENDED',
				'background: #ff5722; color: #ffffff; padding:4px 6px 3px 0;'
			);

			/**
			 * Stop condition (value === 0) was possibly met
			 * remove it to re-enable
			 */
			set(void 0);
		};
	});

	return {
		subscribe,
		start: (exp) =>
			update(() => {
				if (!(exp instanceof Date)) {
					exp = new Date(exp);
				}
				if (!__session__.started)
					console.log(
						'%c SESSION STARTED %c %s',
						'background: #5eba7d; color: #ffffff; padding:4px 6px 3px 0;',
						'background: #dfe2e6; color: #000000; padding:4px 6px 3px 0;',
						exp
					);
				else
					console.log(
						'%c SESSION EXTENDED',
						'background: #2f6ef7; color: #ffffff; padding:4px 6px 3px 0;'
					);

				/**
				 * if we meet the stop condition,
				 * remove it to make sure ticker is able to re-run
				 */
				set(void 0);

				__session__.started = true;

				clearInterval(__session__.interval);
				__session__.interval = setInterval(() => {
					let s = exp - new Date();
					set(s > 0 ? s : 0);
				}, INTERVAL * 1000);
			}),
		stop: () => set(0),
		set
	};
}

export const ticker = createStore();
