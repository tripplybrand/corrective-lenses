import tw, { css } from 'twin.macro'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import { createMachine, assign } from 'xstate'
import { useMachine } from '@xstate/react'

//Increase multiplier make more scroll length between the reveal of each line
const scrollMultiplier = 5

export default function Home() {
  const currentLineNumber = useCurrentLineNumber()

  return (
    <>
      <Head>
        <title>Corrective Lenses</title>
        <meta charSet="utf-8"></meta>
        <meta name="description" content="A poem by Julie Sumner"></meta>
        <meta
          property="og:title"
          content="Corrective Lenses"
          key="ogtitle"
        ></meta>
        <meta
          property="og:description"
          content="A poem by Julie Sumner"
          key="ogdesc"
        />
        <meta
          property="og:image"
          content="https://corrective-lenses.vercel.app/Correct_Lenses_Meta.jpg"
          key="ogimage"
        ></meta>
        <meta name="twitter:card" content="summary_large_image"></meta>
      </Head>
      <div tw="flex justify-center my-0 mx-auto min-h-screen sticky top-0">
        <div tw="py-10 whitespace-nowrap">
          <h1
            css={[
              tw`pb-4 font-body font-bold text-2xl xs:text-3xl sm:text-4xl md:text-4xl lg:text-5xl`,
              css`
                animation: from-on-to-past 3s forwards ease-out;
                color: #a3edfd;
              `,
            ]}
          >
            Corrective Lenses
          </h1>
          {stanzas.map((lines, stanzaIdx) => {
            const previousStanzas = stanzas.slice(0, stanzaIdx)
            const stanzaStartLine = previousStanzas.reduce(
              (totalLines, linesInStanza) => totalLines + linesInStanza.length,
              0
            )
            return (
              <Paragraph key={stanzaIdx}>
                {lines.map((line, lineIdx) => {
                  const lineNumber = stanzaStartLine + lineIdx
                  // events: 'SCROLL_ON' | 'SCROLL_PAST' | 'SCROLL_BEFORE'
                  const animationEvent =
                    currentLineNumber === lineNumber
                      ? 'SCROLL_ON'
                      : currentLineNumber > lineNumber
                      ? 'SCROLL_PAST'
                      : currentLineNumber < lineNumber
                      ? 'SCROLL_BEFORE'
                      : null

                  if (animationEvent === null) {
                    throw new Error("animationEvent can't be null")
                  }

                  return (
                    <Line
                      key={line}
                      animationEvent={animationEvent}
                      lastLine={lineNumber === lastLineNumber}
                    >
                      {line}
                    </Line>
                  )
                })}
                {/* add the attribution to the end of the last stanza */}
                {stanzaIdx === stanzas.length - 1 ? (
                  <Attribution
                    // events: 'SCROLL_ON' | 'SCROLL_BEFORE'
                    animationEvent={
                      currentLineNumber === lastLineNumber
                        ? 'SCROLL_ON'
                        : 'SCROLL_BEFORE'
                    }
                  >
                    ??? Julie Sumner
                  </Attribution>
                ) : null}
              </Paragraph>
            )
          })}
        </div>
      </div>
      <div
        css={[
          tw`invisible w-screen min-h-screen bg-gray-300`,
          css`
            height: ${100 * scrollMultiplier}vh;
          `,
        ]}
      ></div>
    </>
  )
}

// Components

function Paragraph({ children }: { children: React.ReactNode }) {
  return <p tw="pb-4">{children}</p>
}

type AnimationEvent = 'SCROLL_ON' | 'SCROLL_PAST' | 'SCROLL_BEFORE'

// 'SCROLL_ON' | 'SCROLL_PAST' | 'SCROLL_BEFORE'
function Line({
  children,
  animationEvent,
  lastLine,
}: {
  children: React.ReactNode
  animationEvent: AnimationEvent
  lastLine: boolean
}) {
  const [state, send] = useMachine(
    animationMachine,
    lastLine
      ? {
          actions: {
            fromBeforeToOn: assign({
              animation:
                'from-before-to-on 1s forwards ease-out, from-on-to-past 1s 1.5s forwards ease-out',
            }),
          },
        }
      : {}
  )

  useEffect(() => {
    send(animationEvent)
  }, [send, animationEvent])

  return (
    <span
      css={[
        tw`block opacity-0 font-body font-medium xs:font-normal text-xs xs:text-lg sm:text-xl md:text-xl lg:text-2xl`,
        css`
          animation: ${state.context.animation};
          color: #a3edfd;
        `,
      ]}
    >
      {children}
    </span>
  )
}

