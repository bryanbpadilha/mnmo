// TODO: Figure out how to document functions
// TODO: Figure out how context should work (reducer-like, maybe?)

import * as components from './components';
import * as context from './context';
import * as lib from './lib';
import * as util from './util';

export default { ...components, ...lib, util, context };

declare global {
    interface Window {
        mnmo: any;
    }
}

window.mnmo = {
    util,
    context,
    ...lib,
    ...components
};
