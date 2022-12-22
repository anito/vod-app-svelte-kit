<script>
  import './_chip.scss';
  import { localeFormat } from '$lib/utils';
  import { users } from '$lib/stores';
  import Chip, { Set, LeadingIcon, Text } from '@smui/chips';
  import { _, locale } from 'svelte-i18n';

  /**
   * @type {string | null}
   */
  export let selectionUserId;

  let expiresChipLabel = '';
  let chipIcon = '';
  let expirationDate;
  let expires;
  let isExpired;

  $: dateFormat = $locale?.indexOf('de') != -1 ? 'dd. MMM yyyy HH:mm' : 'yyyy-MM-dd hh:mm a';
  $: currentUser = ((id) => $users.filter((usr) => usr.id === id))(selectionUserId)[0];
  $: ((user) => {
    expires = user?.expires;
    isExpired = (expires && expires * 1000 < +new Date().getTime()) || false;
    expirationDate =
      (expires && localeFormat(new Date(parseInt(expires) * 1000), dateFormat)) || void 0;
    expiresChipLabel =
      (expirationDate &&
        `${
          isExpired
            ? $_('text.token-expired-on', { values: { date: expirationDate } })
            : $_('text.token-expires-on', { values: { date: expirationDate } })
        }`) ||
      $_('text.no-token-information');
    chipIcon =
      (expirationDate && (isExpired ? 'hourglass_empty' : 'hourglass_full')) ||
      'hourglass_disabled';
  })(currentUser);
</script>

<span class="chip-items">
  <Set chips={[{ id: 0 }]} let:chip>
    <Chip {chip} class="light" style="width: 100%">
      <LeadingIcon class="material-icons">{chipIcon}</LeadingIcon>
      <Text>{expiresChipLabel}</Text>
    </Chip>
  </Set>
</span>
