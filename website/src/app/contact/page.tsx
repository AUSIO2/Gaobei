"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import InquiryForm from "@/components/ui/InquiryForm";

interface HeroSection {
  title: string;
  subtitle: string;
  description: string;
}

interface InfoSection {
  address: string;
  servicePhone: string;
  recruitmentEmail: string;
  mapImage: string;
}

interface SalesSection {
  department: string;
  contactPerson: string;
  phone: string;
}

interface ContactData {
  hero: HeroSection;
  info: InfoSection;
  sales: SalesSection[];
}

export default function ContactPage() {
  const [data, setData] = useState<ContactData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/contact-details")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load contact data", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="w-full bg-[#f8f9fa] py-28 px-6 md:px-12 lg:px-24 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-6 w-32 bg-neutral-200 animate-pulse rounded" />
          <div className="h-12 w-96 bg-neutral-200 animate-pulse rounded" />
          <div className="h-6 w-128 bg-neutral-200 animate-pulse rounded" />
          <hr className="border-neutral-200 my-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-40 bg-neutral-200 animate-pulse rounded-2xl" />
            <div className="h-40 bg-neutral-200 animate-pulse rounded-2xl" />
            <div className="h-40 bg-neutral-200 animate-pulse rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="w-full bg-[#f8f9fa] py-28 px-6 md:px-12 lg:px-24 min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-neutral-800 mb-4">未找到联系我们配置</h2>
        <Link href="/" className="text-[#2f55d4] hover:underline flex items-center gap-2">
          <span>←</span> 返回首页
        </Link>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] pt-20 md:pt-28 pb-12 md:pb-20 px-4 sm:px-6 md:px-12 lg:px-24">
      {/* Breadcrumb and Back Action */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-8 flex items-center justify-between text-sm">
        <Link href="/" className="text-neutral-500 hover:text-neutral-900 flex items-center gap-2 transition-colors">
          <span className="text-base">←</span> 返回首页
        </Link>
        <div className="hidden md:flex text-neutral-400 font-light gap-2">
          <Link href="/" className="hover:text-neutral-600">首页</Link>
          <span>/</span>
          <span className="text-neutral-600 font-medium">联系我们</span>
        </div>
      </div>

      {/* 1. Hero Header */}
      <section className="max-w-7xl mx-auto mb-16 text-center md:text-left">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[#2f55d4] text-sm font-bold uppercase tracking-[0.3em] mb-3 block">
            {data.hero.subtitle}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-[#0d102c] tracking-tight mb-6 leading-tight">
            {data.hero.title}
          </h1>
          <p className="text-neutral-500 text-lg md:text-xl font-light max-w-3xl leading-relaxed">
            {data.hero.description}
          </p>
        </motion.div>
      </section>

      {/* 2. Base Contact Cards (Address, Phone, Email) */}
      <section className="max-w-7xl mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Address Card */}
          <motion.div
            className="bg-white rounded-2xl p-8 border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2f55d4] mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#0d102c] mb-3">公司地址</h3>
            <p className="text-neutral-500 text-sm font-light leading-relaxed mb-4">
              {data.info.address}
            </p>
            <span className="text-xs font-semibold text-[#2f55d4] mt-auto">R&D Center</span>
          </motion.div>

          {/* Service Phone Card */}
          <motion.div
            className="bg-white rounded-2xl p-8 border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2f55d4] mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#0d102c] mb-3">服务热线</h3>
            <a
              href={`tel:${data.info.servicePhone}`}
              className="text-neutral-900 font-bold text-xl hover:text-[#2f55d4] transition-colors mb-4"
            >
              {data.info.servicePhone}
            </a>
            <span className="text-xs font-semibold text-[#2f55d4] mt-auto">Customer Service</span>
          </motion.div>

          {/* Email Card */}
          <motion.div
            className="bg-white rounded-2xl p-8 border border-neutral-200/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-[#2f55d4] mb-6">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#0d102c] mb-3">电子邮箱</h3>
            <a
              href={`mailto:${data.info.recruitmentEmail}`}
              className="text-neutral-900 font-semibold hover:text-[#2f55d4] transition-colors mb-4 break-all"
            >
              {data.info.recruitmentEmail}
            </a>
            <span className="text-xs font-semibold text-[#2f55d4] mt-auto">Email Contacts</span>
          </motion.div>
        </div>
      </section>

      {/* 3. Division Contacts Grid */}
      <section className="max-w-7xl mx-auto mb-16">
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest block mb-2">
            SECTOR CONTACTS
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-[#0d102c] tracking-tight">
            业务板块联系人
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.sales.map((item, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl p-6 border border-neutral-200/60 shadow-sm hover:shadow-md hover:border-[#2f55d4]/40 transition-all duration-300 flex flex-col group justify-between"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{ y: -4 }}
            >
              <div>
                <span className="text-[10px] font-bold text-neutral-400 tracking-wider block mb-2">
                  BUSINESS UNIT {index + 1}
                </span>
                <h3 className="text-base font-bold text-neutral-900 mb-4 group-hover:text-[#2f55d4] transition-colors">
                  {item.department}
                </h3>
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-blue-50 group-hover:text-[#2f55d4] transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-neutral-700">{item.contactPerson}</span>
                </div>
                <a
                  href={`tel:${item.phone.split("或")[0].trim()}`}
                  className="text-sm font-bold text-[#2f55d4] hover:underline"
                >
                  {item.phone}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Map and Inquiry Form Two-column Layout */}
      <section className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Map Card */}
          <motion.div
            className="lg:col-span-5 bg-white border border-neutral-200/60 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between group overflow-hidden relative"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 text-left">
              <span className="bg-[#2f55d4]/10 text-[#2f55d4] text-[10px] font-bold tracking-wider px-3 py-1 rounded uppercase">
                LOCATION MAP
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0d102c] mt-3">地理位置示意图</h2>
              <p className="text-neutral-500 text-xs sm:text-sm mt-1.5 font-light">
                云路复材智能制造研发中心 · 重庆市沙坪坝区大学城中路
              </p>
            </div>

            {/* SVG & CSS grid coordinate mock map layout */}
            <div className="aspect-[4/3] w-full rounded-2xl bg-neutral-50 border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-4 relative overflow-hidden shadow-inner group-hover:border-[#2f55d4]/50 transition-colors duration-300">
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:25px_25px]" />
              
              <div className="absolute w-[160px] h-[160px] border border-blue-500/20 rounded-full animate-pulse pointer-events-none opacity-40" />
              
              {/* Location marker pin */}
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-neutral-100 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-[#2f55d4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="bg-[#0d102c] text-white text-[10px] font-semibold px-2.5 py-1 rounded shadow-md tracking-wider">
                  云路复材智能制造研发中心
                </div>
              </div>
            </div>
          </motion.div>

          {/* Inquiry Form Card */}
          <motion.div
            className="lg:col-span-7 bg-white border border-neutral-200/60 rounded-3xl p-6 sm:p-8 shadow-sm text-left"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <div className="mb-6">
              <span className="bg-[#2f55d4]/10 text-[#2f55d4] text-[10px] font-bold tracking-wider px-3 py-1 rounded uppercase">
                ONLINE INQUIRY
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0d102c] mt-3">提交您的咨询需求</h2>
              <p className="text-neutral-500 text-xs sm:text-sm mt-1.5 font-light">
                请在下方留下您的联系人信息与工艺要求，我们会在最快的时间内指派专人与您联系。
              </p>
            </div>
            
            <InquiryForm presetPurpose="设备采购咨询" />
          </motion.div>
        </div>
      </section>
    </main>
  );
}
