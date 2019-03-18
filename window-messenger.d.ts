/// <reference path="src/window-message.d.ts" />
/// <reference path="src/window-message-handler.d.ts" />
declare class WindowMessenger {
    constructor();
    protected _handlersOfEvent: Map<string, WindowMessageHandler[]>;
    protected _sourcesOfHandler: Map<Function, string[]>;
    emit(event: string, data: any, destination?: Window, destinationHostname?: string): void;
    off(event: string, handler?: Function): void;
    on(event: string, handler: WindowMessageHandler, trustedSources?: string[] | string): void;
    once(event: string, handler: WindowMessageHandler, trustedSources?: string[]): void;
    private windowMessageEventHandler;
}
