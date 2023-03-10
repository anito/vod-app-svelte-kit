import './_index.scss';

import VideoPlayer from './VideoPlayer.svelte';
import Video from './Video.svelte';
// import Ui from './UI/__ui.svelte';
import Ui from './UI/Ui.svelte';
import { mute } from './mute';

export { Video, Ui, mute };
export default VideoPlayer;
