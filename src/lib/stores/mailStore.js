// @ts-nocheck
import { writable } from 'svelte/store';
import * as api from '$lib/api';

/**
 * @param {any} endpoint
 * @param {any} args
 */
function createStore(endpoint, args) {
  const initial = {
    mails: new Map()
  };
  /**
   * @type {() => any}
   */
  let getToken;

  const { subscribe, update, set } = writable(initial, makeSubscribe(initial, args));

  function unsubscribe() {
    //
  }

  /**
   *
   * @param {*} data
   * @param {*} args
   * @returns
   */
  function makeSubscribe(data, args) {
    // triggers on first subscriber
    const { token } = { ...args };
    getToken = () => token;
    return (set) => {
      get(data, set, args);
      return unsubscribe;
    };
  }

  /**
   *
   * @param {*} data
   * @param {*} set
   * @param {*} param2
   */
  async function get(data, set, { id, token }) {
    await api.get(`${endpoint}/get/${id}`, { token }).then((res) => {
      if (res?.success) {
        const d = res.data;
        d.forEach((item) => {
          data.mails.set(item.id, item);
        });
        set(data);
      }
    });
  }

  /**
   *
   * @param {*} val
   * @returns
   */
  const add = (val) =>
    update(async (data) => {
      const token = getToken();
      data.mails.set(val.id, val);
      return await api.add(endpoint, { data: val, token }).then(() => data);
    });

  /**
   *
   * @param {*} val
   * @returns
   */
  const put = (val) =>
    update(async (data) => {
      const token = getToken();
      data.mails.set(val.id, val);
      return await api.put(`${endpoint}/${val.id}`, { data: val, token }).then(() => data);
    });

  /**
   *
   * @param {*} id
   * @returns
   */
  const del = (id) =>
    update(async (data) => {
      const token = getToken();
      data.mails.delete(id);
      return await api.del(`${endpoint}/${id}`, { token }).then(() => data);
    });

  /**
   *
   * @param {*} val
   * @returns
   */
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
