import * as components from './components';
import * as lib from './lib';
import * as util from './util';
export default { ...components, ...lib };

declare global {
    interface Window {
        mnmo: any;
    }
}

const mnmo = {
    util,
    ...lib,
    ...components
}

window.mnmo = mnmo;
