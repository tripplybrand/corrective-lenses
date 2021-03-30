import type { AppProps } from 'next/app'
import '../styles/globals.css'
import '../styles/scrollAnimations.css'
import Image from 'next/image'
import tw, { css, GlobalStyles } from 'twin.macro'

type ComponentWithPageLayout = {
  Component: AppProps['Component'] & {
    PageLayout?: React.ComponentType
  }
}

function App({ Component, pageProps }: AppProps & ComponentWithPageLayout) {
  return (
    <>
      <div tw="fixed overflow-hidden w-screen h-screen">
        <Image
          src="/Madeira_Blur.JPG"
          alt="View of mountain range on Madeira."
          layout="fill"
          objectFit="cover"
          quality={100}
          loading="eager"
          priority={false}
        />
      </div>
      {/*Transparent pane between image and text*/}
      <div
        css={[
          css`
            background-color: hsla(260deg, 24%, 58%, 0.5);
          `,
          tw`fixed overflow-hidden h-screen w-screen`,
        ]}
      ></div>
      <GlobalStyles />
      {
        // get a page root if one was set
        Component.PageLayout ? (
          <Component.PageLayout>
            <Component {...pageProps} />
          </Component.PageLayout>
        ) : (
          <Component {...pageProps} />
        )
      }
    </>
  )
}

export default App
