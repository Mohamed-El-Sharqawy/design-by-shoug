"use client";

import { useCartItems } from "@/lib/cart-hooks";

export function WhatsAppFAB() {
  const items = useCartItems();
  const raised = items.length > 0;

  return (
    <a
      href="https://wa.me/971507397759"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={`fixed right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:scale-110 hover:shadow-xl active:scale-95 transition-all duration-300 sm:bottom-6 ${raised ? "bottom-20" : "bottom-6"}`}
    >
      <svg viewBox="0 0 32 32" className="w-7 h-7 fill-current">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.742 3.054 9.378L1.056 31.2l6.046-1.944A15.9 15.9 0 0016.004 32C24.826 32 32 24.826 32 16.004S24.826 0 16.004 0zm9.31 22.61c-.39 1.1-1.932 2.014-3.168 2.28-.846.18-1.95.322-5.67-1.218-4.762-1.97-7.826-6.81-8.064-7.126-.23-.316-1.872-2.494-1.872-4.758s1.186-3.374 1.608-3.836c.39-.428.852-.536 1.136-.536.282 0 .564.002.81.014.26.014.61-.1.952.728.354.85 1.206 2.934 1.31 3.146.108.214.18.466.036.748-.136.282-.204.458-.408.706-.214.248-.448.554-.638.744-.214.214-.436.446-.188.876.248.428 1.104 1.82 2.37 2.948 1.63 1.452 3.004 1.902 3.432 2.116.428.214.676.18.924-.108.248-.288 1.064-1.24 1.348-1.666.282-.428.564-.356.952-.214.39.142 2.478 1.168 2.902 1.382.428.214.712.322.818.498.108.178.108 1.022-.282 2.12z" />
      </svg>
    </a>
  );
}
