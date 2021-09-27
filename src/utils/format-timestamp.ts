export function formatTimestamp( startDate: Date, nowDate: Date ):string{
    const miliseconds = nowDate.getTime() - startDate.getTime()
    const seconds = Math.floor(miliseconds/1000)

    const data: any = {seconds, miliseconds: miliseconds % 1000}
    if(seconds >= 60){
        const minutes = Math.floor(seconds/60)
        data.minutes = minutes
        data.seconds = seconds - minutes*60

        if(minutes >= 60){
            const hours = Math.floor(seconds/60*60)
            data.hours = hours
            data.minutes = seconds - hours*60
            data.seconds = seconds - hours*60 - minutes*60
        }
    }
    let result = ''
    data.miliseconds ? result = ` ${data.miliseconds}ms` + result : null
    data.seconds ? result = ` ${data.seconds}s` + result : null
    data.minutes ? result = ` ${data.minutes}m` + result : null
    data.hours   ? result = ` ${data.hours}h` + result : null

    return result.trim()
}