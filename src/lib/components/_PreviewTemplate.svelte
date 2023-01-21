<script lang="ts">
  import IconButton, { Icon } from '@smui/icon-button';

  export let showFileNames = false;
  export let showFileProgress = false;
  export let showFileSize = false;
  let poster = `https://via.placeholder.com/80x80.png?text=video`;
</script>

<div class="file-row">
  <!-- This is used as the file preview template -->
  <div>
    <span class="preview">
      <img class="rounded" alt="preview" data-dz-thumbnail src={poster} />
      <IconButton class="dz-button" data-dz-remove>
        <Icon class="material-icons">cancel</Icon>
      </IconButton>
    </span>
  </div>
  <div class="show-if" class:active={showFileNames}>
    <p class="name" data-dz-name />
    <strong class="error text-danger" data-dz-errormessage />
  </div>
  <div class="size show-if" class:active={showFileSize}>
    <p class="file-size" data-dz-size />
  </div>
  <div class="progress-container show-if" class:active={showFileProgress}>
    <div
      class="progress progress-striped active"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="0"
    >
      <div class="progress-bar progress-bar-success" style="" data-dz-uploadprogress />
    </div>
  </div>
</div>

<style lang="scss">
  .file-row {
    margin: 10px;
    position: relative;
    z-index: 1;
    display: flex;
    height: var(--thumbnail-h);
    :global(.dz-error) {
      background-color: var(--error);
    }
    :global(.dz-button) {
      position: absolute;
      top: -24px;
      right: -24px;
    }
    .show-if {
      display: none;
      &.active {
        display: inline-block;
      }
      &.size {
        position: absolute;
        display: flex;
        justify-content: center;
        width: 100%;
        align-self: center;
        .file-size {
          border-radius: 999px;
          font-size: 0.6rem;
          font-family: 'Fira Mono';
          display: flex;
          background-color: #fffd;
          color: #222;
          padding: 2px 5px;
          line-height: 1em;
          justify-content: center;
          align-items: center;
          max-width: 70%;
          :global(strong) {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
    .progress-container {
      display: inline-block;
      position: absolute;
      z-index: 1;
      bottom: 1px;
      padding: 3px;
      width: 100%;

      .progress {
        height: 2px;
        background-color: #dddddd;

        .progress-bar {
          background-color: var(--primary);
          height: 100%;
          width: 0;
        }
      }
    }
  }
</style>
