import AudioTest from './AudioTest';
import BeatTest from './BeatTest';


export default {
  path: 'test',
  name: 'Test',
  childRoutes: [
    {
      path: 'audio',
      name: 'Audio Test',
      component: AudioTest
    },
    {
      path: 'beat',
      name: 'Beat Test',
      component: BeatTest
    }
  ],
};