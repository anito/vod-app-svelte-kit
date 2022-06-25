// @ts-nocheck
import { writable } from 'svelte/store';
import * as api from '$lib/api';

function createStore(endpoint, args) {
	const initial = {
		mails: new Map()
	};
	let getToken;

	const { subscribe, update, set } = writable(initial, makeSubscribe(initial, args));

	function unsubscribe() {
		//
	}

	function makeSubscribe(data, args) {
		// triggers on first subscriber
		const { id, token } = { ...args };
		getToken = () => token;
		return (set) => {
			get(data, set, args);
			console.log('createStore:first subscriber');
			return unsubscribe;
		};
	}

	async function get(data, set, { id, token }) {
		console.log('createStore:fetching data');
		await api.get(`${endpoint}/get/${id}`, { token }).then((res) => {
			if (res.success) {
				const d = res.data;
				d.forEach((item) => {
					data.mails.set(item.id, item);
				});
				set(data);
			}
		});
	}

	const add = (val) =>
		update(async (data) => {
			const token = getToken();
			data.mails.set(val.id, val);
			return await api.add(endpoint, { data: val, token }).then((res) => data);
		});

	const put = (val) =>
		update(async (data) => {
			const token = getToken();
			data.mails.set(val.id, val);
			return await api.put(`${endpoint}/${val.id}`, { data: val, token }).then((res) => data);
		});

	const del = (id) =>
		update(async (data) => {
			const token = getToken();
			data.mails.delete(id);
			return await api.del(`${endpoint}/${id}`, { token }).then((res) => data);
		});

	const updateMail = (val) =>
		update(async (data) => {
			data.mails.clear();
			val.forEach((item) => {
				data.mails.set(item.id, item);
			});
			return data;
		});

	return {
		data: initial,
		subscribe,
		update: updateMail,
		add,
		put,
		del,
		set
	};
}
export default createStore;
