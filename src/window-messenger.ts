interface WindowMessage {
    event: string;
    data: any;
}

type WindowMessageHandler = (data: any, origin: string, source: Window) => any;

class WindowMessenger {

    constructor() {

        window.addEventListener('message', this.windowMessageEventHandler = this.windowMessageEventHandler.bind(this));
    }

    protected _handlersOfEvent: Map<string, WindowMessageHandler[]> = new Map();
    protected _sourcesOfHandler: Map<Function, string[]> = new Map();

    emit(event: string, data: any, destination?: Window, destinationHostname?: string) {

        if (!destination)
            destination = window;

        let windowMessage = {
            event: event,
            data: data
        } as WindowMessage;

        destination.postMessage(windowMessage, destinationHostname || '*');
    }

    off(event: string, handler?: Function) {

        if (!this._handlersOfEvent.has(event))
            return;

        if (handler) {            

            let handlerArr = this._handlersOfEvent.get(event) as WindowMessageHandler[];

            for(let i = 0; i < handlerArr.length; ++i) {

                let h = handlerArr[i];

                if (h === handler) {
                    
                    handlerArr.splice(i,1);

                    if (this._sourcesOfHandler.has(h))
                        this._sourcesOfHandler.delete(h);

                    break;
                }
            }

            if (handlerArr.length)
                this._handlersOfEvent.delete(event);

        } else {

            let handlerArr = this._handlersOfEvent.get(event) as WindowMessageHandler[];

            for(let h of handlerArr)
                if (this._sourcesOfHandler.has(h))
                    this._sourcesOfHandler.delete(h);
            
            this._handlersOfEvent.delete(event);
        }
    }

    on(event:string, handler: WindowMessageHandler, trustedSources?: string[] | string) {

        if (this._handlersOfEvent.has(event))
            (this._handlersOfEvent.get(event) as WindowMessageHandler[]).push(handler);

        else this._handlersOfEvent.set(event, [handler]);

        if (trustedSources) {

            if (trustedSources.constructor === Array)
                this._sourcesOfHandler.set(handler, trustedSources as string[]);

            else if (typeof trustedSources === 'string')
                this._sourcesOfHandler.set(handler, [trustedSources as string]);
        }
    }

    once(event: string, handler: WindowMessageHandler, trustedSources?: string[]) {

        let self = this;

        this.on(event, function f(data, origin: string, source: Window){

            self.off(event, f);
            handler.apply(self, [data, origin, source]);

        }, trustedSources);
    }

    private windowMessageEventHandler(messageEvent: MessageEvent) {

        if (!messageEvent.data)
            return;

        debugger;

        let windowMessage = messageEvent.data as WindowMessage;

        if (!this._handlersOfEvent.has(windowMessage.event))
            return;

        let handlers = this._handlersOfEvent.get(windowMessage.event) as WindowMessageHandler[],
            origin = messageEvent.origin,
            source = messageEvent.source as Window;

        for(let h of handlers) {

            if (this._sourcesOfHandler.has(h)) {

                let trustedSources = this._sourcesOfHandler.get(h) as string[];
                let shouldTrust = false;
                
                for(let s of trustedSources) {

                    if (s === origin) {

                        shouldTrust = true;
                        break;
                    }
                }

                if (!shouldTrust)
                    return;
            }

            try {
                h.apply(this, [windowMessage.data, origin, source]);
            }
            catch(error) {

                console.error(error);
            }            
        }
    }
}