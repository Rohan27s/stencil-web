'use client'
import {
  ConfigContext,
  CustomThemeProvider,
  LocaleProviderExampleApp,
} from '@repo/provider'
import './globals.css'
import { Inter } from 'next/font/google'
import { CssBaseline } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Navbar } from '../components/navbar'

import { Provider } from '@repo/provider'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  return (
    <html lang="en">
      <>
        <Provider>
          <ConfigContext>
            <CustomThemeProvider>
              <LocaleProviderExampleApp>
                <CssBaseline>
                  <BrowserRouter>
                    <body className={inter.className}>
                      <Toaster />
                      <Navbar />
                      {children}
                    </body>
                  </BrowserRouter>
                </CssBaseline>
              </LocaleProviderExampleApp>
            </CustomThemeProvider>
          </ConfigContext>
        </Provider>
      </>
    </html>
  )
}
