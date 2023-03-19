import { type AppType } from "next/app";
import { api } from "@/utils/api";
import "@/styles/globals.css";

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'



const MyApp: AppType = ({ Component, pageProps }: any) => {

  const [supabaseClient] = useState(() => createBrowserSupabaseClient())

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>)
};

export default api.withTRPC(MyApp);
