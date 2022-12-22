<script>
  // @ts-nocheck

  import './_textfield.scss';
  import './_button.scss';
  import { settings, salutation } from '$lib/stores';
  import Button, { Label } from '@smui/button';
  import Textfield from '@smui/textfield';
  import { _ } from 'svelte-i18n';

  export let template = {};
  export let working = {};
  export let user;
  export let canSave;

  const minWidth = 100;

  let id;
  let stringified;
  let _template = {};

  $: logo = ($settings.Site && $settings.Site['logo']) || '';
  $: sitename = ($settings.Site && $settings.Site['name']) || 'Sitename';
  $: template.id !== id && createWorkingCopy();
  $: canSave = JSON.stringify(working) !== stringified;

  export function createWorkingCopy() {
    template.items.map((item) => {
      _template[item.field.name] = item.content;
    });
    id = template.id;
    stringified = JSON.stringify(_template);
    working = { ..._template };
  }

  function getWidth(val = '', m = 50) {
    let chars = val.length;
    return chars * m - chars * m * 0.8;
  }

  export function resetTemplate() {
    working = { ..._template };
  }
</script>

<div class="templates template-container grid main">
  <div class="header grid-item">
    <img src={logo} alt="" width="264" />
  </div>
  <div class="banner grid-item main-grid-area">
    <Textfield
      label={$_('text.subject')}
      placeholder={$_('text.general-information')}
      bind:value={working['subject']}
      style="width: {getWidth(working['subject'], 55)}px; min-width: {minWidth}px;"
    />
  </div>
  <div class="grid content main-grid-area">
    <div class="starter grid-item">
      <span>{$salutation}, {user?.name}!</span>
    </div>
    <div class="before-content grid-item">
      <Textfield
        textarea
        label={$_('text.before-content')}
        bind:value={working['before-content']}
        style="width: 100%;"
      />
    </div>
    <div class="content grid-item">
      <Textfield
        textarea
        label={$_('text.content')}
        bind:value={working['content']}
        style="width: 100%;"
      />
      {#if template.data}
        <div class="template-data  flex justify-center mt-3 mb-3">
          <Button
            class={!template.data.validate() ? 'error' : ''}
            variant="unelevated"
            style="width: 80%; height: 80px;"
          >
            <Label>{template.data.validate() ? template.data.label : $_('text.missing-data')}</Label
            >
          </Button>
        </div>
      {/if}
    </div>
    <div class="after-content grid-item">
      <Textfield
        textarea
        label={$_('text.after-content')}
        bind:value={working['after-content']}
        style="width: 100%;"
      />
    </div>
  </div>
  <div class="grid footer main-grid-area">
    <div class="sitename grid-item">
      <span>
        <Textfield
          label={$_('text.before-sitename')}
          bind:value={working['before-sitename']}
          style="width: {getWidth(working['before-sitename'] || '')}px; min-width: {minWidth}px;"
        />
      </span>
      <span>{sitename}</span>
      <span>
        <Textfield
          label={$_('text.after-sitename')}
          bind:value={working['after-sitename']}
          style="width: {getWidth(working['after-sitename'] || '')}px; min-width: {minWidth}px;"
        />
      </span>
    </div>
    <div class="before-footer grid-item">
      <Textfield
        textarea
        label={$_('text.before-footer')}
        bind:value={working['before-footer']}
        style="width: 100%;"
      />
    </div>
    <div class="footer grid-item">
      <Textfield
        textarea
        label={$_('text.footer')}
        bind:value={working['footer']}
        style="width: 100%;"
      />
    </div>
    <div class="after-footer grid-item">
      <Textfield
        textarea
        label={$_('text.after-footer')}
        bind:value={working['after-footer']}
        style="width: 100%;"
      />
    </div>
  </div>
</div>

<style>
  .template-container {
    max-width: 560px;
    margin: 0 auto;
  }
  .grid {
    grid-template-columns: 1fr;
    grid-gap: 0;
    background-color: var(--back-grid-item);
  }
  .grid-item {
    padding: 15px 0;
    border: 0 none;
  }
  .content.main-grid-area {
    border: 1px solid var(--on-surface);
    border-top: 0 none;
    padding: 20px;
  }
  .main-grid-area {
    padding: 20px;
  }
  .grid.main {
    grid-template-areas:
      'header'
      'banner'
      'content'
      'footer';
  }
  .header {
    grid-area: header;
    margin: 0 auto;
  }
  .banner {
    grid-area: banner;
    background-color: var(--primary);
    color: var(--background);
    height: 80px;
    display: flex;
    align-items: center;
    padding: 0 30px;
  }
  .grid.content {
    grid-area: content;
    grid-template-areas:
      'starter'
      'before-content'
      'content'
      'after-content';
  }
  .grid.footer {
    grid-area: footer;
    grid-template-areas:
      'sitename'
      'before-footer'
      'footer'
      'after-footer';
  }
  .starter {
    grid-area: starter;
    margin-top: 20px;
    padding: 20px;
  }
  .before-content {
    grid-area: before-content;
  }
  .content {
    grid-area: content;
  }
  .after-content {
    grid-area: after-content;
  }
  .sitename {
    grid-area: sitename;
  }
  .before-footer {
    grid-area: before-footer;
  }
  .footer {
    grid-area: footer;
  }
  .after-footer {
    grid-area: after-footer;
  }
</style>
