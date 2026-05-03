/* eslint-disable */
/**
 * 控制台 ASCII Logo（在 src/app.tsx 顶层调用一次即可）
 */
export const printANSI = () => {
  const text = `
  ███████╗██╗   ██╗ █████╗     ██████╗ ██████╗  ██████╗
  ██╔════╝██║   ██║██╔══██╗    ██╔══██╗██╔══██╗██╔═══██╗
  █████╗  ██║   ██║███████║    ██████╔╝██████╔╝██║   ██║
  ██╔══╝  ╚██╗ ██╔╝██╔══██║    ██╔═══╝ ██╔══██╗██║   ██║
  ███████╗ ╚████╔╝ ██║  ██║    ██║     ██║  ██║╚██████╔╝
  ╚══════╝  ╚═══╝  ╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝
\t\t\t\t\tPublished @ pkaq.top
\t\t\t\t\tBuild date: ${new Date().toISOString().slice(0, 10)}`;
  console.log('[Eva Pro]');
  console.log(`%c${text}`, 'color: #1890FF');
  console.log(
    '%c感谢使用 Eva Pro!',
    'color: #000; font-size: 14px; font-family: Hiragino Sans GB,Microsoft YaHei,Droid Sans Fallback,Source Sans,Wenquanyi Micro Hei,WenQuanYi Micro Hei Mono,WenQuanYi Zen Hei,Apple LiGothic Medium,SimHei,ST Heiti,WenQuanYi Zen Hei Sharp,sans-serif;',
  );
  console.log(
    '%cThanks for using Eva Pro!',
    'color: #fff; font-size: 14px; font-weight: 300; text-shadow:#000 1px 0 0,#000 0 1px 0,#000 -1px 0 0,#000 0 -1px 0;',
  );
};
