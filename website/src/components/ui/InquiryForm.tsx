"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface InquiryFormProps {
  presetPurpose?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function InquiryForm({ presetPurpose = "", onClose, onSuccess }: InquiryFormProps) {
  const t = useTranslations("inquiry");

  const interestOptions = [
    { value: "获取产品手册", label: t("purposeOptions.brochure") },
    { value: "索取样件", label: t("purposeOptions.sample") },
    { value: "预约产线参观", label: t("purposeOptions.visit") },
    { value: "定制方案咨询", label: t("purposeOptions.consult") },
    { value: "设备采购咨询", label: t("purposeOptions.purchase") },
  ];

  const productOptions = [
    { value: "三维编织智能设备", label: t("productOptions.braiding") },
    { value: "专用核心配件", label: t("productOptions.accessories") },
    { value: "复合材料中试与成型平台", label: t("productOptions.platform") },
    { value: "非标自动化定制装备", label: t("productOptions.automation") },
  ];

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

  const handleProductChange = (productValue: string) => {
    setFormData(prev => {
      const alreadySelected = prev.products.includes(productValue);
      return {
        ...prev,
        products: alreadySelected
          ? prev.products.filter(p => p !== productValue)
          : [...prev.products, productValue]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!formData.companyName.trim()) {
      setStatus({ type: "error", message: t("validationCompany") });
      return;
    }
    if (!formData.contactPerson.trim()) {
      setStatus({ type: "error", message: t("validationContact") });
      return;
    }
    if (!formData.phone.trim()) {
      setStatus({ type: "error", message: t("validationPhone") });
      return;
    }
    // Support both Chinese mobile and international phone formats
    const phoneClean = formData.phone.trim().replace(/[\s\-\(\)]/g, '');
    if (!/^(\+?\d{7,15}|1[3-9]\d{9})$/.test(phoneClean)) {
      setStatus({ type: "error", message: t("validationPhoneFormat") });
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
          message: t("successMessage")
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
          message: result.error || t("errorMessage")
        });
      }
    } catch (err) {
      console.error("Failed to submit form", err);
      setStatus({
        type: "error",
        message: t("networkError")
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
          {t("companyName")} <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder={t("companyPlaceholder")}
          value={formData.companyName}
          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-brand text-sm text-neutral-800 transition-colors"
        />
      </div>

      {/* Row 2: Contact & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
            {t("contactPerson")} <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder={t("contactPlaceholder")}
            value={formData.contactPerson}
            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-brand text-sm text-neutral-800 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
            {t("phone")} <span className="text-rose-500">*</span>
          </label>
          <input
            type="tel"
            required
            placeholder={t("phonePlaceholder")}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-brand text-sm text-neutral-800 transition-colors"
          />
        </div>
      </div>

      {/* Row 3: Email */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
          {t("email")} <span className="text-neutral-400 font-light">{t("emailOptional")}</span>
        </label>
        <input
          type="email"
          placeholder={t("emailPlaceholder")}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-brand text-sm text-neutral-800 transition-colors"
        />
      </div>

      {/* Row 4: Interest Area */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
          {t("purpose")}
        </label>
        <select
          value={formData.interest}
          onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 bg-white focus:outline-none focus:border-brand text-sm text-neutral-800 transition-colors"
        >
          {interestOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Row 5: Products of Interest (Checkboxes) */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
          {t("products")}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {productOptions.map(product => {
            const isChecked = formData.products.includes(product.value);
            return (
              <label 
                key={product.value} 
                className={`flex items-center px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all duration-200 select-none ${
                  isChecked 
                    ? "bg-brand/5 border-brand text-brand" 
                    : "bg-neutral-50 border-neutral-200 text-neutral-600 hover:bg-neutral-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleProductChange(product.value)}
                  className="sr-only"
                />
                <span className="w-3.5 h-3.5 rounded border border-neutral-300 flex items-center justify-center mr-2 shrink-0 bg-white">
                  {isChecked && <span className="w-2 h-2 bg-brand rounded-sm" />}
                </span>
                {product.label}
              </label>
            );
          })}
        </div>
      </div>

      {/* Row 6: Description */}
      <div>
        <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">
          {t("description")}
        </label>
        <textarea
          rows={3}
          placeholder={t("descPlaceholder")}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:outline-none focus:border-brand text-sm text-neutral-800 transition-colors resize-none"
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
            {t("cancelBtn")}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex-2 px-6 py-2.5 bg-brand hover:bg-brand-hover disabled:bg-neutral-300 text-white rounded-lg text-sm font-semibold shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {t("submitting")}
            </>
          ) : (
            t("submitBtn")
          )}
        </button>
      </div>
    </form>
  );
}
