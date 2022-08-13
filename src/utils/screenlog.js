/* eslint-disable */
export const printANSI = () => {
  // console.clear()
  console.log('[Eva Pro]')
  // ASCII - ANSI Shadow
  let text = `
  ███████╗██╗   ██╗ █████╗     ██████╗ ██████╗  ██████╗
  ██╔════╝██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔═══██╗
  █████╗  ██║   ██║███████║    ██████╔╝██████╔╝██║   ██║
  ██╔══╝  ╚██╗ ██╔╝██╔══██║    ██╔═══╝ ██╔══██╗██║   ██║
  ███████╗ ╚████╔╝ ██║  ██║    ██║     ██║  ██║╚██████╔╝
  ╚══════╝  ╚═══╝  ╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝
\t\t\t\t\tPublished @ pkaq.top
\t\t\t\t\tBuild date: 2020-06-04`
  console.log(`%c${text}`, 'color: #1890FF')
  console.log('%c感谢使用 Eva Pro!', 'color: #000; font-size: 14px;    font-family: Hiragino Sans GB,Microsoft YaHei,\\\\5FAE\\8F6F\\96C5\\9ED1,Droid Sans Fallback,Source Sans,Wenquanyi Micro Hei,WenQuanYi Micro Hei Mono,WenQuanYi Zen Hei,Apple LiGothic Medium,SimHei,ST Heiti,WenQuanYi Zen Hei Sharp,sans-serif;')
  console.log('%cThanks for using Eva Pro!', 'color: #fff; font-size: 14px; font-weight: 300; text-shadow:#000 1px 0 0,#000 0 1px 0,#000 -1px 0 0,#000 0 -1px 0;')
}

