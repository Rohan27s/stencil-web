import { useContext } from 'react'
import { ThemeContext } from '@samagra-x/stencil-provider'

// export const useTheme = () => {
//     const context = useContext(ThemeContext);
//     if (context === undefined) {
//       throw new Error("useCustomTheme must be used within a CustomThemeProvider");
//     }
//     return context;
// };

export const useBotAppColorPalates = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider')
  }
  return context?.theme?.palette
}
