export function formatTimestamp( startDate: Date, nowDate: Date):string{
    const miliseconds = nowDate.getTime() - startDate.getTime()
    const totalTime = Math.floor(miliseconds/1000)

    const data: any = {seconds: totalTime}
    if(totalTime >= 60){
        const minutes = Math.floor(totalTime/60)
        data.minutes = minutes
        data.seconds = totalTime - minutes*60

        if(minutes >= 60){
            const hours = Math.floor(totalTime/60*60)
            data.hours = hours
            data.minutes = totalTime - hours*60
            data.seconds = totalTime - hours*60 - minutes*60
        }
    }
    let result = ''
    data.seconds ? result = ` ${data.seconds}s` + result : null
    data.minutes ? result = ` ${data.minutes}m` + result : null
    data.hours   ? result = ` ${data.hours}h` + result : null

    return result.trim()
}