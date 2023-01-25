<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { mute } from '.';

  let dispatch = createEventDispatcher();
  let pipButton;
  let fullscreenButton;
  let mediaControls: HTMLDivElement;
  let listeners = 0;

  const data_play_not_loaded =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTFweCIgaGVpZ2h0PSIxM3B4IiB2aWV3Qm94PSIwIDAgMTEgMTMiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQzLjEgKDM5MDEyKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5fQXNzZXRzL0lubGluZS9QbGF5PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9Ik1lZGlhLUNvbnRyb2wtU3ltYm9scyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Il9Bc3NldHMvSW5saW5lL1BsYXkiIGZpbGw9IiMwMDAwMDAiPgogICAgICAgICAgICA8cGF0aCBkPSJNMCwwLjYwNTA2ODY5MiBDMCwwLjA1ODE3MzcxMjEgMC4zODI1MTY0ODgsLTAuMTU2MTA0Nzg5IDAuODY0MTIyNjUsMC4xMzIzMDE4ODcgTDEwLjYzMjU5ODUsNS45ODIwODkyOCBDMTEuMTA5ODQwMyw2LjI2Nzg4MjM3IDExLjExNDIwNDcsNi43Mjg2MTkxMyAxMC42MzI1OTg1LDcuMDE3MDEwOTcgTDAuODY0MTIyNjUsMTIuODY2NDk3NSBDMC4zODY4ODA4ODksMTMuMTUyMjc1OSAwLDEyLjk0MTQxNjYgMCwxMi4zOTM3MDQxIEwwLDAuNjA1MDY4NjkyIFoiIGlkPSJSZWN0YW5nbGUiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==';
  const data_play =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTFweCIgaGVpZ2h0PSIxM3B4IiB2aWV3Qm94PSIwIDAgMTEgMTMiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQzLjEgKDM5MDEyKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5fQXNzZXRzL0lubGluZS9QbGF5PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9Ik1lZGlhLUNvbnRyb2wtU3ltYm9scyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Il9Bc3NldHMvSW5saW5lL1BsYXkiIGZpbGw9IiMwMDAwMDAiPgogICAgICAgICAgICA8cGF0aCBkPSJNMCwwLjYwNTA2ODY5MiBDMCwwLjA1ODE3MzcxMjEgMC4zODI1MTY0ODgsLTAuMTU2MTA0Nzg5IDAuODY0MTIyNjUsMC4xMzIzMDE4ODcgTDEwLjYzMjU5ODUsNS45ODIwODkyOCBDMTEuMTA5ODQwMyw2LjI2Nzg4MjM3IDExLjExNDIwNDcsNi43Mjg2MTkxMyAxMC42MzI1OTg1LDcuMDE3MDEwOTcgTDAuODY0MTIyNjUsMTIuODY2NDk3NSBDMC4zODY4ODA4ODksMTMuMTUyMjc1OSAwLDEyLjk0MTQxNjYgMCwxMi4zOTM3MDQxIEwwLDAuNjA1MDY4NjkyIFoiIGlkPSJSZWN0YW5nbGUiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==';
  const data_pause =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTFweCIgaGVpZ2h0PSIxM3B4IiB2aWV3Qm94PSIwIDAgMTEgMTMiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQzLjEgKDM5MDEyKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5fQXNzZXRzL0lubGluZS9QYXVzZTwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJNZWRpYS1Db250cm9sLVN5bWJvbHMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJfQXNzZXRzL0lubGluZS9QYXVzZSIgZmlsbD0iIzAwMDAwMCI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik03LDAuOTk4NTAyMzI5IEM3LDAuNDQ3MDQ0NzIgNy40NDMzNTMxOCwwIDguMDA5MzY4OSwwIEw5Ljk5MDYzMTEsMCBDMTAuNTQ4MDkwMiwwIDExLDAuNDQ3NDg5NDI2IDExLDAuOTk4NTAyMzI5IEwxMSwxMi4wMDE0OTc3IEMxMSwxMi41NTI5NTUzIDEwLjU1NjY0NjgsMTMgOS45OTA2MzExLDEzIEw4LjAwOTM2ODksMTMgQzcuNDUxOTA5ODUsMTMgNywxMi41NTI1MTA2IDcsMTIuMDAxNDk3NyBMNywwLjk5ODUwMjMyOSBaIE0wLDAuOTk4NTAyMzI5IEMwLDAuNDQ3MDQ0NzIgMC40NDMzNTMxNzYsMCAxLjAwOTM2ODksMCBMMi45OTA2MzExLDAgQzMuNTQ4MDkwMTUsMCA0LDAuNDQ3NDg5NDI2IDQsMC45OTg1MDIzMjkgTDQsMTIuMDAxNDk3NyBDNCwxMi41NTI5NTUzIDMuNTU2NjQ2ODIsMTMgMi45OTA2MzExLDEzIEwxLjAwOTM2ODksMTMgQzAuNDUxOTA5ODQ4LDEzIDAsMTIuNTUyNTEwNiAwLDEyLjAwMTQ5NzcgTDAsMC45OTg1MDIzMjkgWiIgaWQ9IkNvbWJpbmVkLVNoYXBlIj48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';
  const data_fwd =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTNweCIgaGVpZ2h0PSIxN3B4IiB2aWV3Qm94PSIwIDAgMTMgMTciIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQzLjIgKDM5MDY5KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5fQXNzZXRzL0lubGluZS9Ta2lwRm9yd2FyZDE1PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9Ik1lZGlhLUNvbnRyb2wtU3ltYm9scyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Il9Bc3NldHMvSW5saW5lL1NraXBGb3J3YXJkMTUiIGZpbGw9IiMwMDAwMDAiPgogICAgICAgICAgICA8cGF0aCBkPSJNNC4wMTE0ODQzOCwxMSBMNS4wNDM3MTA5NSwxMSBMNS4wNDM3MTA5NSw2LjA2Nzg3MTA5IEw0LjAxNDkwMjM1LDYuMDY3ODcxMDkgTDIuNzQwMDAwMDEsNi45NDYyODkwNiBMMi43NDAwMDAwMSw3LjkwNjczODI4IEwzLjk0OTk2MDk1LDcuMDcyNzUzOTEgTDQuMDExNDg0MzgsNy4wNzI3NTM5MSBMNC4wMTE0ODQzOCwxMSBaIE04LjAxMzY5MTQzLDExLjEyNjQ2NDggQzkuMTQ1MDM5MDgsMTEuMTI2NDY0OCA5LjkwMDQxMDE4LDEwLjQxMjEwOTQgOS45MDA0MTAxOCw5LjM2NjIxMDk0IEM5LjkwMDQxMDE4LDguMzk4OTI1NzggOS4yMzczMjQyNCw3LjcxMTkxNDA2IDguMzAwODAwOCw3LjcxMTkxNDA2IEM3LjgxMjAzMTI3LDcuNzExOTE0MDYgNy40NjMzOTg0Niw3Ljg5MzA2NjQxIDcuMjU0OTAyMzYsOC4xOTM4NDc2NiBMNy4xOTMzNzg5Myw4LjE5Mzg0NzY2IEw3LjMwMjc1MzkzLDYuOTI1NzgxMjUgTDkuNjAzMDQ2ODksNi45MjU3ODEyNSBMOS42MDMwNDY4OSw2LjA2Nzg3MTA5IEw2LjUwMjk0OTI0LDYuMDY3ODcxMDkgTDYuMjU2ODU1NDksOC45Mjg3MTA5NCBMNy4xNzk3MDcwNSw4LjkyODcxMDk0IEM3LjM1MDYwNTQ5LDguNjUxODU1NDcgNy42NDExMzI4Myw4LjQ4NDM3NSA4LjAyMzk0NTMzLDguNDg0Mzc1IEM4LjU0Njg5NDU1LDguNDg0Mzc1IDguOTE2MDM1MTgsOC44NDY2Nzk2OSA4LjkxNjAzNTE4LDkuMzkwMTM2NzIgQzguOTE2MDM1MTgsOS45MjY3NTc4MSA4LjU1MDMxMjUyLDEwLjI4MjIyNjYgOC4wMjA1MjczNiwxMC4yODIyMjY2IEM3LjU1MjI2NTY0LDEwLjI4MjIyNjYgNy4xODk5NjA5NiwxMC4wMDg3ODkxIDcuMTMxODU1NDksOS41OTg2MzI4MSBMNi4xNzgyNDIyMSw5LjU5ODYzMjgxIEM2LjIwOTAwMzkzLDEwLjQ4MDQ2ODggNi45NDA0NDkyNCwxMS4xMjY0NjQ4IDguMDEzNjkxNDMsMTEuMTI2NDY0OCBaIiBpZD0iMTUiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTUsMyBMNy41NTY2NDY4Miw0LjI3ODMyMzQxIEM3LjgwNzA3MTY5LDQuNDAzNTM1ODQgOCw0LjI4MDQwNTI5IDgsNC4wMDk1MjE0OCBMOCwzLjIwNzAzMjQ5IEMxMC4zMDg1MDQ4LDMuODU5OTYxMzggMTIsNS45ODI0NDU3NSAxMiw4LjUgQzEyLDExLjUzNzU2NjEgOS41Mzc1NjYxMiwxNCA2LjUsMTQgQzMuNDYyNDMzODgsMTQgMSwxMS41Mzc1NjYxIDEsOC41IEMxLDguMzMxNDU1MTUgMS4wMDc1ODEzMSw4LjE2NDY4MTAyIDEuMDIyNDIxNTEsOCBMMC4wMTg5NDQ4MTY3LDggQzAuMDA2MzkxNDYzMDIsOC4xNjUwMjA4MSAxLjMxODM4OTg0ZS0xNiw4LjMzMTc2NCAxLjMxODM4OTg0ZS0xNiw4LjUgQzEuMzE4Mzg5ODRlLTE2LDEyLjA4OTg1MDkgMi45MTAxNDkxMywxNSA2LjUsMTUgQzEwLjA4OTg1MDksMTUgMTMsMTIuMDg5ODUwOSAxMyw4LjUgQzEzLDUuNDI2NDE4MzYgMTAuODY2NywyLjg1MTA5NTY0IDgsMi4xNzM5MzE4NCBMOCwwLjk5MDQ3ODUxNiBDOCwwLjcxNTA1NzM3MyA3LjgwMTUwNDAyLDAuNTk5MjQ3OTg5IDcuNTU2NjQ2ODIsMC43MjE2NzY1ODggTDUsMiBMNSwwLjk5MDQ3ODUxNiBDNSwwLjcxNTA1NzM3MyA0LjgwMTUwNDAyLDAuNTk5MjQ3OTg5IDQuNTU2NjQ2ODIsMC43MjE2NzY1ODggTDEuNDQzMzUzMTgsMi4yNzgzMjM0MSBDMS4xOTI5MjgzMSwyLjQwMzUzNTg0IDEuMTk4NDk1OTgsMi41OTkyNDc5OSAxLjQ0MzM1MzE4LDIuNzIxNjc2NTkgTDQuNTU2NjQ2ODIsNC4yNzgzMjM0MSBDNC44MDcwNzE2OSw0LjQwMzUzNTg0IDUsNC4yODA0MDUyOSA1LDQuMDA5NTIxNDggTDUsMyBaIiBpZD0iQ29tYmluZWQtU2hhcGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDYuNTAwMDAwLCA3LjgzNjUzMikgc2NhbGUoLTEsIDEpIHRyYW5zbGF0ZSgtNi41MDAwMDAsIC03LjgzNjUzMikgIj48L3BhdGg+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=';
  const data_rwd =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTNweCIgaGVpZ2h0PSIxN3B4IiB2aWV3Qm94PSIwIDAgMTMgMTciIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQzLjIgKDM5MDY5KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5fQXNzZXRzL0lubGluZS9Ta2lwQmFjazE1PC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9Ik1lZGlhLUNvbnRyb2wtU3ltYm9scyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9Il9Bc3NldHMvSW5saW5lL1NraXBCYWNrMTUiIGZpbGw9IiMwMDAwMDAiPgogICAgICAgICAgICA8cGF0aCBkPSJNNC4wMjE0ODQzOCwxMSBMNS4wNTM3MTA5NCwxMSBMNS4wNTM3MTA5NCw2LjA2Nzg3MTA5IEw0LjAyNDkwMjM0LDYuMDY3ODcxMDkgTDIuNzUsNi45NDYyODkwNiBMMi43NSw3LjkwNjczODI4IEwzLjk1OTk2MDk0LDcuMDcyNzUzOTEgTDQuMDIxNDg0MzgsNy4wNzI3NTM5MSBMNC4wMjE0ODQzOCwxMSBaIE04LjAyMzY5MTQyLDExLjEyNjQ2NDggQzkuMTU1MDM5MDcsMTEuMTI2NDY0OCA5LjkxMDQxMDE3LDEwLjQxMjEwOTQgOS45MTA0MTAxNyw5LjM2NjIxMDk0IEM5LjkxMDQxMDE3LDguMzk4OTI1NzggOS4yNDczMjQyMyw3LjcxMTkxNDA2IDguMzEwODAwNzksNy43MTE5MTQwNiBDNy44MjIwMzEyNiw3LjcxMTkxNDA2IDcuNDczMzk4NDUsNy44OTMwNjY0MSA3LjI2NDkwMjM1LDguMTkzODQ3NjYgTDcuMjAzMzc4OTIsOC4xOTM4NDc2NiBMNy4zMTI3NTM5Miw2LjkyNTc4MTI1IEw5LjYxMzA0Njg4LDYuOTI1NzgxMjUgTDkuNjEzMDQ2ODgsNi4wNjc4NzEwOSBMNi41MTI5NDkyMyw2LjA2Nzg3MTA5IEw2LjI2Njg1NTQ4LDguOTI4NzEwOTQgTDcuMTg5NzA3MDQsOC45Mjg3MTA5NCBDNy4zNjA2MDU0OCw4LjY1MTg1NTQ3IDcuNjUxMTMyODIsOC40ODQzNzUgOC4wMzM5NDUzMiw4LjQ4NDM3NSBDOC41NTY4OTQ1NCw4LjQ4NDM3NSA4LjkyNjAzNTE3LDguODQ2Njc5NjkgOC45MjYwMzUxNyw5LjM5MDEzNjcyIEM4LjkyNjAzNTE3LDkuOTI2NzU3ODEgOC41NjAzMTI1MSwxMC4yODIyMjY2IDguMDMwNTI3MzUsMTAuMjgyMjI2NiBDNy41NjIyNjU2MywxMC4yODIyMjY2IDcuMTk5OTYwOTUsMTAuMDA4Nzg5MSA3LjE0MTg1NTQ4LDkuNTk4NjMyODEgTDYuMTg4MjQyMiw5LjU5ODYzMjgxIEM2LjIxOTAwMzkyLDEwLjQ4MDQ2ODggNi45NTA0NDkyMywxMS4xMjY0NjQ4IDguMDIzNjkxNDIsMTEuMTI2NDY0OCBaIiBpZD0iMTUiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggZD0iTTUsMyBMNy41NTY2NDY4Miw0LjI3ODMyMzQxIEM3LjgwNzA3MTY5LDQuNDAzNTM1ODQgOCw0LjI4MDQwNTI5IDgsNC4wMDk1MjE0OCBMOCwzLjIwNzAzMjQ5IEMxMC4zMDg1MDQ4LDMuODU5OTYxMzggMTIsNS45ODI0NDU3NSAxMiw4LjUgQzEyLDExLjUzNzU2NjEgOS41Mzc1NjYxMiwxNCA2LjUsMTQgQzMuNDYyNDMzODgsMTQgMSwxMS41Mzc1NjYxIDEsOC41IEMxLDguMzMxNDU1MTUgMS4wMDc1ODEzMSw4LjE2NDY4MTAyIDEuMDIyNDIxNTEsOCBMMC4wMTg5NDQ4MTY3LDggQzAuMDA2MzkxNDYzMDIsOC4xNjUwMjA4MSAxLjMxODM4OTg0ZS0xNiw4LjMzMTc2NCAxLjMxODM4OTg0ZS0xNiw4LjUgQzEuMzE4Mzg5ODRlLTE2LDEyLjA4OTg1MDkgMi45MTAxNDkxMywxNSA2LjUsMTUgQzEwLjA4OTg1MDksMTUgMTMsMTIuMDg5ODUwOSAxMyw4LjUgQzEzLDUuNDI2NDE4MzYgMTAuODY2NywyLjg1MTA5NTY0IDgsMi4xNzM5MzE4NCBMOCwwLjk5MDQ3ODUxNiBDOCwwLjcxNTA1NzM3MyA3LjgwMTUwNDAyLDAuNTk5MjQ3OTg5IDcuNTU2NjQ2ODIsMC43MjE2NzY1ODggTDUsMiBMNSwwLjk5MDQ3ODUxNiBDNSwwLjcxNTA1NzM3MyA0LjgwMTUwNDAyLDAuNTk5MjQ3OTg5IDQuNTU2NjQ2ODIsMC43MjE2NzY1ODggTDEuNDQzMzUzMTgsMi4yNzgzMjM0MSBDMS4xOTI5MjgzMSwyLjQwMzUzNTg0IDEuMTk4NDk1OTgsMi41OTkyNDc5OSAxLjQ0MzM1MzE4LDIuNzIxNjc2NTkgTDQuNTU2NjQ2ODIsNC4yNzgzMjM0MSBDNC44MDcwNzE2OSw0LjQwMzUzNTg0IDUsNC4yODA0MDUyOSA1LDQuMDA5NTIxNDggTDUsMyBaIiBpZD0iQ29tYmluZWQtU2hhcGUiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==';
  const data_pip =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+PHBhdGggZD0iTTE5IDdoLTh2Nmg4Vjd6bTItNEgzYy0xLjEgMC0yIC45LTIgMnYxNGMwIDEuMS45IDEuOTggMiAxLjk4aDE4YzEuMSAwIDItLjg4IDItMS45OFY1YzAtMS4xLS45LTItMi0yem0wIDE2LjAxSDNWNC45OGgxOHYxNC4wM3oiLz48L3N2Zz4=';
  const data_unmuted =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjJweCIgaGVpZ2h0PSIxNXB4IiB2aWV3Qm94PSIwIDAgMjIgMTUiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0xOC43MjI0NDksMTQuODQwMDM5OCBDMTguOTk5MDMwNiwxNS4wMjY4ODE2IDE5LjM2NTMwNjEsMTQuOTUyMTQxOCAxOS41ODIwNDA4LDE0LjY0NTcyODUgQzIwLjk2NDY0MjksMTIuNjk1MDkxOCAyMS43NDkzODc4LDEwLjE2ODk3ODUgMjEuNzQ5Mzg3OCw3LjUwMDg3NjQ5IEMyMS43NDkzODc4LDQuODMyNzc0NDUgMjAuOTQyMTQyOSwyLjMxNDEzNjY5IDE5LjU4MjA0MDgsMC4zNTYwMjQ0NDggQzE5LjM2NTMwNjEsMC4wNDIxMjY0ODg2IDE4Ljk5OTAzMDYsLTAuMDMyNjEzMzA3MyAxOC43MjI0NDksMC4xNjE3MTMyMjMgQzE4LjQzODUyMDQsMC4zNjM0OTM4MzYgMTguMzkzNjczNSwwLjcyOTcwODEyMSAxOC42MTA0MDgyLDEuMDQzNjA2MDggQzE5LjgxMzYyMjQsMi44MTQ4NzY0OSAyMC41NjEwMjA0LDUuMDg2ODcxMzkgMjAuNTYxMDIwNCw3LjUwMDg3NjQ5IEMyMC41NjEwMjA0LDkuOTE0ODgxNTkgMTkuODQzNjIyNCwxMi4yMjQyNDk0IDE4LjYxMDQwODIsMTMuOTU4MTQ1NCBDMTguMzkzNjczNSwxNC4yNzIwNDE4IDE4LjQzODUyMDQsMTQuNjM4MjU5MSAxOC43MjI0NDksMTQuODQwMDM5OCBaIE04LjYzMzAwNTEsMTQuMzYxNzI1IEM5LjE0MTIxNDI5LDE0LjM2MTcyNSA5LjUwNzQyODU3LDEzLjk4ODA0MTMgOS41MDc0Mjg1NywxMy40ODczMDMgTDkuNTA3NDI4NTcsMS41NjY3NjkzNSBDOS41MDc0Mjg1NywxLjA2NjAyOTU1IDkuMTQxMjE0MjksMC42NTQ5NjgzMjUgOC42MTgwNjYzMywwLjY1NDk2ODMyNSBDOC4yNTE4NTIwNCwwLjY1NDk2ODMyNSA4LjAwNTIyNDQ5LDAuODExOTE3MzA1IDcuNjA5MTE3MzUsMS4xODU2MDA5OCBMNC4yOTgyNjUzMSw0LjMwMjE0MTc5IEM0LjI0NTk0ODk4LDQuMzQ2OTczNDMgNC4xODYxNjMyNyw0LjM2OTM5NjkgNC4xMTE0MjM0Nyw0LjM2OTM5NjkgTDEuODc2NzkwODIsNC4zNjkzOTY5IEMwLjgyMjk5NDg5OCw0LjM2OTM5NjkgMC4yNTUsNC45NDQ4NzY0OSAwLjI1NSw2LjA3MzM5NjkgTDAuMjU1LDguOTY1NzE4MzMgQzAuMjU1LDEwLjA4Njc2OTMgMC44MjI5OTQ4OTgsMTAuNjYyMjQ4OSAxLjg3Njc5MDgyLDEwLjY2MjI0ODkgTDQuMTExNDIzNDcsMTAuNjYyMjQ4OSBDNC4xODYxNjMyNywxMC42NjIyNDg5IDQuMjQ1OTQ4OTgsMTAuNjg0NjcyNCA0LjI5ODI2NTMxLDEwLjcyOTUwNCBMNy42MDkxMTczNSwxMy44NzU5MzQ3IEM3Ljk2Nzg0Njk0LDE0LjIxMjI1MTUgOC4yNjY4MDYxMiwxNC4zNjE3MjUgOC42MzMwMDUxLDE0LjM2MTcyNSBaIE0xNS43MTA2NjMzLDEyLjc5OTcyMzUgQzE2LjAwMjA5MTgsMTIuOTk0MDM5NyAxNi4zNjA4NjczLDEyLjkxOTMwMjYgMTYuNTcwMTAyLDEyLjYyMDM1NTEgQzE3LjU1NjU4MTYsMTEuMjQ1MTk3OSAxOC4xMzIwOTE4LDkuNDE0MTQxNzkgMTguMTMyMDkxOCw3LjUwMDg3NjQ5IEMxOC4xMzIwOTE4LDUuNTgwMTQxNzkgMTcuNTcxNTgxNiwzLjc0MTYwMDk4IDE2LjU3MDEwMiwyLjM3MzkyMjQxIEMxNi4zNTMzNjczLDIuMDgyNDQ3OTIgMTYuMDAyMDkxOCwyLjAwNzcwODEyIDE1LjcxMDY2MzMsMi4yMDIwMzQ2NSBDMTUuNDI2NTgxNiwyLjM5NjM0NTg4IDE1LjM4MTczNDcsMi43NjI1NjAxNiAxNS42MDU5Njk0LDMuMDgzOTI3NTEgQzE2LjQyMDU2MTIsNC4yNzk3MTgzMyAxNi45Mjg4Nzc2LDUuODQ5MTkyODIgMTYuOTI4ODc3Niw3LjUwMDg3NjQ5IEMxNi45Mjg4Nzc2LDkuMTUyNTYwMTYgMTYuNDI4MDYxMiwxMC43MzY5ODg3IDE1LjYwNTk2OTQsMTEuOTE3ODI4NSBDMTUuMzg5MjM0NywxMi4yMzkxOTU5IDE1LjQyNjU4MTYsMTIuNjA1NDA3MSAxNS43MTA2NjMzLDEyLjc5OTcyMzUgWiBNMTIuNzI4NTg2NywxMC43ODE4MjA0IEMxMi45ODI2OTksMTAuOTYxMTkyOCAxMy4zNDg5MTMzLDEwLjkwODg3NjUgMTMuNTY1NjQ4LDEwLjYwOTkzMjYgQzE0LjE0ODUyMDQsOS44MjUxODc3MSAxNC40OTk3OTU5LDguNjc0MjQzODQgMTQuNDk5Nzk1OSw3LjUwMDg3NjQ5IEMxNC40OTk3OTU5LDYuMzI3NTA5MTQgMTQuMTQ4NTIwNCw1LjE4NDAzNDY1IDEzLjU2NTY0OCw0LjM5MTgyMDM3IEMxMy4zNDg5MTMzLDQuMDkyODc2NDkgMTIuOTkwMTY4NCw0LjA0MDU2MDE2IDEyLjcyODU4NjcsNC4yMTI0NDc5MiBDMTIuNDA3MjE5NCw0LjQzNjY2NzMgMTIuMzYyMzg3OCw0LjgxNzgyMDM3IDEyLjYwMTU0NTksNS4xMzkxODc3MSBDMTMuMDM1MDE1Myw1LjcyMjEzNjY5IDEzLjI5NjU5NjksNi42MTE0OTg5NCAxMy4yOTY1OTY5LDcuNTAwODc2NDkgQzEzLjI5NjU5NjksOC4zOTAyMzg3MyAxMy4wMjAwNjEyLDkuMjc5NjE2MjggMTIuNTk0MDYxMiw5Ljg3MDAzNDY1IEMxMi4zNjk4NTcxLDEwLjE5MTQwMiAxMi40MDcyMTk0LDEwLjU1NzYxNjMgMTIuNzI4NTg2NywxMC43ODE4MjA0IFoiLz4KPC9zdmc+';
  const data_muted =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMjJweCIgaGVpZ2h0PSIxNXB4IiB2aWV3Qm94PSIwIDAgMjIgMTUiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxwYXRoIGQ9Ik0xNC43MDQ2LDEuMDE1NTk0NzQgQzE0LjcwNDYsMC40OTkwNDIxMDUgMTQuMzE5MTE1OCwwLjA3NSAxMy43Nzk0MzE2LDAuMDc1IEMxMy40MDE2NTI2LDAuMDc1IDEzLjE0NzIzNjgsMC4yMzY5MDUyNjMgMTIuNzM4NjIxMSwwLjYyMjM4OTQ3NCBMOS41Njk5MjYzMiwzLjYxMzc1MjYzIEM5LjUyMzY3ODk1LDMuNjYwMDE1NzkgOS40Nzc0MTU3OSwzLjY5MDg1MjYzIDkuNDIzNDQ3MzcsMy43MDYyNzg5NSBMOS4xMDczNDIxMSwzLjcyMTY4OTQ3IEwxNC43MDQ2LDkuMzE4OTQ3MzcgTDE0LjcwNDYsMS4wMTU1OTQ3NCBaIE0xNy4xNzk0MTA1LDE0Ljc1NDI4NDIgQzE3LjQxODQxNTgsMTQuOTg1NTY4NCAxNy43OTYxNzg5LDE0Ljk4NTU2ODQgMTguMDE5Njk0NywxNC43NTQyODQyIEMxOC4yNTEwMTA1LDE0LjUxNTI3ODkgMTguMjU4NzQ3NCwxNC4xNDUyMTQ3IDE4LjAxOTY5NDcsMTMuOTEzOTI0MiBMNC44MjA3NTI2MywwLjcxNDkxNTc4OSBDNC41ODk0Njg0MiwwLjQ4MzYxNTc4OSA0LjIwMzk4NDIxLDAuNDgzNjE1Nzg5IDMuOTcyNjg0MjEsMC43MTQ5MTU3ODkgQzMuNzQ5MTA1MjYsMC45Mzg0OTQ3MzcgMy43NDkxMDUyNiwxLjMzMTY4NDIxIDMuOTcyNjg0MjEsMS41NTUyNjMxNiBMMTcuMTc5NDEwNSwxNC43NTQyODQyIFogTTYuODMyOTc4OTUsMTAuMzk4MyBMOS4xMzA0NzM2OCwxMC4zOTgzIEM5LjIwNzU3MzY4LDEwLjM5ODMgOS4yNzY5Njg0MiwxMC40MjE0MzE2IDkuMzIzMjE1NzksMTAuNDY3Njc4OSBMMTIuNzM4NjIxMSwxMy43MTM0NzA1IEMxMy4xMDg2Nzg5LDE0LjA2MDQwNzkgMTMuNDE3MDc4OSwxNC4yMTQ2MDE2IDEzLjc5NDg0MjEsMTQuMjE0NjAxNiBDMTQuMTQ5NDg5NSwxNC4yMTQ2MDE2IDE0LjQzNDc1NzksMTQuMDI5NTY5NSAxNC41NzM1MzE2LDEzLjc1OTcyODkgQzE0LjYwNDM2ODQsMTMuNjkwMzQyMSAxNC42MzUyMDUzLDEzLjYxMzI0NTMgMTQuNjU4MzM2OCwxMy41Mjg0Mzg0IEw1LjU0NTQ1Nzg5LDQuNDE1NTczNjggQzUuMjkxMDQyMTEsNC42OTMxMjEwNSA1LjE1OTk3MzY4LDUuMTE3MTQ3MzcgNS4xNTk5NzM2OCw1LjY2NDUzNjg0IEw1LjE1OTk3MzY4LDguNjQ4MTk0NzQgQzUuMTU5OTczNjgsOS44MDQ2NDczNyA1Ljc0NTkyMTA1LDEwLjM5ODMgNi44MzI5Nzg5NSwxMC4zOTgzIFoiLz4KPC9zdmc+';
  const data_full_apple =
    'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMTVweCIgaGVpZ2h0PSIxNXB4IiB2aWV3Qm94PSIwIDAgMTUgMTUiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQzLjEgKDM5MDEyKSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5fQXNzZXRzL0lubGluZS9FbnRlckZ1bGxzY3JlZW48L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iTWVkaWEtQ29udHJvbC1TeW1ib2xzIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iX0Fzc2V0cy9JbmxpbmUvRW50ZXJGdWxsc2NyZWVuIiBmaWxsPSIjMDAwMDAwIj4KICAgICAgICAgICAgPHBhdGggZD0iTTQuNDQyMjYwNCw1LjUwMjg3ODgxIEwwLjIxNzc1MzE3OCwxLjI3ODM3MTU4IEMtMC4wNzMwNDMzOTgxLDAuOTg3NTc1MDA5IC0wLjA3MzM4NTczMSwwLjUxNjQ0MjkzNyAwLjIyMTU0OTQ4NSwwLjIyMTUwNzcyIEMwLjUxNDQ0MjcwNCwtMC4wNzEzODU0OTgzIDAuOTg1NzA0NDg3LC0wLjA3NDk5NzQ1MDIgMS4yNzg0MTMzNSwwLjIxNzcxMTQxMyBMNS41MTEyNjUxNiw0LjQ1MDU2MzIyIEw1LjUxMTI2NTE2LDIuMDQyMTI5MDYgQzUuNTExMjY1MTYsMS42MjkyNTcyNyA1Ljg0NDE2Mzc3LDEuMjk0NTU4NTUgNi4yNjEyNjUxNiwxLjI5NDU1ODU1IEM2LjY3NTQ3ODcyLDEuMjk0NTU4NTUgNy4wMTEyNjUxNiwxLjYzNTE0MDY5IDcuMDExMjY1MTYsMi4wNDIxMjkwNiBMNy4wMTEyNjUxNiw2LjIwOTM2OTYxIEM3LjAxNjYyMTM5LDYuMjg4Njc2OTMgNy4wMDkzMDI1OSw2LjM2ODc3NTQyIDYuOTg5MjY1MjgsNi40NDY0NTEzNyBDNi45MDg2MDM5NCw2Ljc3MTc5NjkgNi42MTUyNTk5OCw3LjAxMjg3ODggNi4yNjEyNjUxNiw3LjAxMjg3ODggQzYuMjE5NzI0MjEsNy4wMTI4Nzg4IDYuMTc4OTcyMDcsNy4wMDk0NTMyOCA2LjEzOTI2ODMzLDcuMDAyODc4ODEgTDIuMDQwNTE1NDIsNy4wMDI4Nzg4MSBDMS42Mjc2NDM2Miw3LjAwMjg3ODgxIDEuMjkyOTQ0OTEsNi42Njk5ODAxOSAxLjI5Mjk0NDkxLDYuMjUyODc4ODEgQzEuMjkyOTQ0OTEsNS44Mzg2NjUyNSAxLjYzMzUyNzA0LDUuNTAyODc4ODEgMi4wNDA1MTU0Miw1LjUwMjg3ODgxIEw0LjQ0MjI2MDQsNS41MDI4Nzg4MSBaIiBpZD0iQ29tYmluZWQtU2hhcGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDMuNTA2NDgxLCAzLjUwNjQzOSkgcm90YXRlKDE4MC4wMDAwMDApIHRyYW5zbGF0ZSgtMy41MDY0ODEsIC0zLjUwNjQzOSkgIj48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMi40NDIyNjA0LDEzLjUwMjg3ODggTDguMjE3NzUzMTgsOS4yNzgzNzE1OCBDNy45MjY5NTY2LDguOTg3NTc1MDEgNy45MjY2MTQyNyw4LjUxNjQ0Mjk0IDguMjIxNTQ5NDksOC4yMjE1MDc3MiBDOC41MTQ0NDI3LDcuOTI4NjE0NSA4Ljk4NTcwNDQ5LDcuOTI1MDAyNTUgOS4yNzg0MTMzNSw4LjIxNzcxMTQxIEwxMy41MTEyNjUyLDEyLjQ1MDU2MzIgTDEzLjUxMTI2NTIsMTAuMDQyMTI5MSBDMTMuNTExMjY1Miw5LjYyOTI1NzI3IDEzLjg0NDE2MzgsOS4yOTQ1NTg1NSAxNC4yNjEyNjUyLDkuMjk0NTU4NTUgQzE0LjY3NTQ3ODcsOS4yOTQ1NTg1NSAxNS4wMTEyNjUyLDkuNjM1MTQwNjkgMTUuMDExMjY1MiwxMC4wNDIxMjkxIEwxNS4wMTEyNjUyLDE0LjIwOTM2OTYgQzE1LjAxNjYyMTQsMTQuMjg4Njc2OSAxNS4wMDkzMDI2LDE0LjM2ODc3NTQgMTQuOTg5MjY1MywxNC40NDY0NTE0IEMxNC45MDg2MDM5LDE0Ljc3MTc5NjkgMTQuNjE1MjYsMTUuMDEyODc4OCAxNC4yNjEyNjUyLDE1LjAxMjg3ODggQzE0LjIxOTcyNDIsMTUuMDEyODc4OCAxNC4xNzg5NzIxLDE1LjAwOTQ1MzMgMTQuMTM5MjY4MywxNS4wMDI4Nzg4IEwxMC4wNDA1MTU0LDE1LjAwMjg3ODggQzkuNjI3NjQzNjIsMTUuMDAyODc4OCA5LjI5Mjk0NDkxLDE0LjY2OTk4MDIgOS4yOTI5NDQ5MSwxNC4yNTI4Nzg4IEM5LjI5Mjk0NDkxLDEzLjgzODY2NTIgOS42MzM1MjcwNCwxMy41MDI4Nzg4IDEwLjA0MDUxNTQsMTMuNTAyODc4OCBMMTIuNDQyMjYwNCwxMy41MDI4Nzg4IFoiIGlkPSJDb21iaW5lZC1TaGFwZSI+PC9wYXRoPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+';
  const data_full =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iYmxhY2siIHdpZHRoPSIxOHB4IiBoZWlnaHQ9IjE4cHgiPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNNyAxNEg1djVoNXYtMkg3di0zem0tMi00aDJWN2gzVjVINXY1em0xMiA3aC0zdjJoNXYtNWgtMnYzek0xNCA1djJoM3YzaDJWNWgtNXoiLz48L3N2Zz4=';
  const data_full_exit =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iYmxhY2siIHdpZHRoPSIxOHB4IiBoZWlnaHQ9IjE4cHgiPjxwYXRoIGQ9Ik0wIDBoMjR2MjRIMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNNSAxNmgzdjNoMnYtNUg1djJ6bTMtOEg1djJoNVY1SDh2M3ptNiAxMWgydi0zaDN2LTJoLTV2NXptMi0xMVY1aC0ydjVoNVY4aC0zeiIvPjwvc3ZnPg==';

  export let time = 0;
  export let duration: number;
  export let paused: boolean;
  export let showControls: boolean;
  export let buffered;

  $: percentageTime = (time * 100) / duration;
  $: percentageBuffer =
    (buffered?.length && (buffered[buffered.length - 1].end * 100) / duration) || 0;

  function format(seconds: number, prefix = '') {
    if (isNaN(seconds)) return '...';

    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    const printMinutes = minutes < 10 ? '0' + minutes : minutes;
    const printSeconds = seconds < 10 ? '0' + seconds : seconds;

    return `${prefix}${printMinutes}:${printSeconds}`;
  }

  function handleWheel(event: WheelEvent) {
    dispatch('wheel', {
      deltaX: event.deltaX,
      deltaY: event.deltaY,
      direction: event.deltaY <= 0 ? 'up' : 'down'
    });
  }

  function dispatchMousemove(event: MouseEvent) {
    dispatch('ui:mousemove', event);
  }

  function dispatchMousedown(event: MouseEvent) {
    dispatch('ui:mousedown', event);
  }

  function dispatchTouchStart(event: TouchEvent) {
    dispatch('ui:touchstart', event);
  }

  function dispatchPip(event: MouseEvent) {
    dispatch('ui:pip', event);
  }

  function handleAddMousemove() {
    listeners++;
    mediaControls.addEventListener('mousemove', dispatchMousemove);
  }

  function handleRemMousemove() {
    listeners--;
    mediaControls.removeEventListener('mousemove', dispatchMousemove);
  }

  function maybeEnablePipButton(node: Element) {
    if ('pictureInPictureEnabled' in document) {
      node.classList.remove('hidden');
      node.removeAttribute('disabled');
    }
  }
