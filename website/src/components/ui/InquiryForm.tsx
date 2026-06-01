"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface InquiryFormProps {
  presetPurpose?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function InquiryForm({ presetPurpose = "", onClose, onSuccess }: InquiryFormProps) {
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    phone: "",
    email: "",
    interest: presetPurpose || "定制方案咨询",
    description: "",
    products: [] as string[]
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: ""
  });

  const interestOptions = [
    "获取产品手册",
    "索取样件",
    "预约产线参观",
    "定制方案咨询",
    "设备采购咨询"
  ];

  const productOptions = [
    "三维编织智能设备",
    "专用核心配件",
    "复合材料中试与成型平台",
    "非标自动化定制装备"
  ];

  const handleProductChange = (productName: string) => {
    setFormData(prev => {
      const alreadySelected = prev.products.includes(productName);
      return {
        ...prev,
        products: alreadySelected
          ? prev.products.filter(p => p !== productName)
          : [...prev.products, productName]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!formData.companyName.trim()) {
      setStatus({ type: "error", message: "请输入公司名称" });
      return;
    }
    if (!formData.contactPerson.trim()) {
      setStatus({ type: "error", message: "请输入联系人姓名" });
      return;
    }
    if (!formData.phone.trim()) {
      setStatus({ type: "error", message: "请输入手机号码" });
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(formData.phone.trim())) {
      setStatus({ type: "error", message: "请输入正确的手机号码格式" });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (result.success) {
        setStatus({
          type: "success",
          message: "您的需求已成功提交！技术顾问将在24小时内与您取得联系。"
        });
        
        // Reset form
        setFormData({
          companyName: "",
          contactPerson: "",
          phone: "",
          email: "",
          interest: presetPurpose || "定制方案咨询",
          description: "",
          products: []
        });

        if (onSuccess) {
          setTimeout(onSuccess, 2000);
        }
      } else {
        setStatus({
          type: "error",
          message: result.error || "提交失败，请稍后重试。"
        });
      }
    } catch (err) {
      console.error("Failed to submit form", err);
      setStatus({
        type: "error",
        message: "网络连接失败，请检查网络或稍后重试。"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status.type && (
        <div 
          className={`p-3 rounded-lg text-sm font-medium ${
            status.type === "success" 
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/25" 
              : "bg-rose-500/10 text-rose-600 border border-rose-500/25"
          }`}
        >
          {status.message}
        </div>
      )}

      {/* Row 1: Company Name */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
          公司名称 <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="例如：北京航天精密制造有限公司"
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#2f55d4] text-sm text-neutral-800 transition-colors"
        />
      </div>

      {/* Row 2: Contact & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
            联系人姓名 <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="张经理"
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#2f55d4] text-sm text-neutral-800 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
            手机号码 <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder="13xxxxxxxx"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#2f55d4] text-sm text-neutral-800 transition-colors"
          />
        </div>
      </div>

      {/* Row 3: Email */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
          电子邮箱 <span className="text-neutral-400 font-light">(选填)</span>
        </label>
        <input
          type="email"
          placeholder="yourname@company.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#2f55d4] text-sm text-neutral-800 transition-colors"
        />
      </div>

      {/* Row 4: Interest Area */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
          咨询目的
        </label>
        <select
          value={formData.interest}
          onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-[#2f55d4] text-sm text-neutral-800 transition-colors"
        >
          {interestOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Row 5: Products of Interest (Checkboxes) */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
          感兴趣的产品 (可多选)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {productOptions.map(product => {
            const isChecked = formData.products.includes(product);
            return (
              <label 
                key={product} 
                className={`flex items-center px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all duration-200 select-none ${
                  isChecked 
                    ? "bg-[#2f55d4]/5 border-[#2f55d4] text-[#2f55d4]" 
                    : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleProductChange(product)}
                  className="sr-only"
                />
                <span className="w-3.5 h-3.5 rounded border border-neutral-300 flex items-center justify-center mr-2 shrink-0 bg-white">
                  {isChecked && <span className="w-2 h-2 bg-[#2f55d4] rounded-sm" />}
                </span>
                {product}
              </label>
            );
          })}
        </div>
      </div>

      {/* Row 6: Description */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
          需求描述
        </label>
        <textarea
          rows={3}
          placeholder="请简要描述您的应用场景、材料规格要求或采购意向（如：火箭发动机喷管保护套，碳纤维编织）"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-[#2f55d4] text-sm text-neutral-800 transition-colors resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-neutral-200 rounded-lg text-sm font-semibold text-neutral-500 hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
          >
            取消
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-2 px-6 py-2.5 bg-[#2f55d4] hover:bg-[#1d3c9f] disabled:bg-neutral-300 text-white rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              正在提交...
            </>
          ) : (
            "提交咨询需求"
          )}
        </button>
      </div>
    </form>
  );
}
