/**
 * loading 占位
 * 解决首次加载时白屏的问题
 */
(() => {
  const _root = document.querySelector('#root');
  if (_root && _root.innerHTML === '') {
    _root.innerHTML = `
      <style>
        html,
        body,
        #root {
          height: 100%;
          margin: 0;
          padding: 0;
        }

        #root {
          background-repeat: no-repeat;
          background-size: 100% auto;
        }

        .loading-title {
          font-size: 1.1rem;
        }

        .loading-sub-title {
          margin-top: 20px;
          font-size: 1rem;
          color: #888;
        }

        .page-loading-warp {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22px 26px 24px;
        }

        .curve-loader {
          width: 78px;
          height: 78px;
          overflow: visible;
        }

        .curve-loader-orbit {
          transform-box: fill-box;
          transform-origin: center;
          animation: curveLoaderSpin 9s linear infinite;
        }

        .curve-loader-track {
          fill: none;
          stroke: rgba(24, 144, 255, 0.16);
          stroke-width: 1.2;
        }

        .curve-loader-trail {
          fill: none;
          stroke: url("#curve-loader-stroke");
          stroke-width: 2.3;
          stroke-linecap: round;
          stroke-dasharray: 42 280;
          opacity: 0.78;
          filter: drop-shadow(0 0 9px rgba(24, 144, 255, 0.42));
          animation: curveLoaderTrail 2.2s ease-in-out infinite;
        }

        .curve-loader-particle {
          fill: #8ec5ff;
          opacity: 0.92;
          filter: drop-shadow(0 0 7px rgba(24, 144, 255, 0.75));
          animation: curveLoaderPulse 2.2s ease-in-out infinite;
        }

        .curve-loader-particle:nth-of-type(2n) {
          fill: #b8dcff;
        }

        .curve-loader-particle:nth-of-type(3n) {
          fill: #5d8cff;
        }

        @keyframes curveLoaderSpin {
          0% {
            transform: rotate(0deg) scale(0.94);
          }

          50% {
            transform: rotate(180deg) scale(1.04);
          }

          100% {
            transform: rotate(360deg) scale(0.94);
          }
        }

        @keyframes curveLoaderTrail {
          0% {
            stroke-dashoffset: 0;
          }

          100% {
            stroke-dashoffset: -322;
          }
        }

        @keyframes curveLoaderPulse {
          0%,
          100% {
            opacity: 0.24;
            transform: scale(0.72);
          }

          45% {
            opacity: 1;
            transform: scale(1);
          }
        }
      </style>

      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        min-height: 362px;
      ">
        <div class="page-loading-warp">
          <svg
            class="curve-loader"
            viewBox="0 0 120 120"
            fill="none"
            role="img"
            aria-label="正在加载资源"
          >
            <defs>
              <radialGradient id="curve-loader-glow" cx="50%" cy="50%" r="52%">
                <stop offset="0%" stop-color="#1890ff" stop-opacity="0.24" />
                <stop offset="62%" stop-color="#1890ff" stop-opacity="0.08" />
                <stop offset="100%" stop-color="#1890ff" stop-opacity="0" />
              </radialGradient>
              <linearGradient id="curve-loader-stroke" x1="18" y1="18" x2="102" y2="102">
                <stop offset="0%" stop-color="#b8dcff" />
                <stop offset="48%" stop-color="#1890ff" />
                <stop offset="100%" stop-color="#5d8cff" />
              </linearGradient>
              <path
                id="curve-loader-path"
                d="M96.00 60.00 L95.88 60.94 L95.51 61.86 L94.90 62.75 L94.05 63.58 L92.98 64.34 L91.68 65.02 L90.18 65.59 L88.49 66.06 L86.62 66.39 L84.59 66.59 L82.42 66.64 L80.12 66.54 L77.73 66.28 L75.26 65.86 L72.73 65.27 L70.16 64.52 L67.59 63.62 L65.02 62.56 L62.48 61.35 L60.00 60.00 L57.59 58.52 L55.28 56.93 L53.07 55.24 L51.00 53.46 L49.07 51.61 L47.30 49.71 L45.70 47.78 L44.27 45.84 L43.04 43.91 L42.00 42.00 L41.16 40.14 L40.51 38.36 L40.07 36.66 L39.81 35.07 L39.75 33.61 L39.88 32.30 L40.17 31.15 L40.63 30.18 L41.25 29.40 L42.00 28.82 L42.88 28.46 L43.86 28.32 L44.93 28.40 L46.07 28.72 L47.27 29.27 L48.50 30.05 L49.75 31.07 L51.00 32.30 L52.23 33.75 L53.41 35.41 L54.54 37.27 L55.60 39.30 L56.57 41.51 L57.44 43.86 L58.20 46.34 L58.84 48.94 L59.34 51.62 L59.71 54.38 L59.93 57.18 L60.00 60.00 L59.93 62.82 L59.71 65.62 L59.34 68.38 L58.84 71.06 L58.20 73.66 L57.44 76.14 L56.57 78.49 L55.60 80.70 L54.54 82.73 L53.41 84.59 L52.23 86.25 L51.00 87.70 L49.75 88.93 L48.50 89.95 L47.27 90.73 L46.07 91.28 L44.93 91.60 L43.86 91.68 L42.88 91.54 L42.00 91.18 L41.25 90.60 L40.63 89.82 L40.17 88.85 L39.88 87.70 L39.75 86.39 L39.81 84.93 L40.07 83.34 L40.51 81.64 L41.16 79.86 L42.00 78.00 L43.04 76.09 L44.27 74.16 L45.70 72.22 L47.30 70.29 L49.07 68.39 L51.00 66.54 L53.07 64.76 L55.28 63.07 L57.59 61.48 L60.00 60.00 L62.48 58.65 L65.02 57.44 L67.59 56.38 L70.16 55.48 L72.73 54.73 L75.26 54.14 L77.73 53.72 L80.12 53.46 L82.42 53.36 L84.59 53.41 L86.62 53.61 L88.49 53.94 L90.18 54.41 L91.68 54.98 L92.98 55.66 L94.05 56.42 L94.90 57.25 L95.51 58.14 L95.88 59.06 L96.00 60.00 Z"
              />
            </defs>
            <circle cx="60" cy="60" r="47" fill="url(#curve-loader-glow)" />
            <g class="curve-loader-orbit">
              <use href="#curve-loader-path" class="curve-loader-track" />
              <use href="#curve-loader-path" class="curve-loader-trail" />
              <circle class="curve-loader-particle" r="3.2">
                <animateMotion dur="2.2s" repeatCount="indefinite" begin="0s" rotate="auto">
                  <mpath href="#curve-loader-path" />
                </animateMotion>
              </circle>
              <circle class="curve-loader-particle" r="3">
                <animateMotion dur="2.2s" repeatCount="indefinite" begin="-0.18s" rotate="auto">
                  <mpath href="#curve-loader-path" />
                </animateMotion>
              </circle>
              <circle class="curve-loader-particle" r="2.4">
                <animateMotion dur="2.2s" repeatCount="indefinite" begin="-0.36s" rotate="auto">
                  <mpath href="#curve-loader-path" />
                </animateMotion>
              </circle>
              <circle class="curve-loader-particle" r="2.2">
                <animateMotion dur="2.2s" repeatCount="indefinite" begin="-0.54s" rotate="auto">
                  <mpath href="#curve-loader-path" />
                </animateMotion>
              </circle>
              <circle class="curve-loader-particle" r="2">
                <animateMotion dur="2.2s" repeatCount="indefinite" begin="-0.72s" rotate="auto">
                  <mpath href="#curve-loader-path" />
                </animateMotion>
              </circle>
              <circle class="curve-loader-particle" r="1.9">
                <animateMotion dur="2.2s" repeatCount="indefinite" begin="-0.9s" rotate="auto">
                  <mpath href="#curve-loader-path" />
                </animateMotion>
              </circle>
            </g>
          </svg>
        </div>
        <div class="loading-title">
          正在加载资源
        </div>
        <div class="loading-sub-title">
          初次加载资源可能需要较多时间 请耐心等待
        </div>
      </div>
    `;
  }
})();
