'use client'
import React, { ReactNode, useCallback, useEffect, useState } from 'react'
import {
  ThemeProvider as MuiThemeProvider,
  Theme,
  createTheme,
} from '@mui/material/styles'

import { ThemeContext } from './theme-context'
import { initialTheme } from './theme'
import { Color } from '../types/colorType'

interface CustomThemeProviderProps {
  children: ReactNode
}

const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({
  children,
}) => {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme))
  }, [theme])

  const modifyTheme = (changes: Partial<Theme>) => {
    setTheme((prevTheme) => createTheme({ ...prevTheme, ...changes }))
  }

  const modifyPaletes = useCallback((palette: Color) => {
    setTheme((prevTheme) =>
      createTheme({
        ...prevTheme,
        palette: { ...prevTheme.palette, primary: { ...palette } },
      })
    )
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, modifyTheme, modifyPaletes }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  )
}

export default CustomThemeProvider
