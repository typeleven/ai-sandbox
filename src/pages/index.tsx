import { useEffect, useRef, useState } from 'react'
import { PulseLoader } from 'react-spinners'
import { fetchEventSource } from '@microsoft/fetch-event-source';

function classNames(...classes) { return classes.filter(Boolean).join(' '); }




const MessagesSection = ({ children }) => { return (<div id="messages" className="flex flex-1 flex-col-reverse p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">{children}</div>) }

const Message = ({ children, type, image = null }) => {
  const isTo = type !== 'apiMessage'
  return (
    <div className="chat-message">
      <div className={classNames("flex items-end ", isTo && "justify-end")}>
        <div className={classNames("flex flex-col my-2 space-y-2 text-md max-w-lg mx-2 items-start", isTo ? "order-1" : "order-2")}>
          <div>
            <span className={classNames("px-4 py-2 rounded-lg inline-block", isTo ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-300 text-gray-600 rounded-bl-none")}>
              <pre className='whitespace-pre-line'>
                {children}
              </pre>
            </span>
          </div>
        </div>
        {image && <img src={image} alt="" className="w-12 h-12 rounded-full order-1" />}
      </div>
    </div>
  )
}

const InputSection = ({ setMessageState, setIsLoading, setConversation }
) => {
  const inputElement = useRef(null);
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (inputElement.current) {
      inputElement.current.focus();
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setConversation((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));


    setIsLoading(true);
    setQuery('');

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
        // Handle Message Event START
        onmessage: (event) => {
          console.log('data', event.data)
          if (event.data === '[END STREAM]') {
            setConversation((state) => ({
              history: [...state.history, [question]],
              messages: [
                ...state.messages,
                {
                  type: 'apiMessage',
                  message: state.pending ?? '',
                },
              ],
            }));
            setIsLoading(false);
            ctrl.abort();
          } else {
            const data = event.data;
            setConversation((state) => ({
              ...state,
              pending: (state.pending ?? '') + data,
            }));
          }
        },
        // Handle Message Event END
      });
    } catch (error) {
      setIsLoading(false);
      console.log('error', error);
    }
  }

  return (
    <form>
      <div className="pt-4 mb-2 sm:mb-0 pb-10 px-5">
        <div className="relative flex">
          <input
            type="text"
            ref={inputElement}
            onFocus={e => e.currentTarget.select()}
            value={query}
            onChange={evt => setQuery(evt.target.value)}
            placeholder="What can I help you with?"
            className="pl-4 w-full focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600  bg-gray-200 rounded-md py-3 border-gray-300"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg ml-4 px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none"
            onClick={handleSubmit}
          >
            Send
          </button>
        </div>
      </div>
    </form >
  )
}

const Layout = ({ children }) => {
  return (<div className="flex-1 p:2 sm:p-6 justify-between flex flex-col h-screen">{children}</div>)
}

const Component = (props) => {
  const [conversation, setConversation] = useState({ messages: [], history: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [messageState, setMessageState] = useState({
    messages: [],
    pending: undefined,
    history: [],
  });


  return (
    <>
      {/* Main Container */}
      <div className="flex mx-auto max-w-8xl sm:px-6 lg:px-0">
        {/* Main Content */}
        <div className="flex w-full sm:px-6 lg:px-8">
          <Layout>
            <MessagesSection>
              <PulseLoader color="#808080" size={7} className="pl-3" loading={isLoading} />
              {conversation && conversation.messages.slice(0).reverse().map((message: any, index) => (
                <Message key={index} type={message.type} image={message.image}> {message.message} </Message>
              ))}

            </MessagesSection>
            <InputSection {...{ setMessageState, messageState, setIsLoading, setConversation }} />
          </Layout >
        </div>
      </div>
    </>
  )

}

export default Component