import { IMidiJsonParserResponseEventData } from 'midi-json-parser-worker';

export interface IMidiJsonParserResponseEvent extends Event {

    data: IMidiJsonParserResponseEventData;

}
