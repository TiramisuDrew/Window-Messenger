interface WindowMessage {
    event: string;
    data: any;
}
declare type WindowMessageHandler = (data: any, origin: string, source: Window) => any;
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
