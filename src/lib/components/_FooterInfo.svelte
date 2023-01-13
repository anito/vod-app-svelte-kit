<script lang="ts">
  import { users, infos } from '$lib/stores';
  import type { Issue } from '$lib/types';

  export let selectionUserId: string | null;

  $: user = $users.find((usr) => usr.id === selectionUserId);
  $: userInfos = ((infos: Map<string, { issues: Issue[] }> = new Map()) => {
    if (user) {
      return infos.get(user.id)?.issues || [];
    }
    return [];
  })($infos as Map<string, { issues: Issue[] }>);
</script>

<div class="info">
  {#each userInfos as info}
    <div class="chip warning {info.type}">
      <i class="material-icons mdc-button__icon mr-1">circle_notifications</i>
      {info.label}
    </div>
  {/each}
</div>

<style>
</style>