// 'SCROLL_ON' | 'SCROLL_BEFORE'
function Attribution({
  children,
  animationEvent,
}: {
  children: React.ReactNode
  animationEvent: Exclude<AnimationEvent, 'SCROLL_PAST'>
}) {
  const [state, send] = useMachine(animationMachine, {
    actions: {
      fromBeforeToOn: assign({
        animation: `attribution-in 1s 0.75s forwards ease-out`,
      }),
      fromOnToBefore: assign({
        animation: `attribution-out 1s forwards ease-out`,
      }),
    },
  })

  useEffect(() => {
    send(animationEvent)
  }, [send, animationEvent])

  return (
    <span
      css={[
        tw`block pt-2 opacity-0 font-body font-normal text-right text-xs xs:text-sm sm:text-base md:text-base lg:text-lg`,
        css`
          animation: ${state.context.animation};
          color: #a3edfd;
        `,
      ]}
    >
      {children}
    </span>
  )
}

// Data

const stanzas = [
  [
    'Each morning before I put them on, the world',
    'is a blur???a car crash waiting to happen',
    'or a Monet painting depending upon',
    'a certain point of view.',
  ],
  [
    'What becomes pre-eminent is shadow',
    'and shape and light and space',
    'between the beginning of one thing',
    'or the ending of another',
  ],
  [
    'and things in aggregate become clearer',
    'than the thing that???s singular, my mind',
    'able to better consider the whole green',
    'arch of the forested brow of land',
  ],
  [
    'a quarter mile to the west, set free',
    'from focus diverted by limbs and leaves,',
    'and always I feel my shortcoming sharpened,',
    'unable to see both ways at the same time.',
  ],
]

const lastLineNumber = stanzas.flat().length - 1

// Calculate the thresholds
const totalNumLines = stanzas.flat().length
const inc = 1 / (totalNumLines + 1)
const lineIdxArray = Array.from(Array(totalNumLines).keys())
const thresholds = lineIdxArray.map((id) => inc * (id + 1))

// Hooks/logic

function useCurrentLineNumber() {
  const [currentLineNumber, setCurrentLineNumber] = useState(-1)

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const { scrollY, innerHeight } = window

      const currentRatio = scrollY / (innerHeight * scrollMultiplier)
      const thresholdIdx = thresholds.findIndex(
        (threshold) => currentRatio <= threshold
      )
      const currentLineNumber =
        thresholdIdx === -1 ? lastLineNumber : thresholdIdx - 1
      setCurrentLineNumber(currentLineNumber)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return currentLineNumber
}

const animationMachine = createMachine(
  {
    context: {
      animation: '',
    },
    initial: 'beforeLine',
    states: {
      beforeLine: {
        on: {
          SCROLL_ON: {
            target: 'onLine',
            actions: 'fromBeforeToOn',
          },
          SCROLL_BEFORE: {},
        },
      },
      onLine: {
        on: {},
      },
      pastLine: {
        on: {
          SCROLL_ON: {
            target: 'onLine',
            actions: 'fromPastToOn',
          },
          SCROLL_PAST: {},
        },
      },
    },
    on: {
      SCROLL_PAST: {
        target: 'pastLine',
        actions: 'fromOnToPast',
      },
      SCROLL_BEFORE: {
        target: 'beforeLine',
        actions: 'fromOnToBefore',
      },
    },
  },
  {
    actions: {
      fromBeforeToOn: assign({
        animation: 'from-before-to-on 1s forwards ease-out',
      }),
      fromOnToPast: assign({
        animation: 'from-on-to-past 1s forwards ease-out',
      }),
      fromOnToBefore: assign({
        animation: 'from-on-to-before 1s forwards ease-out',
      }),
      fromPastToOn: assign({
        animation: 'from-past-to-on 1s forwards ease-out',
      }),
    },
  }
)
