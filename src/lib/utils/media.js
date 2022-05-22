// @ts-nocheck
import { get as getStore } from "svelte/store";
import * as api from "$lib/api";
import { urls } from "$lib/stores/urlStore";

async function uri(id, user, type, options = {}) {
  let query = [];
  for (var key in options) {
    query.push(`${key}=${options[key]}`);
  }
  let url = `u/${type}/${id}/${query.length && "?" + query.join("&")}`;

  const res = await api.get(url, user && user.token);

  if (res && res.success) {
    return res.data;
  } else {
    throw `The Uri method was unable to fetch a mediafile type: ${type.toUpperCase()}, id: ${id}`;
  }
}
export async function getMedia(type, id, user, { ...options }) {
  type = type.length && type.toLowerCase();
  const TYPE = type === "video" ? "v" : type === "avatar" ? "a" : "i";

  if (user && user.token) {
    let defaults = {
      width: 300,
      height: 300,
      square: 0,
      quality: -1,
    };
    const params = { ...defaults, ...options };
    let cached, url, _urls, stringified;
    stringified = JSON.stringify(params).replace(/["'\s]/g, "");

    url = cached =
      ((_urls = getStore(urls)) &&
        _urls.has(id) &&
        _urls.get(id)[stringified]) ||
      false;

    if (!cached) {
      await uri(id, user, TYPE, params)
        .then((res) => (url = res["url"]) && urls.add(res))
        .catch((e) => {
          console.log(e);
        });
    }
    if (url) return `${url}/?token=${user.token}`;
  }
}
export function getMediaAvatar(id, user, options = {}) {
  const defaults = {
    width: 100,
    height: 100,
    square: 1,
  }
  let settings = { ...defaults, ...options };
  return getMedia("AVATAR", id, user, settings);
}
export function getMediaImage(id, user, options = {}) {
  const defaults = {
    width: 512,
    height: 512,
    square: 0,
  }
  let settings = { ...defaults, ...options };
  return getMedia("IMAGE", id, user, settings);
}
export async function getMediaVideo(id, user, options={}) {
  const defaults = { square: 2 };
  let settings = { ...defaults, ...options };
  return getMedia("VIDEO", id, user, settings);
}
export function getExt(fn) {
  let match = (fn && fn.match(/[A-Za-z0-9]+$/)) || [];
  return match.length && match[0].toLowerCase();
}
