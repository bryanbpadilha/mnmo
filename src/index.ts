// TODO: Figure out how to document functions
// TODO: Figure out how context should work (reducer-like, maybe?)

import * as components from './components';
import * as util from './util';

export default { ...components, util };

declare global {
    interface Window {
        mnmo: any;
    }
}

window.mnmo = {
    util,
    ...components
};
