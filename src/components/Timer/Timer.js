import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { interval, fromEvent, Observable } from 'rxjs';
import { debounceTime, filter, map, buffer, takeUntil } from 'rxjs/operators';

import './timer.css';

const STOP_TIMER = 'stop';
const START_TIMER = 'start';
const RESET_TIMER = 'reset';
const WAIT_TIMER = 'pause';
const TIME_FOR_DOUBLE_CLICK = 300;
const NUMBER_CLICK = 2;
const TIME_INTERVAL = 1000;

const Timer = () => {
    const [time, setTime] = useState(0);
    const [statusTimer, setStatusTimer] = useState(STOP_TIMER);
    const sub = useRef();
    const initTimer = new Observable((observer) => {
        interval(TIME_INTERVAL).subscribe((val) => {
            observer.next(val);
        });
    });

    const button = document.querySelector('#wait');
    const click$ = fromEvent(button, 'click');

    const doubleClick$ = click$.pipe(
        buffer(click$.pipe(debounceTime(TIME_FOR_DOUBLE_CLICK))),
        map((TimesClick) => TimesClick.length),
        filter((doubleClicks) => doubleClicks === NUMBER_CLICK)
    );

    const waitClick = doubleClick$.subscribe({
        next() {
            setStatusTimer(WAIT_TIMER);
        },
    });

    useEffect(() => {
        switch (statusTimer) {
            case START_TIMER:
                sub.current = initTimer.subscribe({
                    next(x) {
                        setTime((x) => x + TIME_INTERVAL);
                    },
                });
                break;
            case STOP_TIMER:
                if (sub.current) {
                    sub.current.unsubscribe();
                }
                break;
            case RESET_TIMER:
                if (sub.current) {
                    setTime(0);
                    sub.current.unsubscribe();
                    setStatusTimer(START_TIMER);
                }
                break;
            case WAIT_TIMER:
                if (sub.current) {
                    setTime(time);
                    sub.current.unsubscribe();
                }
                break;
        }

        return () => {
            if (sub.current) {
                sub.current.unsubscribe();
            }
        };
    }, [statusTimer]);

    const start = () => {
        setStatusTimer(START_TIMER);
    };

    const stop = () => {
        setStatusTimer(STOP_TIMER);
        setTime(0);
    };
    const reset = () => {
        setStatusTimer(RESET_TIMER);
    };

    return (
        <main className="wrapper">
            <div className="timer__time">
                {new Date(time).toISOString().substr(11, 8)}
            </div>
            <div className="timer__btns">
                <button className="start-button" onClick={start}>
                    Start
                </button>
                <button className="stop-button" onClick={stop}>
                    Stop
                </button>
                <button onClick={reset}>Reset</button>
                <button id="wait">Wait</button>
            </div>
        </main>
    );
};

export default Timer;
