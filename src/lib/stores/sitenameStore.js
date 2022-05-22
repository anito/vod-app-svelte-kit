// @ts-nocheck
import { derived } from "svelte/store";
import { settings } from "./settingStore";

export const sitename = derived(settings, ($s, set) =>
  set(($s.Site?.name) || "...")
);