</script>

<div class="media-controls-container" style="z-index: 2;">
  <div class="visible-controls-bar" style="display: none; stroke-width: 0px;" />
  <div
    class="media-controls play-pause-controllable inline"
    class:faded={!showControls}
    bind:this={mediaControls}
    on:wheel={handleWheel}
    on:touchstart={dispatchTouchStart}
    on:keydown
    on:mousedown={dispatchMousedown}
    on:mouseenter={handleAddMousemove}
    on:mouseleave={handleRemMousemove}
    on:mouseleave
    on:mouseenter
  >
    {#if isNaN(duration)}
      <button
        class="play-pause play-pause-controllable center paused"
        aria-label="Wiedergeben"
        style="position: absolute; padding: 0; left: 0px; width: 11px; height: 13px;"
      >
        <div class="background-tint">
          <div class="blur" />
          <div class="tint" />
        </div>
        <picture
          style="-webkit-mask-image: url({data_play_not_loaded}); width: 11px; height: 13px;"
        />
      </button>
    {:else}
      <div
        role="group"
        class="controls-bar top-left"
        on:mouseenter={handleRemMousemove}
        on:mouseleave={handleAddMousemove}
      >
        <div class="background-tint">
          <div class="blur" />
          <div class="tint" />
        </div>
        <div class="buttons-container">
          <button
            bind:this={pipButton}
            use:maybeEnablePipButton
            on:click={dispatchPip}
            disabled
            class="pip bar hidden"
            aria-label="Bild-in-Bild starten"
          >
            <picture style="-webkit-mask-image: url({data_pip}); width: 22px; height: 22px;" />
          </button>
        </div>
      </div>
      <div
        role="group"
        class="controls-bar bottom flex"
        aria-label="Videosteuerelemente"
        style="width: calc(100% - 2* var(--inline-controls-inside-margin)); bottom: 10px;"
        on:mouseenter={handleRemMousemove}
        on:mouseleave={handleAddMousemove}
      >
        <div class="background-tint">
          <div class="blur" />
          <div class="tint" />
        </div>
        <div class="buttons-container left" style="flex: 2;">
          <button
            on:click={(e) => dispatch('rwd', 15)}
            class="skip-back bar"
            aria-label="15 Sekunden zurückspringen"
          >
            <picture style="-webkit-mask-image: url({data_rwd}); width: 13px; height: 17px;" />
          </button>
          <button
            on:click={(e) => dispatch('play-pause', e)}
            class="play-pause bar"
            class:paused
            aria-label={paused ? 'Wiedergeben' : 'Pause'}
          >
            <picture
              style="-webkit-mask-image: url({paused
                ? data_play
                : data_pause}); width: 11px; height: 13px;"
            />
          </button>
          <button
            on:click={(e) => dispatch('fwd', 15)}
            class="skip-forward bar"
            aria-label="15 Sekunden vorspringen"
          >
            <picture style="-webkit-mask-image: url({data_fwd}); width: 13px; height: 17px;" />
          </button>
        </div>
        <div class="time-control flex" style="flex: 8;" on:keydown on:click|stopPropagation>
          <div
            class="time-label"
            aria-label="Verstrichen: {Math.floor(time)} Sekunden"
            style="flex: 1;"
          >
            {format(time)}
          </div>
          <div class="slider" style="flex: 8; height: 16px; width: 100%;">
            <div class="custom-slider">
              <div class="track fill" />
              <div class="primary fill" style="width: {percentageTime}%;" />
              <div class="secondary fill" style="width: {percentageBuffer}%;" />
              <div class="knob" style="left: {percentageTime}%;" />
            </div>
            <input
              bind:value={time}
              type="range"
              min="0"
              max={duration}
              step="1"
              aria-valuetext="{time} Sekunden"
            />
          </div>
          <div
            class="time-label"
            aria-label="Übrig: {Math.floor(duration - time)} Sekunden"
            style="flex: 1;"
          >
            {format(duration - time, '-')}
          </div>
        </div>
        <div class="buttons-container" style="flex: 1;">
          <button
            disabled={!duration}
            bind:this={fullscreenButton}
            on:click={(e) => dispatch('fullscreen', e)}
            class="fullscreen bar"
            aria-label="Vollbildmodus ein"
          >
            <picture style="-webkit-mask-image: url({data_full}); width: 24px; height: 24px;" />
          </button>
        </div>
      </div>
      <div role="group" class="controls-bar top-right">
        <div class="background-tint">
          <div class="blur" />
          <div class="tint" />
        </div>
        <div class="buttons-container ">
          <button class="mute bar" aria-label="Stumm" on:click={() => ($mute = !$mute)}>
            <picture
              style="width: 22px; height: 22px; -webkit-mask-image: url({$mute
                ? data_muted
                : data_unmuted});"
            />
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .activity-indicator {
    position: absolute;
    mix-blend-mode: lighten;
  }

  .activity-indicator > div {
    position: absolute;
    left: 6px;
    width: 2px;
    height: 4px;
    border-radius: 1px;
    background-color: white;
    animation-name: activity-indicator-pulse;
    animation-duration: 1s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    transform-origin: 50% 7px;
  }

  .activity-indicator > .ne {
    transform: rotate(45deg);
    animation-delay: -875ms;
  }

  .activity-indicator > .e {
    transform: rotate(90deg);
    animation-delay: -750ms;
  }

  .activity-indicator > .se {
    transform: rotate(135deg);
    animation-delay: -625ms;
  }

  .activity-indicator > .s {
    transform: rotate(180deg);
    animation-delay: -500ms;
  }

  .activity-indicator > .sw {
    transform: rotate(-135deg);
    animation-delay: -375ms;
  }

  .activity-indicator > .w {
    transform: rotate(-90deg);
    animation-delay: -250ms;
  }

  .activity-indicator > .nw {
    transform: rotate(-45deg);
    animation-delay: -125ms;
  }

  @keyframes activity-indicator-pulse {
    from {
      opacity: 0.9;
    }
    to {
      opacity: 0.25;
    }
  }

  button.airplay.on > picture {
    background-color: -apple-wireless-playback-target-active !important;
    mix-blend-mode: normal !important;
  }

  .background-tint {
    pointer-events: none;
  }

  .background-tint,
  .background-tint > div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 8px;
  }

  .background-tint > .blur {
    --tw-blur: 0px;
    background-color: rgba(0, 0, 0, 0.55);
    -webkit-backdrop-filter: saturate(180%) blur(var(--tw-blur));
  }

  .background-tint > .tint {
    background-color: rgba(255, 255, 255, 0.14);
    mix-blend-mode: lighten;
  }

  button {
    border: 0;
    padding: 0 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent !important;
    -webkit-appearance: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  button > picture {
    background-color: var(--primary-glyph-color);
    mix-blend-mode: lighten;
    -webkit-mask-size: 100% 100%;
    -webkit-mask-repeat: no-repeat;
    transition: transform 150ms;
    will-change: transform;

    pointer-events: none;
  }

  button:focus {
    outline: none;
  }

  button:focus > picture {
    background-color: -webkit-focus-ring-color !important;
    mix-blend-mode: normal !important;
  }

  button.skip-back > picture,
  button.play-pause > picture,
  button.skip-forward > picture {
    background-color: var(--primary-glyph-color);
  }

  button.on > picture {
    background-color: white !important;
  }

  button:active > picture {
    transform: scale(0.89);
  }

  button.corner {
    width: 44px !important;
    height: var(--inline-controls-bar-height) !important;
  }

  button.center,
  button.small-center {
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%);
  }

  button.center {
    width: 60px !important;
    height: 60px !important;
  }

  button.small-center {
    width: 31px !important;
    height: 31px !important;
  }

  button.center > .background-tint,
  button.small-center > .background-tint,
  button.center > .background-tint > div,
  button.small-center > .background-tint > div {
    border-radius: 50%;
  }

  button.center > picture,
  button.small-center > picture {
    position: absolute;
    left: 0;
    top: 0;
    width: 100% !important;
    height: 100% !important;
    transform: scale(0.4);
  }

  button.center:active > picture,
  button.small-center:active > picture {
    transform: scale(0.4) scale(calc(8 / 9));
  }

  .buttons-container {
    height: 100%;
    display: flex;
    align-items: center;
  }

  .ios .buttons-container button {
    padding: 8px;
    transform: translateX(-8px);
    box-sizing: content-box;
  }

  button.compact-activity-indicator > picture {
    --width: 27px;

    --number-of-frames: 23;

    width: var(--width) !important;
    height: 29.5px !important;

    -webkit-mask-size: calc(var(--number-of-frames) * 100%) 100%;

    --spins: compact-activity-indicator-intro frames(8) calc(8s / 15),
      compact-activity-indicator-loop frames(15) 1s calc(8s / 15) infinite;

    --fades-out: compact-activity-indicator-fades-out 500ms;
  }

  button.compact-activity-indicator.spins > picture {
    animation: var(--spins);
  }

  button.compact-activity-indicator.spins.fades-out > picture {
    animation: var(--spins), var(--fades-out);
  }

  @keyframes compact-activity-indicator-intro {
    from {
      -webkit-mask-position-x: 0;
    }
    to {
      -webkit-mask-position-x: calc(-7 * var(--width));
    }
  }

  @keyframes compact-activity-indicator-loop {
    from {
      -webkit-mask-position-x: calc(-8 * var(--width));
    }
    to {
      -webkit-mask-position-x: calc(-22 * var(--width));
    }
  }

  @keyframes compact-activity-indicator-fades-out {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  .media-controls.compact:before {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.2);
    content: '';
  }

  .media-controls.compact button {
    position: absolute;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;
  }

  .media-controls.compact button > picture {
    mix-blend-mode: normal;
    background-color: white;
    transition-duration: 0;
  }

  .media-controls.compact button:active > picture {
    transform: none;
  }

  .controls-bar {
    position: absolute;
    cursor: default;
    direction: ltr;
    will-change: z-index;
  }

  .media-controls.inline .controls-bar {
    left: var(--inline-controls-inside-margin);
    height: var(--inline-controls-bar-height);
  }

  .media-controls.inline.uses-ltr-user-interface-layout-direction .controls-bar.top-left,
  .media-controls.inline:not(.uses-ltr-user-interface-layout-direction) .controls-bar.top-right {
    top: var(--inline-controls-inside-margin);
  }

  .media-controls.inline.uses-ltr-user-interface-layout-direction .controls-bar.top-right,
  .media-controls.inline:not(.uses-ltr-user-interface-layout-direction) .controls-bar.top-left {
    left: auto;
    right: var(--inline-controls-inside-margin);
    top: var(--inline-controls-inside-margin);
  }

  .media-controls.inline.audio .controls-bar {
    top: auto;
    left: auto;
  }

  .media-controls.inline .controls-bar > * {
  }

  .media-controls.inline > button.play-pause.corner {
    left: var(--inline-controls-inside-margin) !important;
    top: auto;
    bottom: var(--inline-controls-inside-margin);
  }

  .media-controls.inline.audio > button.play-pause.corner {
    left: auto !important;
    top: auto;
    bottom: auto;
  }

  .media-controls.inline .controls-bar button {
    height: 100% !important;
  }

  .media-controls.inline button.start.center > picture,
  .media-controls.inline button.play-pause.center.paused > picture {
    left: 3px;
  }

  .media-controls.inline button.start.small-center > picture,
  .media-controls.inline button.play-pause.small-center.paused > picture {
    left: 1px;
  }

  .media-controls.inline .time-control,
  .media-controls.inline .status-label {
    height: 100%;
    display: flex;
    align-items: center;
  }

  .media-controls.mac.fullscreen {
    --controls-bar-width: 468px;
    --tracks-panel-right-margin: 40px;

    width: 100% !important;
    height: 100% !important;
  }

  .media-controls.mac.fullscreen .controls-bar {
    left: calc((100% - var(--controls-bar-width)) / 2);
    bottom: 25px;
    width: var(--controls-bar-width);
    height: var(--fullscreen-controls-bar-height);
  }

  .media-controls.mac.fullscreen:not(.uses-ltr-user-interface-layout-direction)
    :is(.volume-down, .volume.slider, .volume-up) {
    transform: scaleX(-1);
  }

  .media-controls.mac.fullscreen .buttons-container {
    height: 44px;
  }

  .media-controls.mac.fullscreen .buttons-container.left {
    top: 16px;
    height: 16px;
  }

  .media-controls.mac.fullscreen .buttons-container.center {
    left: 50%;
    top: 3px;
    transform: translateX(-50%);
  }

  .media-controls.mac.fullscreen .buttons-container.right {
    right: 0;
  }

  .media-controls.mac.fullscreen .buttons-container.right button {
    top: 18px;
  }

  .media-controls.mac.fullscreen .time-control {
    position: absolute;
    left: 10px;
    top: 49px;
    height: 16px;
    display: flex;
    align-items: center;
  }

  .media-controls.mac.fullscreen .controls-bar .status-label {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 13px;
    font-size: 14px;
    text-align: center;
  }

  .media-controls.mac.inline .volume-slider-container {
    position: absolute;
    bottom: calc(var(--inline-controls-bar-height) + var(--inline-controls-inside-margin));
    width: 94px;
    height: 31px;
    display: flex;
    align-items: center;
    justify-content: center;
    --volume-slider-transform: rotate(-90deg) translate(26px, -30px);
    transform: var(--volume-slider-transform);
  }

  .media-controls.mac.inline.audio .volume-slider-container {
    transform: var(--volume-slider-transform) translateY(-8px);
  }

  .media-controls.mac.inline .volume-slider-container > .background-tint {
    top: 0;
    left: var(--inline-controls-inside-margin);
    right: 0;
    bottom: 0;
    width: auto;
  }

  .media-controls.mac.inline .volume-slider-container > .background-tint > div {
    border-radius: 8px;
  }

  .media-controls.mac.inline .volume-slider-container > .slider {
    margin-left: 6px;
  }

  :host {
    -webkit-user-select: none !important;
    -webkit-touch-callout: none !important;
  }

  :host(audio) {
    width: 250px;
    height: var(--inline-controls-bar-height);
    min-width: 44px !important;
    min-height: var(--inline-controls-bar-height) !important;
  }

  * {
    --inline-controls-inside-margin: 6px;
    --fullscreen-controls-bar-height: 75px;
    --primary-glyph-color: rgba(255, 255, 255, 0.75);
    --secondaryary-glyph-color: rgba(255, 255, 255, 0.55);
  }

  :host(audio),
  :host(video.media-document.audio),
  * {
    --inline-controls-bar-height: 31px;
  }

  .media-controls-container {
    all: initial;
    display: block;
    cursor: inherit;
    visibility: inherit;
    pointer-events: inherit;
    -webkit-cursor-visibility: inherit;
    position: absolute;
    will-change: z-index;
  }

  .media-controls-container,
  .media-controls-container > * {
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }

  .media-controls-container,
  .media-controls-container * {
    -webkit-text-zoom: reset;
    -webkit-text-size-adjust: auto;
    -webkit-font-smoothing: subpixel-antialiased;
  }

  .media-controls-container > * {
    position: absolute;
  }

  .media-controls {
    height: 100%;
    font-family: -apple-system;
    -webkit-user-select: none;
    white-space: nowrap;
    text-align: initial;
    transform-origin: 0 0;
  }

  :host(:-webkit-animating-full-screen-transition) .media-controls {
    display: none;
  }

  .media-controls > * {
    transition: opacity 0.1s linear;
  }

  .media-controls.shows-tracks-panel .controls-bar > *,
  .media-controls.shows-tracks-panel > button {
    pointer-events: none;
  }

  .media-controls.faded > *:not(.placard) {
    opacity: 0;
    pointer-events: none;
    transition-duration: 0.25s;
  }

  .media-controls .controls-bar {
    position: absolute;
  }

  .media-controls.fade-in {
    animation-name: fade-in;
    animation-duration: 350ms;
  }

  .media-controls .time-label,
  .media-controls .status-label {
    color: var(--primary-glyph-color);
    mix-blend-mode: lighten;
  }

  @keyframes fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (inverted-colors) {
    :host {
      filter: invert(100%);
    }
    picture {
      filter: none;
    }
  }

  :host(.media-document) {
    max-width: 100% !important;
    max-height: 100% !important;
    min-height: 50px !important;

    margin: auto !important;
    position: absolute !important;
    top: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    left: 0 !important;
  }

  :host(.media-document.audio) {
    padding: 0 10px;
    box-sizing: border-box;
    height: var(--inline-controls-bar-height) !important;
  }

  :host(.media-document.audio.mac) {
    width: 650px !important;
    min-height: var(--inline-controls-bar-height) !important;
  }

  :host(.media-document.audio.ipad) {
    width: 650px !important;
  }

  :host(.media-document.audio.iphone) {
    width: 100% !important;
  }

  :host(.media-document.video.mac) {
    min-width: 700px !important;
  }

  :host(.media-document.video.ipad) {
    min-width: 700px !important;
  }

  @media (max-width: 699px) {
    :host(.media-document.video.ipad) {
      min-width: 100% !important;
    }
  }

  :host(.media-document.video.iphone) {
    width: 100% !important;
  }

  :host(.media-document.video.invalid) .placard {
    background-color: transparent;
  }

  .placard {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;

    background-color: black;
    color: rgb(164, 164, 164);

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .placard .container {
    max-width: 402px;
    width: 100%;
  }

  .placard button {
    position: relative;
    margin: auto;
    margin-bottom: 10px;
    pointer-events: none;
  }

  .placard button > picture {
    background-color: rgb(164, 164, 164) !important;
  }

  .placard .title,
  .placard .description {
    padding: 0 10px;
    text-align: center;
    text-overflow: ellipsis;
    overflow: hidden;
    cursor: default;
  }

  .placard .title {
    font-size: 20px;
  }

  .placard .description {
    font-size: 13px;
    white-space: initial;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .media-controls:not(.uses-ltr-user-interface-layout-direction) .placard {
    direction: rtl;
  }

  .slider {
    position: relative;
  }

  .slider > .custom-slider,
  .slider > input {
    position: absolute;
    left: 0;
    width: 100%;
  }

  .slider > .custom-slider {
    pointer-events: none;
    top: 6px;
    height: 4px;
  }

  .slider > .custom-slider > * {
    position: absolute;
  }

  .slider > .custom-slider > .fill {
    top: 0;
    height: 100%;
    border-radius: 4.5px;
    mix-blend-mode: lighten;
  }

  .slider > .custom-slider > .track {
    left: 0;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.1);
  }

  .slider > .custom-slider > .primary {
    left: 0;
    background-color: rgba(255, 255, 255, 0.35);
  }

  .slider > .custom-slider > .secondary {
    background-color: rgba(255, 255, 255, 0.08);
  }

  .slider > .custom-slider > .knob {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background-color: white;
    transform: translate(-50%, -25%);
  }

  .slider > input {
    top: 0;
    margin: 0;
    height: 100%;
    background-color: transparent;
    -webkit-appearance: none !important;

    outline: none;
  }

  .ios .slider > input {
    pointer-events: none;

    -webkit-user-select: none !important;
    -webkit-touch-callout: none !important;
    -webkit-tap-highlight-color: transparent;
  }

  .slider > input::-webkit-slider-thumb {
    width: 9px;
    height: 100%;
    border: none;
    box-shadow: none;
    background-color: transparent;
    -webkit-appearance: none !important;
    pointer-events: all;
  }

  .slider.disabled > input,
  .slider.disabled > .custom-slider > .primary,
  .slider.disabled > .custom-slider > .secondary,
  .slider.disabled > .custom-slider > .knob {
    display: none;
  }

  .ios .slider > input {
    width: calc(100% + 16px);
    height: calc(100% + 10px);
    transform: translate(-8px, -5px);
  }

  .ios .slider > input::-webkit-slider-runnable-track {
    height: 100%;
  }

  .ios .slider > input::-webkit-slider-thumb {
    padding: 0 8px;
    box-sizing: content-box;
  }

  .status-label {
    position: absolute;

    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;

    font-size: 12px;
  }

  video::-webkit-media-text-track-container {
    overflow: hidden;
    padding-bottom: 0;
    z-index: 0;

    text-align: center;
    color: rgba(255, 255, 255, 1);

    letter-spacing: normal;
    word-spacing: normal;
    text-transform: none;
    text-indent: 0;
    text-decoration: none;
    pointer-events: none;
    -webkit-user-select: none;

    flex: 1 1 auto;

    -webkit-line-box-contain: block inline-box replaced;
  }

  video[controls]::-webkit-media-text-track-container.visible-controls-bar {
    height: calc(100% - var(--inline-controls-bar-height) - var(--inline-controls-inside-margin));
  }

  video::cue {
    background-color: rgba(0, 0, 0, 0.8);
  }

  video::-webkit-media-text-track-display {
    position: absolute;
    overflow: hidden;
    white-space: pre-wrap;
    box-sizing: border-box;
    font: 22px sans-serif;
  }

  video::-webkit-media-text-track-display-backdrop {
    display: inline-block;
  }

  video::cue(:future) {
    color: gray;
  }

  video::-webkit-media-text-track-container b {
    font-weight: bold;
  }

  video::-webkit-media-text-track-container u {
    text-decoration: underline;
  }

  video::-webkit-media-text-track-container i {
    font-style: italic;
  }

  video::-webkit-media-text-track-container .hidden {
    display: none;
  }

  .time-label {
    font-family: Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji',
      'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    padding: 0 8px;
    font-size: 12px;
    text-align: right;
    font-feature-settings: 'case';
  }

  .tracks-panel {
    position: absolute;
    display: inline-block;
  }

  .tracks-panel > .scrollable-container {
    border-radius: 8px;
  }

  .tracks-panel > .scrollable-container {
    position: relative;
    overflow-y: scroll;
  }

  .tracks-panel * {
    font-size: 14px;
    font-weight: 500;
  }

  .tracks-panel.fade-out {
    transition-property: opacity;
    transition-duration: 265ms;
    opacity: 0;
  }

  .tracks-panel section {
    border-top: 2px solid var(--secondaryary-glyph-color);
    will-change: transform;
  }

  .tracks-panel section:first-of-type {
    border-top: 0;
  }

  .tracks-panel section > h3 {
    color: var(--primary-glyph-color);
    mix-blend-mode: lighten;
    padding: 5px 20px 1px 21px;
    margin: 0;
  }

  .tracks-panel section > ul {
    list-style-type: none;
    margin-top: 0;
    padding: 0;
  }

  .tracks-panel section > ul > li {
    position: relative;
    padding: 1px 20px 1px 33px;
    color: white;
  }

  .tracks-panel section > ul > li:focus {
    background-color: rgb(20, 105, 209);
    outline: none;
  }

  .tracks-panel section > ul > li.selected:before {
    position: absolute;
    top: 3px;
    left: 12px;
    width: 12px;
    display: inline-block;
    content: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><polygon fill="white" points="252.301,4.477 126.667,194.104 43.358,108.3 6.868,161.408 132.515,290.814 297.732,49.926"/></svg>');
  }

  .tracks-panel section > ul > li.animated {
    animation-name: tracks-panel-item-selection;
    animation-duration: 150ms;
    animation-timing-function: step-end;
    animation-fill-mode: forwards;
  }

  @keyframes tracks-panel-item-selection {
    0%,
    55.55% {
      background-color: rgba(26, 68, 243, 0.6);
      -webkit-backdrop-filter: saturate(180%) blur(20px);
    }

    22.22% {
      background: none;
      -webkit-backdrop-filter: none;
    }
  }
</style>
