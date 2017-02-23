import { IMidiFile, IMidiJsonParserRequestEventData } from 'midi-json-parser-worker';
import { IMidiJsonParserResponseEvent } from './interfaces/midi-json-parser-response-event';

export const load = (url: string) => {
    let index = 0;

    const worker = new Worker(url);

    const parseArrayBuffer = (arrayBuffer: ArrayBuffer): Promise<IMidiFile> => {
        let currentIndex = index;

        index += 1;

        const transferSlice = (byteIndex: number) => {
            if (byteIndex + 1048576 < arrayBuffer.byteLength) {
                const slice = arrayBuffer.slice(byteIndex, byteIndex + 1048576);

                worker.postMessage(<IMidiJsonParserRequestEventData> {
                    arrayBuffer: slice,
                    byteIndex,
                    byteLength: arrayBuffer.byteLength,
                    index: currentIndex
                }, [
                    slice
                ]);

                setTimeout(() => transferSlice(byteIndex + 1048576));
            } else {
                const slice = arrayBuffer.slice(byteIndex);

                worker.postMessage(<IMidiJsonParserRequestEventData> {
                    arrayBuffer: slice,
                    byteIndex,
                    byteLength: arrayBuffer.byteLength,
                    index: currentIndex
                }, [
                    slice
                ]);
            }
        };

        return new Promise((resolve, reject) => {
            const onMessage = (event: IMidiJsonParserResponseEvent) => {
                const { data: { err, index: i, midiFile } } = event;

                if (i === currentIndex) {
                    worker.removeEventListener('message', onMessage);

                    if (midiFile === null) {
                        const { message } = err;

                        reject(new Error(message));
                    } else {
                        resolve(midiFile);
                    }
                }
            };

            worker.addEventListener('message', onMessage);

            transferSlice(0);
        });
    };

    return {
        parseArrayBuffer
    };
};
