"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface Contact {
  role: string;
  name: string;
  phone: string;
}

interface QRCodeConfig {
  label: string;
  image?: string;
}

interface CompanyInfo {
  contactTitle: string;
  contacts: Contact[];
  footer: {
    email: string;
    address: string;
    copyright: string;
    support: string;
    qrCodes: QRCodeConfig[];
  };
}

export default function Footer() {
  const [info, setInfo] = useState<CompanyInfo | null>(null);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  useEffect(() => {
    setMounted(true);
    fetch("/api/company-info")
      .then((res) => res.json())
      .then((data) => {
        if (data.contacts) {
          setInfo(data);
        }
      })
      .catch((err) => console.error("Failed to load footer company info:", err));
  }, []);

  // Standard fallback data for hydration safety
  const defaultInfo: CompanyInfo = {
    contactTitle: "行业联系人电话",
    contacts: [
      { role: "三维编织智能设备", name: "罗先生", phone: "13203705005" },
      { role: "专用核心配件", name: "廖先生", phone: "13911123978" },
      { role: "复合材料中试与成型平台", name: "赵先生", phone: "18032899119或13739783590" },
      { role: "国际（所有产品）", name: "吴先生", phone: "18618319979" },
      { role: "非标自动化定制装备", name: "陈先生", phone: "13108956091" }
    ],
    footer: {
      email: "info@yunlu-composites.com",
      address: "智能制造研发中心",
      copyright: "版权所有 苏ICP备2026031187号",
      support: "技术支持：智造团队",
      qrCodes: [
        { label: "官方微信", image: "official.png" },
        { label: "官方微信", image: "wechat.png" },
        { label: "技术支持", image: "support.png" }
      ]
    }
  };

  const activeInfo = info || defaultInfo;

  const renderCopyright = (text: string) => {
    const regex = /([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]ICP备\d+号(?:-\d+)?)/;
    const parts = text.split(regex);
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <a
            key={index}
            href="https://beian.miit.gov.cn/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline hover:text-neutral-300 transition-colors"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Handles dynamic loading of QR code images and falls back to vector SVG on failure
  function QRCodeDisplay({ qr }: { qr: QRCodeConfig }) {
    const [imgError, setImgError] = useState(false);
    const hasImage = !!qr.image;

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white p-1 rounded-sm flex items-center justify-center shadow-md overflow-hidden relative">
          {hasImage && !imgError ? (
            <img
              src={`/api/contact/${encodeURIComponent(qr.image!)}`}
              alt={qr.label}
              className="w-full h-full object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full bg-neutral-100 flex items-center justify-center animate-pulse">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-neutral-300" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-3.75a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM3.75 15.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-3.75a1.125 1.125 0 0 1-1.125-1.125v-3.75ZM15.375 3.75c-.621 0-1.125.504-1.125 1.125v3.75c0 .621.504 1.125 1.125 1.125h3.75c.621 0 1.125-.504 1.125-1.125v-3.75c0-.621-.504-1.125-1.125-1.125h-3.75ZM19.5 19.5h.008v.008h-.008v-.008Zm0-3h.008v.008h-.008v-.008Zm0-3h.008v.008h-.008v-.008Zm-3 3h.008v.008h-.008v-.008Zm0-3h.008v.008h-.008v-.008Zm-3 3h.008v.008h-.008v-.008Zm3 3h.008v.008h-.008v-.008Zm-3 0h.008v.008h-.008v-.008Z" />
              </svg>
            </div>
          )}
        </div>
        <span className="text-[10px] sm:text-[11px] text-neutral-400 font-light mt-1 text-center truncate w-16 sm:w-20">
          {qr.label}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 1. 联系电话板块 */}
      {isHomepage && (
        <section className="bg-white py-10 sm:py-12 md:py-16 px-4 sm:px-6 md:px-12 lg:px-24 border-t border-neutral-100">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand mb-6 md:mb-8 tracking-tight">
              {activeInfo.contactTitle}
            </h2>
            <div className="space-y-3 md:space-y-4 text-neutral-700 text-sm md:text-base leading-relaxed tracking-wide">
              {activeInfo.contacts.map((contact, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:flex-wrap sm:items-baseline gap-0.5 sm:gap-0">
                  <span className="font-medium text-neutral-800">{contact.role}</span>
                  <span className="hidden sm:inline text-neutral-300 mx-2">— —</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-neutral-500">{contact.name}：</span>
                    <a
                      href={`tel:${contact.phone.split("或")[0]}`}
                      className="text-neutral-900 font-bold hover:text-brand active:text-brand transition-colors text-base md:text-inherit"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 2. 黑色底栏 */}
      <footer className="bg-black text-neutral-400 py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-12 lg:px-24 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col gap-8 md:gap-10">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            {/* 左侧文字信息 */}
            <div className="flex flex-col gap-2 sm:gap-3 text-xs md:text-sm leading-loose">
              <p className="flex items-center gap-2">
                <span className="font-semibold text-neutral-300 shrink-0">邮箱:</span>
                <a href={`mailto:${activeInfo.footer.email}`} className="hover:text-white active:text-white transition-colors break-all">
                  {activeInfo.footer.email}
                </a>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-semibold text-neutral-300 shrink-0">地址:</span>
                <span className="text-neutral-400 font-light">{activeInfo.footer.address}</span>
              </p>
            </div>

            {/* 右侧二维码组 */}
            <div className="flex gap-4 sm:gap-6 shrink-0">
              {activeInfo.footer.qrCodes.map((qr, idx) => (
                <QRCodeDisplay key={idx} qr={qr} />
              ))}
            </div>
          </div>

          {/* 版权信息 */}
          <div className="text-[10px] sm:text-[11px] text-neutral-500 font-light flex flex-col sm:flex-row flex-wrap gap-1 sm:gap-2 md:gap-4 items-start sm:items-center border-t border-neutral-800 pt-4 md:pt-6">
            <span>{renderCopyright(activeInfo.footer.copyright)}</span>
            <span className="hidden sm:inline text-neutral-700">|</span>
            <span>{activeInfo.footer.support}</span>
          </div>

        </div>
      </footer>
    </div>
  );
}
