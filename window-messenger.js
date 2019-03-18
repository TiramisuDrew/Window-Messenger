"use strict";
/// <reference path="window-message.d.ts" />
/// <reference path="window-message-handler.d.ts" />
var WindowMessenger = /** @class */ (function () {
    function WindowMessenger() {
        this._handlersOfEvent = new Map();
        this._sourcesOfHandler = new Map();
        window.addEventListener('message', this.windowMessageEventHandler = this.windowMessageEventHandler.bind(this));
    }
    WindowMessenger.getSingleton = function () {
        return WindowMessenger._singleton || (WindowMessenger._singleton = new WindowMessenger());
    };
    WindowMessenger.prototype.emit = function (event, data, destination, destinationHostname) {
        if (!destination)
            destination = window;
        var windowMessage = {
            event: event,
            data: data
        };
        destination.postMessage(windowMessage, destinationHostname || '*');
    };
    WindowMessenger.prototype.off = function (event, handler) {
        if (!this._handlersOfEvent.has(event))
            return;
        if (handler) {
            var handlerArr = this._handlersOfEvent.get(event);
            for (var i = 0; i < handlerArr.length; ++i) {
                var h = handlerArr[i];
                if (h === handler) {
                    handlerArr.splice(i, 1);
                    if (this._sourcesOfHandler.has(h))
                        this._sourcesOfHandler.delete(h);
                    break;
                }
            }
            if (handlerArr.length)
                this._handlersOfEvent.delete(event);
        }
        else {
            var handlerArr = this._handlersOfEvent.get(event);
            for (var _i = 0, handlerArr_1 = handlerArr; _i < handlerArr_1.length; _i++) {
                var h = handlerArr_1[_i];
                if (this._sourcesOfHandler.has(h))
                    this._sourcesOfHandler.delete(h);
            }
            this._handlersOfEvent.delete(event);
        }
    };
    WindowMessenger.prototype.on = function (event, handler, trustedSources) {
        if (this._handlersOfEvent.has(event))
            this._handlersOfEvent.get(event).push(handler);
        else
            this._handlersOfEvent.set(event, [handler]);
        if (trustedSources) {
            if (trustedSources.constructor === Array)
                this._sourcesOfHandler.set(handler, trustedSources);
            else if (typeof trustedSources === 'string')
                this._sourcesOfHandler.set(handler, [trustedSources]);
        }
    };
    WindowMessenger.prototype.once = function (event, handler, trustedSources) {
        var self = this;
        this.on(event, function f(data, origin, source) {
            self.off(event, f);
            handler.apply(self, [data, origin, source]);
        }, trustedSources);
    };
    WindowMessenger.prototype.windowMessageEventHandler = function (messageEvent) {
        if (!messageEvent.data)
            return;
        debugger;
        var windowMessage = messageEvent.data;
        if (!this._handlersOfEvent.has(windowMessage.event))
            return;
        var handlers = this._handlersOfEvent.get(windowMessage.event), origin = messageEvent.origin, source = messageEvent.source;
        for (var _i = 0, handlers_1 = handlers; _i < handlers_1.length; _i++) {
            var h = handlers_1[_i];
            if (this._sourcesOfHandler.has(h)) {
                var trustedSources = this._sourcesOfHandler.get(h);
                var shouldTrust = false;
                for (var _a = 0, trustedSources_1 = trustedSources; _a < trustedSources_1.length; _a++) {
                    var s = trustedSources_1[_a];
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
            catch (error) {
                console.error(error);
            }
        }
    };
    return WindowMessenger;
}());
