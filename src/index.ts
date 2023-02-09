import * as components from './components';
import * as lib from './lib';

declare global {
    interface Window {
        mnmo: any;
    }
}

const mnmo = {
    lib,
    ...components
}

window.mnmo = mnmo;
