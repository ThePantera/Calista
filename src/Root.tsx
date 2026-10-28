import {Composition} from 'remotion';
import {Reel, FPS, TOTAL_SECONDS} from './Reel';
import {Video01} from './video01/Video01';
import {FPS as V1_FPS, TOTAL_FRAMES as V1_FRAMES} from './video01/timeline';

export const Root: React.FC = () => (
  <>
  <Composition
    id="Reel"
    component={Reel}
    durationInFrames={FPS * TOTAL_SECONDS}
    fps={FPS}
    width={1080}
    height={1920}
  />
  <Composition
    id="Video01"
    component={Video01}
    durationInFrames={V1_FRAMES}
    fps={V1_FPS}
    width={1080}
    height={1920}
  />
  </>
);
