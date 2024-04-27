import React, { useCallback, useContext, useEffect, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import Typography from '@mui/material/Typography'
import AddCircle from '@mui/icons-material/AddCircle'
import { useRouter } from 'next/router'
import { useConfig } from '../../hooks/useConfig'
import Sidebar from '../../pageComponents/sidebar'
import { recordUserLocation } from '../../utils/location'
import { v4 as uuidv4 } from 'uuid'
import { AppContext } from '@stencil/provider'
import { useLocalization, useLogin } from '../../hooks'
import toast from 'react-hot-toast'
import { useColorPalates } from '../../providers/theme-provider/hooks'

const Navbar: React.FC = () => {
  const router = useRouter()
  const config = useConfig('component', 'navbar')
  const context = useContext(AppContext)
  const [activeLanguage, setActiveLanguage] = useState<string>(() => {
    const storedLang = localStorage.getItem('locale')
    return storedLang || 'en'
  })
  const t = useLocalization()
  const theme = useColorPalates()
  const { isAuthenticated } = useLogin()
  const {
    showHamburgerMenu,
    showHomeIcon,
    showCenterLogo,
    centerLogoSrc,
    showRightLogo1,
    rightLogo1Src,
    showRightLogo2,
    rightLogo2Src,
    showRightLogo3,
    rightLogo3Src,
    centerLogoSize,
    logoTitleColor,
    textColor,
  } = config

  const [isSidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    if (context?.isMsgReceiving) {
      toast.error(`${t('error.wait_new_chat')}`)
      return
    }
    setSidebarOpen(!isSidebarOpen)
  }

  const handleLanguageClick = (langCode: string) => {
    setActiveLanguage(langCode)
    localStorage.setItem('locale', langCode)
  }
  useEffect(() => {
    if (router.pathname == '/login' || router.pathname == '/otp')
      context?.setLocale(activeLanguage)
  }, [activeLanguage, context])

  const newChatHandler = useCallback(() => {
    if (context?.isMsgReceiving) {
      toast.error(`${t('error.wait_new_chat')}`)
      return
    }

    recordUserLocation()

    const newConversationId = uuidv4()
    sessionStorage.setItem('conversationId', newConversationId)
    if (context?.audioElement) context?.audioElement.pause()
    if (context?.setAudioPlaying) context?.setAudioPlaying(false)
    context?.setConversationId(newConversationId)
    context?.setMessages([])
    context?.setIsMsgReceiving(false)
    context?.setLoading(false)
    router.push('/')
  }, [context, t, router])

  console.log({ activeLanguage, config, path: router.pathname })
  return (
    <>
      <AppBar
        position="static"
        sx={{
          background: 'var(--bg-color)',
          boxShadow: 'none',
          borderBottom: '1px solid lightgray',
          height: router.pathname === '/login' ? '110px' : '80px',
        }}
      >
        <Toolbar
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {(router.pathname == '/login' || router.pathname == '/otp') && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  width: '100%',
                }}
              >
                <button
                  className={`Sidemenu_button ${
                    activeLanguage === config?.languageCode1 ? 'active' : ''
                  }`}
                  style={{
                    borderTopLeftRadius: '10px',
                    borderBottomLeftRadius: '10px',
                    borderTopRightRadius: '0',
                    borderBottomRightRadius: '0',
                    backgroundColor:
                      activeLanguage === config?.languageCode1
                        ? theme.primary.main
                        : 'lightgray',
                    border: 'none',
                    width: '60px',
                    height: '30px',
                    padding: '5px',
                  }}
                  onClick={() => handleLanguageClick(config?.languageCode1)}
                >
                  {config?.languageLabel1}
                </button>

                <button
                  className={`Sidemenu_button ${
                    activeLanguage === config?.languageCode2 ? 'active' : ''
                  }`}
                  style={{
                    borderTopLeftRadius: '0',
                    borderBottomLeftRadius: '0',
                    borderTopRightRadius: '10px',
                    borderBottomRightRadius: '10px',
                    backgroundColor:
                      config?.languageCode2 === activeLanguage
                        ? theme.primary.main
                        : 'lightgray',
                    border: 'none',
                    width: '60px',
                    height: '30px',
                    padding: '5px',
                  }}
                  onClick={() => handleLanguageClick(config?.languageCode2)}
                >
                  {config?.languageLabel2}
                </button>
              </div>
            )}
            {isAuthenticated && showHamburgerMenu && (
              <IconButton
                size="large"
                edge="start"
                color="primary"
                aria-label="open drawer"
                sx={{ mr: 2, width: '50px', height: '50px' }}
                onClick={toggleSidebar}
              >
                <MenuIcon sx={{ fontSize: '50px' }} />
              </IconButton>
            )}
            {router.pathname === '/chat' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <IconButton
                  color="primary"
                  size="large"
                  edge="start"
                  aria-label="home"
                  style={{
                    fontSize: '2rem',
                    width: '28px',
                    height: '28px',
                    margin: 0,
                  }} // Adjusted styling
                  onClick={newChatHandler}
                >
                  <AddCircle sx={{ fontSize: '30px' }} />
                </IconButton>
                <Typography
                  variant="body1"
                  color={textColor ?? 'black'}
                  sx={{ fontSize: '15px' }}
                >
                  {t('label.new_chat')}
                </Typography>
              </div>
            )}

            {isAuthenticated &&
              showHomeIcon &&
              router.pathname !== '/' &&
              router.pathname !== '/chat' && (
                <IconButton
                  color="primary"
                  size="large"
                  edge="start"
                  aria-label="home"
                  style={{ fontSize: '2rem', height: '48px' }}
                  onClick={() => router.push('/')}
                >
                  <HomeIcon sx={{ fontSize: '50px' }} />
                </IconButton>
              )}
          </div>

          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
              marginTop: '20px',
            }}
          >
            {showCenterLogo && (
              <div>
                <img
                  src={centerLogoSrc}
                  alt="Center Logo"
                  style={{ maxHeight: centerLogoSize }}
                />
              </div>
            )}

            {router.pathname === '/login' && (
              <div
                style={{
                  fontSize: '10px',
                  color: logoTitleColor ?? (theme?.primary?.dark || 'black'),
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
                dangerouslySetInnerHTML={{ __html: t('label.title') }}
              />
            )}
          </div>

          <div>
            {showRightLogo1 && (
              <img
                src={rightLogo1Src}
                alt={`Right Logo 1`}
                style={{ maxHeight: '60px' }}
              />
            )}
            {showRightLogo2 && (
              <img
                src={rightLogo2Src}
                alt={`Right Logo 2`}
                style={{ maxHeight: '60px' }}
              />
            )}
            {showRightLogo3 && (
              <img
                src={rightLogo3Src}
                alt={`Right Logo 3`}
                style={{ maxHeight: '60px' }}
              />
            )}
          </div>
        </Toolbar>
      </AppBar>

      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
    </>
  )
}

export default Navbar
