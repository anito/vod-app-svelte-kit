<script lang="ts">
  import { page } from '$app/stores';
  import Paper, { Title, Subtitle, Content } from '@smui/paper';

  export { className as class };
  export let title = 'Title';
  export let sub = '';
  export let color = '';

  let path = $page.url.pathname;
  let className = '';

  $: redirect = path ? `?redirect=${path}` : '';
  $: href = `/login${redirect}`;
</script>

<Paper class={className} {color}>
  {#if title}
    <Title style="color: var(--text-dark)">{title}</Title>
  {/if}
  {#if sub}
    <Subtitle>{sub}</Subtitle>
  {/if}
  <Content>
    <slot {href} />
  </Content>
</Paper>
