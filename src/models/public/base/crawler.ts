import {format} from 'date-fns'
import config from '../../../config.json'
import { formatTimestamp } from '../../../utils/format-timestamp'

export interface IStamp{
    start: string
    duration: string,
    action: string
}

export const StampActionsEnum = {
    fetch: 'Fetching data',
    parse: 'Parsing of data',
    error:  'Error has been occured'
}


export abstract class Crawler {
    startDate: Date = null

    constructor(){
        this.startDate = new Date()
    }

    stamp(action: string): IStamp{
        return {
            start : format(this.startDate, config.dateFormat),
            duration: formatTimestamp( this.startDate, new Date() ),
            action,
        }
    }
}