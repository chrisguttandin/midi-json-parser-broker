export const load = (url: string) => {
    let index = 0;

    const worker = new Worker(url);

    const parseArrayBuffer = (arrayBuffer) => {
        let currentIndex = index;

        index += 1;

        const transferSlice = (byteIndex) => {
            if (byteIndex + 1048576 < arrayBuffer.byteLength) {
                const slice = arrayBuffer.slice(byteIndex, byteIndex + 1048576);

                worker.postMessage({
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

                worker.postMessage({
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
            const onMessage = (event) => {
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
