import mock, { events, Core, pipe } from '../core';

const rpc: typeof mock = window.core instanceof Function ? window.core : mock;

const core: Core = events.reduce((dict, key) => ({ ...dict, [key]: rpc.bind(null, key) }), {});
core.pipe = pipe;

const useCore = () => core;
export default useCore;
