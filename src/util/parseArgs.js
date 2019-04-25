export default (argv: string[]) => argv.reduce((args, arg, index) => {
    if (!arg.startsWith('-')) return args;
    const key = arg.slice(arg.startsWith('--') ? 2 : 1);
    const next = argv[index + 1] || '-end';
    if (next.startsWith('-')) return { ...args, [key]: true };
    return { ...args, [key]: next };
}, {});
