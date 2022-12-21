export const call_schedule_api = async (data: any) => {
    const urlApi = 'http://example.com/movies.json'
    const response = await fetch(urlApi, {
        method: 'POST',
        body: data, // string or object
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const myJson = await response.json(); //extract JSON from the http response
}