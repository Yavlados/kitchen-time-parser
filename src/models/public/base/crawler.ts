import {format} from 'date-fns'
import config from '../../../config.json'
import { formatTimestamp } from '../../../utils/format-timestamp'

export interface IStamp{
    start: string
    duration: string
}


export abstract class Crawler {
    startDate: Date = null

    constructor(){
        this.startDate = new Date()
    }

    stamp(): IStamp{
        return {
            start : format(this.startDate, config.dateFormat),
            duration: formatTimestamp( this.startDate, new Date() )
        }
    }
}