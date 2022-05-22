<script>
  import Button from '@smui/button';
  import Textfield from '@smui/textfield';
  import Icon from '@smui/textfield/icon';
  import HelperText from '@smui/textfield/helper-text';
  import { Label } from '@smui/common';

  export let filename;
  export let description;
</script>

<div class="table table-striped files" id="previews">
  <Textfield
    variant="outlined"
    name="Video[filename]"
    bind:value={filename}
    withLeadingIcon
    label="Filename"
    input$aria-controls="helper-text-outlined-filename"
    input$aria-describedby="helper-text-outlined-filename"
  >
    <Icon class="material-icons">event</Icon>
  </Textfield>
  <HelperText id="helper-text-outlined-filename">Helper Text</HelperText>

  <Textfield textarea name="description" bind:value={description} label="Comment" />
  <Button type="submit" variant="raised">
    <Label>Upload</Label>
  </Button>
</div>

<style>
</style>
