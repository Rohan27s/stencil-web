import {
  Bubble,
  Image as Img,
  ScrollView,
  List,
  ListItem,
  FileCard,
  Typing,
} from '@samagra-x/chatui'
import {
  FC,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import styles from './index.module.css'
import RightIcon from './assets/right'
import SpeakerIcon from './assets/speaker.svg'
import SpeakerPauseIcon from './assets/speakerPause.svg'
import MsgThumbsUp from './assets/msg-thumbs-up'
import MsgThumbsDown from './assets/msg-thumbs-down'
import { MessageItemPropType } from './index.d'
import { JsonToTable } from '../json-to-table'
import moment from 'moment'
import { useColorPalates } from '../../providers/theme-provider/hooks'
import { useConfig } from '../../hooks/useConfig'
import { useLocalization } from '../../hooks'
import { AppContext } from '../../context'
import axios from 'axios'
import saveTelemetryEvent from '../../utils/telemetry'
import BlinkingSpinner from '../blinking-spinner/index'
import Loader from '../loader'

const MessageItem: FC<MessageItemPropType> = ({ message }) => {
  const config = useConfig('component', 'chatUI')
  const context = useContext(AppContext)
  const [reaction, setReaction] = useState(
    message?.content?.data?.reaction?.type
  )
  const [optionDisabled, setOptionDisabled] = useState(
    message?.content?.data?.optionClicked || false
  )
  const [audioFetched, setAudioFetched] = useState(false)
  const [ttsLoader, setTtsLoader] = useState(false)
  const t = useLocalization()
  const theme = useColorPalates()
  const secondaryColor = useMemo(() => {
    return theme?.primary?.light
  }, [theme?.primary?.light])

  const contrastText = useMemo(() => {
    return theme?.primary?.contrastText
  }, [theme?.primary?.contrastText])

  // const getToastMessage = (t: any, reaction: number): string => {
  //   if (reaction === 1) return t('toast.reaction_like');
  //   return t('toast.reaction_reset');
  // };

  useEffect(() => {
    setReaction(message?.content?.data?.reaction)
  }, [message?.content?.data?.reaction])

  const onLikeDislike = useCallback(
    ({ value, msgId }: { value: 0 | 1 | -1; msgId: string }) => {
      if (value === 1) {
        context?.newSocket.sendMessage({
          payload: {
            from: localStorage.getItem('phoneNumber'),
            appId: 'AKAI_App_Id',
            channel: 'AKAI',
            userId: localStorage.getItem('userID'),
            messageType: 'FEEDBACK_POSITIVE',
            replyId: msgId,
            conversationId: sessionStorage.getItem('conversationId'),
            botId: process.env.NEXT_PUBLIC_BOT_ID || '',
          },
        })
      } else if (value === -1) {
        context?.setCurrentQuery(msgId)
        context?.setShowDialerPopup(true)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  )

  const feedbackHandler = useCallback(
    ({ like, msgId }: { like: 0 | 1 | -1; msgId: string }) => {
      console.log('vbnm:', { reaction, like })
      // Don't let user change reaction once given
      if (reaction !== 0) return toast.error('Cannot give feedback again')
      if (reaction === 0) {
        setReaction(like)
        return onLikeDislike({ value: like, msgId })
      }
      if (reaction === 1 && like === -1) {
        console.log('vbnm triggered 1')
        setReaction(-1)
        return onLikeDislike({ value: -1, msgId })
      }
      if (reaction === -1 && like === 1) {
        console.log('vbnm triggered 2')
        setReaction(1)
        return onLikeDislike({ value: 1, msgId })
      }
    },
    [onLikeDislike, reaction]
  )

  const getLists = useCallback(
    ({ choices }: { choices: any }) => {
      console.log('qwer12:', { choices, optionDisabled })
      return (
        <List className={`${styles.list}`}>
          {choices?.map((choice: any, index: string) => (
            // {_.map(choices ?? [], (choice, index) => (
            <ListItem
              key={`${index}_${choice?.key}`}
              className={`${styles.onHover} ${styles.listItem}`}
              //@ts-ignore
              style={
                optionDisabled
                  ? {
                      background: 'var(--lightgrey)',
                      color: 'var(--font)',
                      boxShadow: 'none',
                    }
                  : { cursor: 'pointer' }
              }
              onClick={(e: any): void => {
                e.preventDefault()
                if (optionDisabled) {
                  toast.error(`${t('message.cannot_answer_again')}`)
                } else {
                  context?.sendMessage(choice?.key)
                  setOptionDisabled(true)
                }
              }}
            >
              <div
                className="onHover"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color:
                    content?.data?.position === 'right'
                      ? 'white'
                      : optionDisabled
                      ? 'var(--font)'
                      : secondaryColor,
                }}
              >
                <div>{choice?.text}</div>
                <div style={{ marginLeft: 'auto' }}>
                  <RightIcon
                    width="30px"
                    color={optionDisabled ? 'var(--font)' : secondaryColor}
                  />
                </div>
              </div>
            </ListItem>
          ))}
        </List>
      )
    },
    [context, t]
  )

  const { content, type } = message

  console.log('here', content)

  const handleAudio = useCallback(
    (url: any) => {
      // console.log(url)
      if (!url) {
        if (audioFetched) toast.error('No audio')
        return
      }
      context?.playAudio(url, content)
      setTtsLoader(false)
      saveTelemetryEvent('0.1', 'E015', 'userQuery', 'timesAudioUsed', {
        botId: process.env.NEXT_PUBLIC_BOT_ID || '',
        orgId: process.env.NEXT_PUBLIC_ORG_ID || '',
        userId: localStorage.getItem('userID') || '',
        phoneNumber: localStorage.getItem('phoneNumber') || '',
        conversationId: sessionStorage.getItem('conversationId') || '',
        messageId: content?.data?.messageId,
        text: content?.text,
        timesAudioUsed: 1,
      })
    },
    [audioFetched, content, context?.playAudio]
  )

  const downloadAudio = useCallback(() => {
    const fetchAudio = async (text: string) => {
      const startTime = Date.now()
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_AI_TOOLS_API}/text-to-speech`,
          {
            text: text,
            language: context?.locale,
            messageId: content?.data?.messageId,
            conversationId: sessionStorage.getItem('conversationId') || '',
          },
          {
            headers: {
              botId: process.env.NEXT_PUBLIC_BOT_ID || '',
              orgId: process.env.NEXT_PUBLIC_ORG_ID || '',
              userId: localStorage.getItem('userID') || '',
            },
          }
        )
        setAudioFetched(true)
        const endTime = Date.now()
        const latency = endTime - startTime
        await saveTelemetryEvent(
          '0.1',
          'E045',
          'aiToolProxyToolLatency',
          't2sLatency',
          {
            botId: process.env.NEXT_PUBLIC_BOT_ID || '',
            orgId: process.env.NEXT_PUBLIC_ORG_ID || '',
            userId: localStorage.getItem('userID') || '',
            phoneNumber: localStorage.getItem('phoneNumber') || '',
            conversationId: sessionStorage.getItem('conversationId') || '',
            text: text,
            messageId: content?.data?.messageId,
            timeTaken: latency,
            createdAt: Math.floor(startTime / 1000),
            audioUrl: response?.data?.url || 'No audio URL',
          }
        )
        // cacheAudio(response.data);
        return response?.data?.url
      } catch (error: any) {
        console.error('Error fetching audio:', error)
        setAudioFetched(true)
        const endTime = Date.now()
        const latency = endTime - startTime
        await saveTelemetryEvent(
          '0.1',
          'E045',
          'aiToolProxyToolLatency',
          't2sLatency',
          {
            botId: process.env.NEXT_PUBLIC_BOT_ID || '',
            orgId: process.env.NEXT_PUBLIC_ORG_ID || '',
            userId: localStorage.getItem('userID') || '',
            phoneNumber: localStorage.getItem('phoneNumber') || '',
            conversationId: sessionStorage.getItem('conversationId') || '',
            text: text,
            msgId: content?.data?.messageId,
            timeTaken: latency,
            createdAt: Math.floor(startTime / 1000),
            error: error?.message || 'Error fetching audio',
          }
        )
        return null
      }
    }

    const fetchData = async () => {
      if (
        !content?.data?.audio_url &&
        content?.data?.position === 'left' &&
        content?.text
      ) {
        const toastId = toast.loading(`${t('message.download_audio')}`)
        setTimeout(() => {
          toast.dismiss(toastId)
        }, 1500)
        const audioUrl = await fetchAudio(content?.text)

        setTtsLoader(false)
        if (audioUrl) {
          content.data.audio_url = audioUrl
          handleAudio(audioUrl)
        } else setTtsLoader(false)
      }
    }

    if (content?.data?.audio_url) {
      handleAudio(content.data.audio_url)
    } else {
      setTtsLoader(true)
      fetchData()
    }
  }, [handleAudio, content?.data, content?.text, t])

  const getFormattedDate = (datestr: string) => {
    const today = new Date(datestr)
    const yyyy = today.getFullYear()
    let mm: any = today.getMonth() + 1 // Months start at 0!
    let dd: any = today.getDate()

    if (dd < 10) dd = '0' + dd
    if (mm < 10) mm = '0' + mm

    return dd + '/' + mm + '/' + yyyy
  }
  switch (type) {
    case 'loader':
      return <Typing />
    case 'text':
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            maxWidth: '90vw',
          }}
        >
          <div
            className={
              content?.data?.position === 'right'
                ? styles.messageTriangleRight
                : styles.messageTriangleLeft
            }
            style={
              content?.data?.position === 'right'
                ? {
                    borderColor: `${secondaryColor} transparent transparent transparent`,
                  }
                : {
                    borderColor: `${contrastText} transparent transparent transparent`,
                  }
            }
          ></div>
          <Bubble
            type="text"
            style={
              content?.data?.position === 'right'
                ? {
                    background: secondaryColor,
                    boxShadow: '0 3px 8px rgba(0,0,0,.24)',
                  }
                : {
                    background: contrastText,
                    boxShadow: '0 3px 8px rgba(0,0,0,.24)',
                  }
            }
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: '1rem',
                color:
                  content?.data?.position === 'right'
                    ? contrastText
                    : secondaryColor,
              }}
            >
              {content?.text}{' '}
              {/* {
                content?.data?.position === 'right'
                  ? null
                  : !content?.data?.isEnd
                && <BlinkingSpinner />
              } */}
              {process.env.NEXT_PUBLIC_DEBUG === 'true' && (
                <div
                  style={{
                    color:
                      content?.data?.position === 'right' ? 'yellow' : 'black',
                    fontSize: '12px',
                    fontWeight: 'normal',
                  }}
                >
                  <br></br>
                  <span>messageId: {content?.data?.messageId}</span>
                  <br></br>
                  <span>conversationId: {content?.data?.conversationId}</span>
                </div>
              )}
            </span>
            {getLists({
              choices:
                content?.data?.payload?.buttonChoices ?? content?.data?.choices,
            })}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <span
                style={{
                  color:
                    content?.data?.position === 'right'
                      ? contrastText
                      : secondaryColor,
                  fontSize: '10px',
                }}
              >
                {moment(content?.data?.timestamp).format('hh:mm A DD/MM/YYYY')}
              </span>
            </div>
          </Bubble>
          {content?.data?.btns ? (
            <div className={styles.offlineBtns}>
              <button
                onClick={() => window?.location?.reload()}
                style={{
                  border: `2px solid ${secondaryColor}`,
                }}
              >
                Refresh
              </button>
            </div>
          ) : (
            content?.data?.position === 'left' && (
              <div
                style={{
                  display: 'flex',
                  position: 'relative',
                  top: '-10px',
                  justifyContent: 'space-between',
                }}
              >
                {config?.allowTextToSpeech && (
                  <div style={{ display: 'flex' }}>
                    <div
                      style={{
                        border: `1px solid ${theme?.primary?.main}`,
                      }}
                      className={styles.msgSpeaker}
                      onClick={downloadAudio}
                      // style={
                      //   !content?.data?.isEnd
                      //     ? {
                      //         pointerEvents: 'none',
                      //         filter: 'grayscale(100%)',
                      //         opacity: '0.5',
                      //         border: `1px solid ${secondaryColor}`,
                      //       }
                      //     :
                      //   {
                      //     pointerEvents: 'auto',
                      //     opacity: '1',
                      //     filter: 'grayscale(0%)',
                      //     border: `1px solid ${secondaryColor}`,
                      //   }
                      // }
                    >
                      {context?.clickedAudioUrl === content?.data?.audio_url ? (
                        <Image
                          src={
                            !context?.audioPlaying
                              ? SpeakerIcon
                              : SpeakerPauseIcon
                          }
                          width={!context?.audioPlaying ? 15 : 40}
                          height={!context?.audioPlaying ? 15 : 40}
                          alt=""
                        />
                      ) : ttsLoader ? (
                        <Loader />
                      ) : (
                        <Image
                          src={SpeakerIcon}
                          width={15}
                          height={15}
                          alt=""
                        />
                      )}

                      <p
                        style={{
                          fontSize: '11px',
                          // color: contrastText,
                          fontFamily: 'Mulish-bold',
                          display: 'flex',
                          alignItems: 'flex-end',
                          marginRight: '1px',
                          padding: '0 5px',
                        }}
                      >
                        {t('message.speaker')}
                      </p>
                    </div>
                  </div>
                )}
                {config?.allowFeedback && (
                  <div className={styles.msgFeedback}>
                    <div
                      className={styles.msgFeedbackIcons}
                      style={{
                        border: `1px solid ${theme?.primary?.main}`,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexDirection: 'column',
                          paddingRight: '6px',
                        }}
                        onClick={() =>
                          feedbackHandler({
                            like: 1,
                            msgId: content?.data?.messageId,
                          })
                        }
                      >
                        <MsgThumbsUp fill={reaction === 1} width="20px" />
                        <p
                          style={{
                            fontSize: '11px',
                            fontFamily: 'Mulish-bold',
                          }}
                        >
                          {t('label.helpful')}
                        </p>
                      </div>
                      <div
                        style={{
                          height: '32px',
                          width: '1px',
                          backgroundColor: theme?.primary?.main,
                          margin: '6px 0',
                        }}
                      ></div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexDirection: 'column',
                        }}
                        onClick={() =>
                          feedbackHandler({
                            like: -1,
                            msgId: content?.data?.messageId,
                          })
                        }
                      >
                        <MsgThumbsDown fill={reaction === -1} width="20px" />
                        <p
                          style={{
                            fontSize: '11px',
                            fontFamily: 'Mulish-bold',
                          }}
                        >
                          {t('label.not_helpful')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )

    case 'image': {
      const url = content?.data?.payload?.media?.url || content?.data?.imageUrl
      return (
        <>
          {content?.data?.position === 'left' && (
            <div
              style={{
                width: '40px',
                marginRight: '4px',
                textAlign: 'center',
              }}
            ></div>
          )}
          <Bubble type="image">
            <div style={{ padding: '7px' }}>
              <Img src={url} width="299" height="200" alt="image" lazy fluid />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'self-end',
                }}
              >
                <span
                  style={{
                    color: contrastText,
                    fontSize: '10px',
                  }}
                >
                  {moment(content?.data?.timestamp).format(
                    'hh:mm A DD/MM/YYYY'
                  )}
                </span>
              </div>
            </div>
          </Bubble>
        </>
      )
    }

    case 'file': {
      const url = content?.data?.payload?.media?.url || content?.data?.fileUrl
      return (
        <>
          {content?.data?.position === 'left' && (
            <div
              style={{
                width: '40px',
                marginRight: '4px',
                textAlign: 'center',
              }}
            ></div>
          )}
          <Bubble type="image">
            <div style={{ padding: '7px' }}>
              <FileCard file={url} extension="pdf" />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'self-end',
                }}
              >
                <span
                  style={{
                    color: contrastText,
                    fontSize: '10px',
                  }}
                >
                  {moment(content?.data?.timestamp).format(
                    'hh:mm A DD/MM/YYYY'
                  )}
                </span>
              </div>
            </div>
          </Bubble>
        </>
      )
    }

    case 'video': {
      const url = content?.data?.payload?.media?.url || content?.data?.videoUrl
      const videoId = url.split('=')[1]
      return (
        <>
          <Bubble type="image">
            <div style={{ padding: '7px' }}>
              <iframe
                width="100%"
                height="fit-content"
                src={`https://www.youtube.com/embed/` + videoId}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'self-end',
                }}
              >
                <span
                  style={{
                    color: contrastText,
                    fontSize: '10px',
                  }}
                >
                  {moment(content?.data?.timestamp).format(
                    'hh:mm A DD/MM/YYYY'
                  )}
                </span>
              </div>
            </div>
          </Bubble>
        </>
      )
    }
    case 'options': {
      return (
        <>
          <Bubble type="text" className={styles.textBubble}>
            <div style={{ display: 'flex' }}>
              <span className={styles.optionsText}>
                {content?.data?.payload?.text}
                {process.env.NEXT_PUBLIC_DEBUG === 'true' && (
                  <div
                    style={{
                      color: 'black',
                      fontSize: '12px',
                      fontWeight: 'normal',
                    }}
                  >
                    <br></br>
                    <span>messageId: {content?.data?.messageId}</span>
                    <br></br>
                    <span>conversationId: {content?.data?.conversationId}</span>
                  </div>
                )}
              </span>
            </div>
            {getLists({
              choices:
                content?.data?.payload?.buttonChoices ?? content?.data?.choices,
            })}
          </Bubble>
        </>
      )
    }

    case 'table': {
      console.log({ table: content })
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            maxWidth: '90vw',
          }}
        >
          <div
            className={
              content?.data?.position === 'right'
                ? styles.messageTriangleRight
                : styles.messageTriangleLeft
            }
            style={
              content?.data?.position === 'right'
                ? {
                    borderColor: `${secondaryColor} transparent transparent transparent`,
                  }
                : {
                    borderColor: `${contrastText} transparent transparent transparent`,
                  }
            }
          ></div>
          <Bubble
            type="text"
            style={
              content?.data?.position === 'right'
                ? {
                    background: secondaryColor,
                    boxShadow: '0 3px 8px rgba(0,0,0,.24)',
                  }
                : {
                    background: contrastText,
                    boxShadow: '0 3px 8px rgba(0,0,0,.24)',
                  }
            }
          >
            <div
              className={styles.tableContainer}
              style={{ overflowX: 'scroll' }}
            >
              {<JsonToTable json={JSON.parse(content?.text)?.table} />}
              <style>
                {`
          div::-webkit-scrollbar-thumb {
            background-color: #d4aa70;
            border-radius: 10px;
          }
        `}
              </style>
            </div>
            <span
              style={{
                fontWeight: 600,
                fontSize: '1rem',
                color:
                  content?.data?.position === 'right' ? contrastText : 'black',
              }}
            >
              {`\n` + JSON.parse(content?.text)?.generalAdvice ||
                '' + `\n\n` + JSON.parse(content?.text)?.buttonDescription ||
                ''}
              {getLists({
                choices: JSON.parse(content?.text)?.buttons,
              })}
              {process.env.NEXT_PUBLIC_DEBUG === 'true' && (
                <div
                  style={{
                    color: 'black',
                    fontSize: '12px',
                    fontWeight: 'normal',
                  }}
                >
                  <br></br>
                  <span>messageId: {content?.data?.messageId}</span>
                  <br></br>
                  <span>conversationId: {content?.data?.conversationId}</span>
                </div>
              )}
            </span>
          </Bubble>
        </div>
      )
    }
    default:
      return (
        <ScrollView
          data={[]}
          // @ts-ignore
          renderItem={(item): ReactElement => <Button label={item.text} />}
        />
      )
  }
}

export default MessageItem
