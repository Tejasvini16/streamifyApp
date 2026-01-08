import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// CSS for stream chat
import "stream-chat-react/dist/css/v2/index.css";
//also make some changes to index.css for chat page to look good

import './index.css'

import App from './App.jsx'

import {BrowserRouter} from "react-router";

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
const queryClient=new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* Now You can add any react-router component in App */}
      <QueryClientProvider client={queryClient}>
          {/* By wrapping your application with QueryClientProvider, you ensure that all child
              components have access to the QueryClient and can leverage features like automatic
              caching, background updates, and request deduplication. */}
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
