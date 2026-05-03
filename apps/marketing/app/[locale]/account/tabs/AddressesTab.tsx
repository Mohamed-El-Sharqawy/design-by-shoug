"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  type Address,
} from "@repo/api-client";

const emptyForm = {
  label: "",
  fullName: "",
  phone: "",
  country: "",
  city: "",
  district: "",
  street: "",
  building: "",
  apartment: "",
  postalCode: "",
  isDefault: false,
};

export function AddressesTab() {
  const t = useTranslations("Account");
  const { data: addresses = [], isLoading: loading } = useAddresses();
  const createAddress = useCreateAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (addr: Address) => {
    setForm({
      label: addr.label || "",
      fullName: addr.fullName,
      phone: addr.phone,
      country: addr.country,
      city: addr.city,
      district: addr.district || "",
      street: addr.street,
      building: addr.building || "",
      apartment: addr.apartment || "",
      postalCode: addr.postalCode || "",
      isDefault: addr.isDefault,
    });
    setEditId(addr.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      label: form.label || undefined,
      district: form.district || undefined,
      building: form.building || undefined,
      apartment: form.apartment || undefined,
      postalCode: form.postalCode || undefined,
    };

    if (editId) {
      updateAddress.mutate({ id: editId, data }, { onSuccess: () => setShowForm(false) });
    } else {
      createAddress.mutate({ ...data, isDefault: addresses.length === 0 }, { onSuccess: () => setShowForm(false) });
    }
  };

  const handleDelete = (id: string) => {
    deleteAddress.mutate(id);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border-2 border-[#E8E4DF] rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-[#1A1A1A] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-[#1A1A1A] tracking-wide">{t("addresses")}</h2>
        <button
          type="button"
          onClick={openCreate}
          className="px-5 py-2.5 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors"
        >
          {t("addAddress")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 border border-[#E8E4DF] bg-[#FAF9F7]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("label")}</label>
              <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("fullName")} *</label>
              <input required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("phone")} *</label>
              <input required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} dir="ltr" className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("country")} *</label>
              <input required value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("city")} *</label>
              <input required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("district")}</label>
              <input value={form.district} onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))} className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("street")} *</label>
              <input required value={form.street} onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))} className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("building")}</label>
              <input value={form.building} onChange={(e) => setForm((f) => ({ ...f, building: e.target.value }))} className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("apartment")}</label>
              <input value={form.apartment} onChange={(e) => setForm((f) => ({ ...f, apartment: e.target.value }))} className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#8B7355] mb-1.5">{t("postalCode")}</label>
              <input value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} dir="ltr" className="w-full px-3 py-2.5 border border-[#E8E4DF] text-sm font-light focus:outline-none focus:border-[#1A1A1A]" />
            </div>
          </div>
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} className="w-4 h-4 accent-[#1A1A1A]" />
            <span className="text-xs tracking-wide text-[#1A1A1A] font-light">{t("setDefault")}</span>
          </label>
          <div className="flex gap-3 mt-6">
            <button type="submit" className="px-6 py-2.5 bg-[#1A1A1A] text-white text-xs tracking-widest uppercase font-light hover:bg-[#333] transition-colors">{t("save")}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-[#E8E4DF] text-[#1A1A1A] text-xs tracking-widest uppercase font-light hover:border-[#1A1A1A] transition-colors">{t("cancel")}</button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-16 h-16 mx-auto text-[#E8E4DF] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <p className="text-sm text-[#1A1A1A] mb-2">{t("noAddresses")}</p>
          <p className="text-xs text-[#999] font-light">{t("noAddressesDesc")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="border border-[#E8E4DF] p-5 relative">
              {addr.isDefault && (
                <span className="absolute top-3 inset-e-3 px-2 py-0.5 bg-[#8B7355] text-white text-[9px] tracking-widest uppercase">{t("default")}</span>
              )}
              {addr.label && (
                <p className="text-xs tracking-widest uppercase text-[#8B7355] mb-2">{addr.label}</p>
              )}
              <p className="text-sm text-[#1A1A1A] font-light">{addr.fullName}</p>
              <p className="text-sm text-[#999] font-light mt-1" dir="ltr">{addr.phone}</p>
              <p className="text-sm text-[#555] font-light mt-2">
                {addr.street}{addr.building ? `, ${addr.building}` : ""}{addr.apartment ? `, ${addr.apartment}` : ""}
                {addr.district ? `, ${addr.district}` : ""}, {addr.city}, {addr.country}
                {addr.postalCode ? ` ${addr.postalCode}` : ""}
              </p>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => openEdit(addr)} className="text-xs tracking-wide text-[#8B7355] hover:text-[#7A6348] transition-colors font-light">{t("editAddress")}</button>
                <button type="button" onClick={() => handleDelete(addr.id)} className="text-xs tracking-wide text-red-400 hover:text-red-600 transition-colors font-light">{t("deleteAddress")}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
