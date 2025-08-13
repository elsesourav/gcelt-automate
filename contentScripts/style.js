const style = `
   .__fw__ {
      position: relative;
      width: 100%;
      height: 40px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
      z-index: 100;
      pointer-events: none;
   }

   .__btn__ {
      position: relative;
      width: auto;
      height: auto;
      font-weight: 600;
      font-size: 14px;
      padding: 6px 14px;
      background: #2563eb;
      color: #ffffff !important;
      border: 2px solid #1d4ed8;
      border-radius: 8px;
      pointer-events: all;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
   }

   .__btn__:hover {
      background: #1d4ed8;
      border-color: #1e40af;
      box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
      transform: translateY(-1px);
   }

   .__btn__:active {
      background: #1e40af;
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
   }

   .__btn__.blue {
      background: #2563eb;
      border-color: #1d4ed8;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
   }

   .__btn__.blue:hover {
      background: #1d4ed8;
      border-color: #1e40af;
      box-shadow: 0 4px 8px rgba(37, 99, 235, 0.3);
   }

   .__btn__.blue:active {
      background: #1e40af;
   }

   .__btn__.green {
      background: #059669;
      border-color: #047857;
      box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2);
   }

   .__btn__.green:hover {
      background: #047857;
      border-color: #065f46;
      box-shadow: 0 4px 8px rgba(5, 150, 105, 0.3);
   }

   .__btn__.green:active {
      background: #065f46;
   }

   .__btn__.red {
      background: #dc2626;
      border-color: #b91c1c;
      box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2);
   }

   .__btn__.red:hover {
      background: #b91c1c;
      border-color: #991b1b;
      box-shadow: 0 4px 8px rgba(220, 38, 38, 0.3);
   }

   .__btn__.red:active {
      background: #991b1b;
   }

   .__btn__.purple {
      background: #7c3aed;
      border-color: #6d28d9;
      box-shadow: 0 2px 4px rgba(124, 58, 237, 0.2);
   }

   .__btn__.purple:hover {
      background: #6d28d9;
      border-color: #5b21b6;
      box-shadow: 0 4px 8px rgba(124, 58, 237, 0.3);
   }

   .__btn__.purple:active {
      background: #5b21b6;
   }

   .__btn__.orange {
      background: #ea580c;
      border-color: #c2410c;
      box-shadow: 0 2px 4px rgba(234, 88, 12, 0.2);
   }

   .__btn__.orange:hover {
      background: #c2410c;
      border-color: #9a3412;
      box-shadow: 0 4px 8px rgba(234, 88, 12, 0.3);
   }

   .__btn__.orange:active {
      background: #9a3412;
   }

   .__confirm__ {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      opacity: 0;
      animation: fadeIn 0.2s ease forwards;
   }

   .__confirm__ .__dialog__ {
      background: #ffffff;
      border: 1px solid rgba(229, 231, 235, 0.8);
      border-radius: 16px;
      padding: 28px;
      max-width: 380px;
      width: 88%;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
      transform: translateY(20px) scale(0.95);
      animation: slideUp 0.3s ease forwards;
   }

   .__confirm__ .__dialog__ .__title__ {
      font-size: 18px;
      font-weight: 700;
      color: #374151;
      margin-bottom: 8px;
      text-align: center;
      letter-spacing: -0.01em;
   }

   .__confirm__ .__dialog__ .__message__ {
      font-size: 14px;
      color: #9ca3af;
      margin-bottom: 24px;
      text-align: center;
      line-height: 1.4;
      font-weight: 400;
   }

   .__confirm__ .__dialog__ .__actions__ {
      display: flex;
      gap: 8px;
      justify-content: center;
   }

   .__confirm__ .__dialog__ .__actions__ .__btn__ {
      min-width: 72px;
      font-size: 13px;
      padding: 8px 16px;
      border-radius: 10px;
      font-weight: 500;
      border-width: 1px;
   }

   @keyframes fadeIn {
      to {
         opacity: 1;
      }
   }

   @keyframes slideUp {
      to {
         transform: translateY(0) scale(1);
      }
   }

   .__alert__ {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(5px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      opacity: 0;
      animation: fadeIn 0.3s ease forwards;
   }

   .__alert__ .__dialog__ {
      background: #ffffff;
      border: none;
      border-radius: 20px;
      padding: 32px 28px;
      max-width: 420px;
      width: 90%;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15), 
                  0 10px 20px rgba(0, 0, 0, 0.1),
                  0 0 0 1px rgba(255, 255, 255, 0.8);
      transform: translateY(30px) scale(0.9);
      animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      text-align: center;
      position: relative;
      overflow: hidden;
   }

   .__alert__ .__dialog__::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #3b82f6, #06b6d4, #10b981, #f59e0b, #ef4444);
      background-size: 200% 100%;
      animation: shimmer 3s linear infinite;
   }

   @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
   }

   .__alert__ .__dialog__ .__icon__ {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      font-weight: 700;
      position: relative;
      transform: scale(0);
      animation: iconPop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s forwards;
   }

   @keyframes iconPop {
      0% { transform: scale(0) rotate(-180deg); }
      100% { transform: scale(1) rotate(0deg); }
   }

   .__alert__ .__dialog__ .__icon__.success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
   }

   .__alert__ .__dialog__ .__icon__.error {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
   }

   .__alert__ .__dialog__ .__icon__.warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      box-shadow: 0 8px 20px rgba(245, 158, 11, 0.3);
   }

   .__alert__ .__dialog__ .__icon__.info {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
   }

   .__alert__ .__dialog__ .__title__ {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
      line-height: 1.3;
   }

   .__alert__ .__dialog__ .__message__ {
      font-size: 15px;
      color: #6b7280;
      margin-bottom: 28px;
      line-height: 1.5;
      font-weight: 400;
   }

   .__alert__ .__dialog__ .__actions__ {
      display: flex;
      justify-content: center;
   }

   .__alert__ .__dialog__ .__actions__ .__btn__ {
      min-width: 100px;
      font-size: 14px;
      padding: 12px 24px;
      border-radius: 12px;
      font-weight: 600;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border: none;
      color: white;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
   }

   .__alert__ .__dialog__ .__actions__ .__btn__:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
   }

   .__alert__ .__dialog__ .__actions__ .__btn__:active {
      transform: translateY(0);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
   }

   .__alert__ .__dialog__ .__actions__ .__btn__::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
   }

   .__alert__ .__dialog__ .__actions__ .__btn__:active::before {
      width: 300px;
      height: 300px;
   }

   /* PDF Preview Modal Styles */
   .__pdf-preview__ {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.3s ease;
      backdrop-filter: blur(3px);
   }

   .__pdf-preview__ .__modal__ {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      max-width: 95vw;
      max-height: 95vh;
      width: 800px;
      height: 900px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
   }

   .__pdf-preview__ .__modal__ .__header__ {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
   }

   .__pdf-preview__ .__modal__ .__header__ .__title__ {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin: 0;
   }

   .__pdf-preview__ .__modal__ .__header__ .__close__ {
      background: none;
      border: none;
      font-size: 20px;
      color: #6b7280;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s ease;
      width: 28px;
      height: 28px;
      display: flex;
      justify-content: center;
      align-items: center;
   }

   .__pdf-preview__ .__modal__ .__header__ .__close__:hover {
      background: #f3f4f6;
      color: #374151;
   }

   .__pdf-preview__ .__modal__ .__body__ {
      flex: 1;
      padding: 0;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f5f5f5;
      position: relative;
   }

   .__pdf-preview__ .__modal__ .__body__ .__iframe__ {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
   }

   .__pdf-preview__ .__modal__ .__body__ .__loading__ {
      position: absolute;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #6b7280;
      font-size: 14px;
      z-index: 10;
   }

   .__pdf-preview__ .__modal__ .__body__ .__loading__ .__spinner__ {
      width: 32px;
      height: 32px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 12px;
   }

   @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
   }

   .__pdf-preview__ .__modal__ .__body__ .__error__ {
      position: absolute;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #dc2626;
      font-size: 14px;
      padding: 40px;
      text-align: center;
      z-index: 10;
   }

   .__pdf-preview__ .__modal__ .__body__ .__error__ .__icon__ {
      font-size: 48px;
      margin-bottom: 16px;
   }
`;

function setStyle() {
   const styleEl = document.createElement("style");
   styleEl.textContent = style;
   document.head.appendChild(styleEl);
}

/* 


// Usage
showConfirm(
   "Delete Item", 
   "Are you sure you want to delete this item? This action cannot be undone.",
   () => console.log("Confirmed!"),
   () => console.log("Cancelled!")
);


// Simple alert
showAlert({
   type: 'success',
   title: 'Success!',
   message: 'Your action was completed successfully.',
});

// With callback
showAlert({
   type: 'error',
   title: 'Error',
   message: 'Something went wrong. Please try again.',
   buttonText: 'Got it',
   onClose: () => console.log('Alert closed')
});

*/
