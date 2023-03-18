import { fetchEventSource } from '@microsoft/fetch-event-source';

export default function Home() {

  async function handleSubmit() {

    const query = 'Is red a color?'
    const question = query.trim();
    const ctrl = new AbortController();
    console.log('question', question)
    try {
      fetchEventSource('/api/ai/emp-hbk-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
        }),
        signal: ctrl.signal,
        onmessage: (event) => {
          console.log(event.data)
          if (event.data === '[END STREAM]') {
            console.log('end stream')
            //   ctrl.abort();
          } else {
            //   const data = JSON.parse(event.data);
          }
        },
      });
    } catch (error) {
      console.log('error', error);
    }
  }




  return (
    <>
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-6"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </>
  )
}
