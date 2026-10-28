import {Composition} from 'remotion';
import {Reel, FPS, TOTAL_SECONDS} from './Reel';

export const Root: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    durationInFrames={FPS * TOTAL_SECONDS}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
