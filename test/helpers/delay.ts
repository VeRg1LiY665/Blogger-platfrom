export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/*export function delay(timeDelay: number) {
    let start_time = Date.now();
    console.log(start_time);
    while (Date.now() - start_time < timeDelay);
}*/
