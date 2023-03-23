import './_index.scss';

import VideoPlayer from './VideoPlayer.svelte';
import Video from './Video.svelte';
import Ui from './UI/Ui2.svelte';
import { mute } from './mute';
import { format } from './utils';

export { Video, Ui, mute, format };
export default VideoPlayer;
