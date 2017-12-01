import { addUniqueNumber } from 'fast-unique-numbers';
import { IMidiFile, IParseRequest, IParseResponse, IWorkerEvent } from 'midi-json-parser-worker';

export { IMidiFile };

export const load = (url: string) => {
    const worker = new Worker(url);

    const ongoingRecordingRequests: Set<number> = new Set();

    const parseArrayBuffer = (arrayBuffer: ArrayBuffer): Promise<IMidiFile> => {
        return new Promise((resolve, reject) => {
            const id = addUniqueNumber(ongoingRecordingRequests);

            const onMessage = ({ data }: IWorkerEvent) => {
                if (data.id === id) {
                    ongoingRecordingRequests.delete(id);

                    worker.removeEventListener('message', onMessage);

                    if (data.error === null) {
                        resolve((<IParseResponse> data).result.midiFile);
                    } else {
                        reject(new Error(data.error.message));
                    }
                }
            };

            worker.addEventListener('message', onMessage);

            worker.postMessage(<IParseRequest> { id, method: 'parse', params: { arrayBuffer } }, [ arrayBuffer ]);
        });
    };

    return {
        parseArrayBuffer
    };
};
