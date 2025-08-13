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
      font-size: 16px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
      text-align: center;
      letter-spacing: -0.01em;
   }

   .__confirm__ .__dialog__ .__message__ {
      font-size: 13px;
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
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(3px);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      opacity: 0;
      animation: fadeIn 0.2s ease forwards;
   }

   .__alert__ .__dialog__ {
      background: #ffffff;
      border: 1px solid rgba(229, 231, 235, 0.6);
      border-radius: 14px;
      padding: 24px;
      max-width: 350px;
      width: 85%;
      box-shadow: 0 3px 15px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
      transform: translateY(15px) scale(0.96);
      animation: slideUp 0.25s ease forwards;
      text-align: center;
   }

   .__alert__ .__dialog__ .__icon__ {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin: 0 auto 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 600;
   }

   .__alert__ .__dialog__ .__icon__.success {
      background: rgba(34, 197, 94, 0.1);
      color: #059669;
   }

   .__alert__ .__dialog__ .__icon__.error {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
   }

   .__alert__ .__dialog__ .__icon__.warning {
      background: rgba(245, 158, 11, 0.1);
      color: #d97706;
   }

   .__alert__ .__dialog__ .__icon__.info {
      background: rgba(59, 130, 246, 0.1);
      color: #2563eb;
   }

   .__alert__ .__dialog__ .__title__ {
      font-size: 15px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 6px;
      letter-spacing: -0.01em;
   }

   .__alert__ .__dialog__ .__message__ {
      font-size: 12px;
      color: #9ca3af;
      margin-bottom: 20px;
      line-height: 1.4;
      font-weight: 400;
   }

   .__alert__ .__dialog__ .__actions__ {
      display: flex;
      justify-content: center;
   }

   .__alert__ .__dialog__ .__actions__ .__btn__ {
      min-width: 60px;
      font-size: 12px;
      padding: 6px 14px;
      border-radius: 8px;
      font-weight: 500;
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
