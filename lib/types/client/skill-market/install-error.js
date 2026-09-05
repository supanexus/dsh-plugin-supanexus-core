export class InstallPluginError extends Error {
    attempts;
    log;
    constructor(message, options) {
        super(message);
        this.name = 'InstallPluginError';
        if (options?.attempts !== undefined)
            this.attempts = options.attempts;
        if (options?.log !== undefined)
            this.log = options.log;
    }
}
//# sourceMappingURL=install-error.js.map