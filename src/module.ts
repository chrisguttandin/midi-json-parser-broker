import { createBroker } from 'broker-factory';
import { IMidiFile, TMidiJsonParserWorkerDefinition } from 'midi-json-parser-worker';
import { IMidiJsonParserBrokerDefinition } from './interfaces';
import { TMidiJsonParserBrokerLoader, TMidiJsonParserBrokerWrapper } from './types';

export * from './interfaces';
export * from './types';

export const wrap: TMidiJsonParserBrokerWrapper = createBroker<IMidiJsonParserBrokerDefinition, TMidiJsonParserWorkerDefinition>({
    parseArrayBuffer: ({ call }) => {
        return async (arrayBuffer: ArrayBuffer): Promise<IMidiFile> => {
            return call('parse', { arrayBuffer }, [ arrayBuffer ]);
        };
    }
});

export const load: TMidiJsonParserBrokerLoader = (url: string) => {
    const worker = new Worker(url);

    return wrap(worker);
};
