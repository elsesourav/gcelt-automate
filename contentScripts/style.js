const style = `
   .__fw__ {
      position: fixed;
      top: 6px;
      right: 0;
      width: 100%;
      height: 40px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      z-index: 9999999;
      pointer-events: none;

      .__btn__ {
         position: relative;
         width: auto;
         height: auto;
         font-weight: bold;
         font-size: 20px;
         padding: 8px 20px;
         background: #fff;
         box-shadow: 0 2px 2px #000;
         border-radius: 10px;
         border: 1px solid #000;
         pointer-events: all;
         overflow: hidden;
         
         
         &:before {
            content: attr(data-text);
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient( 45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
            background-size: 400%;
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            text-fill-color: transparent;
            white-space: nowrap;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: inherit;
            transition: background 300ms, color 300ms;
            animation: glowing-button 20s linear infinite;
            animation-delay: var(--delay);
            z-index: 1;
         }

         &:hover::before {
            background: linear-gradient( 45deg, #ff0000, #ff7300, #fffb00, #48ff00, #00ffd5, #002bff, #7a00ff, #ff00c8, #ff0000);
            background-size: 400%;
            animation: glowing-button 20s linear infinite;
            -webkit-background-clip: unset !important;
            background-clip: unset !important;
            -webkit-text-fill-color: #fff;
            text-fill-color: #fff;
         }
      }
   }

   #__flipkartFW__ {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      overflow-y: auto;
      background: #fff;
      z-index: 1000;
   }

   @keyframes glowing-button {
   0% {
      background-position: 0 0;
   }
   50% {
      background-position: 400% 0;
   }
   100% {
      background-position: 0 0;
   }
}
`;

function setStyle() {
   const styleEl = document.createElement("style");
   styleEl.textContent = style;
   document.head.appendChild(styleEl);
}
