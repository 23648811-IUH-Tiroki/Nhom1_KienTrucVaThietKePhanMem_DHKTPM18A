import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
    fetchShippingAddress,
    updateShippingAddress,
} from "../../../services/userService";
import { isValidPhone } from "../../../utils/validation";

const STORAGE_KEY = "savedShippingAddresses";
const LOCATION_API_BASE = "https://provinces.open-api.vn/api";

const emptyForm = {
    receiverName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    detailAddress: "",
};

const ShippingInfo = ({ onAddressUpdated }) => {
    const [form, setForm] = useState(emptyForm);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState("");
    const [selectedDistrictCode, setSelectedDistrictCode] = useState("");
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    const storedUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }
    }, []);

    const createAddressId = () =>
        `addr_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const normalizeText = (value) => String(value || "").trim().toLowerCase();

    const validateShippingForm = (formData) => {
        const nextErrors = {};

        if (!formData.receiverName || !String(formData.receiverName).trim()) {
            nextErrors.receiverName = "Thông tin người nhận không được để trống.";
        }

        if (!formData.phone || !String(formData.phone).trim()) {
            nextErrors.phone = "Số điện thoại không được để trống.";
        } else if (!isValidPhone(formData.phone)) {
            nextErrors.phone = "Số điện thoại phải có đúng 10 chữ số.";
        }

        return nextErrors;
    };
    
    const getAddressSignature = (address) =>
        [
            address.receiverName,
            address.phone,
            address.province,
            address.district,
            address.ward,
            address.detailAddress,
        ]
            .map((value) => String(value || "").trim().toLowerCase())
            .join("|");

    const mergeAddress = (list, address) => {
        if (!address) return list;

        const signature = getAddressSignature(address);
        const existingIndex = list.findIndex(
            (item) => getAddressSignature(item) === signature
        );

        if (existingIndex !== -1) {
            const nextList = [...list];
            nextList[existingIndex] = {
                ...nextList[existingIndex],
                ...address,
            };
            return nextList;
        }

        return [
            {
                id: createAddressId(),
                ...address,
            },
            ...list,
        ];
    };

    useEffect(() => {
        const loadShippingAddress = async () => {
            try {
                let savedList = [];
                try {
                    const raw = localStorage.getItem(STORAGE_KEY);
                    savedList = raw ? JSON.parse(raw) : [];
                    if (!Array.isArray(savedList)) {
                        savedList = [];
                    }
                } catch {
                    savedList = [];
                }

                const response = await fetchShippingAddress();
                const savedAddress = response?.data?.shippingAddress;
                const nextList = mergeAddress(savedList, savedAddress);
                setSavedAddresses(nextList);

                const fallbackReceiver = storedUser?.fullName || "";
                const fallbackPhone = storedUser?.phone || "";

                if (savedAddress) {
                    const existing = nextList.find(
                        (item) => getAddressSignature(item) === getAddressSignature(savedAddress)
                    );
                    setSelectedAddressId(existing?.id || null);
                    setForm({
                        receiverName: savedAddress.receiverName || fallbackReceiver,
                        phone: savedAddress.phone || fallbackPhone,
                        province: savedAddress.province || "",
                        district: savedAddress.district || "",
                        ward: savedAddress.ward || "",
                        detailAddress: savedAddress.detailAddress || "",
                    });
                } else if (nextList.length > 0) {
                    const first = nextList[0];
                    setSelectedAddressId(first.id);
                    setForm({
                        receiverName: first.receiverName || fallbackReceiver,
                        phone: first.phone || fallbackPhone,
                        province: first.province || "",
                        district: first.district || "",
                        ward: first.ward || "",
                        detailAddress: first.detailAddress || "",
                    });
                } else if (fallbackReceiver || fallbackPhone) {
                    setForm((prev) => ({
                        ...prev,
                        receiverName: fallbackReceiver || prev.receiverName,
                        phone: fallbackPhone || prev.phone,
                    }));
                }

                localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
            } catch (err) {
                console.error("Failed to load shipping address:", err);
            } finally {
                setLoading(false);
            }
        };

        loadShippingAddress();
    }, []);

    useEffect(() => {
        const loadProvinces = async () => {
            setIsLoadingLocations(true);
            try {
                const response = await fetch(`${LOCATION_API_BASE}/p/`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setProvinces(data);
                } else {
                    setProvinces([]);
                }
            } catch (err) {
                console.error("Failed to load provinces:", err);
                setProvinces([]);
            } finally {
                setIsLoadingLocations(false);
            }
        };

        loadProvinces();
    }, []);

    useEffect(() => {
        if (!selectedProvinceCode) {
            setDistricts([]);
            setWards([]);
            return;
        }

        const loadDistricts = async () => {
            setIsLoadingLocations(true);
            try {
                const response = await fetch(
                    `${LOCATION_API_BASE}/p/${selectedProvinceCode}?depth=2`
                );
                const data = await response.json();
                if (Array.isArray(data?.districts)) {
                    setDistricts(data.districts);
                } else {
                    setDistricts([]);
                }
            } catch (err) {
                console.error("Failed to load districts:", err);
                setDistricts([]);
            } finally {
                setIsLoadingLocations(false);
            }
        };

        loadDistricts();
    }, [selectedProvinceCode]);

    useEffect(() => {
        if (!selectedDistrictCode) {
            setWards([]);
            return;
        }

        const loadWards = async () => {
            setIsLoadingLocations(true);
            try {
                const response = await fetch(
                    `${LOCATION_API_BASE}/d/${selectedDistrictCode}?depth=2`
                );
                const data = await response.json();
                if (Array.isArray(data?.wards)) {
                    setWards(data.wards);
                } else {
                    setWards([]);
                }
            } catch (err) {
                console.error("Failed to load wards:", err);
                setWards([]);
            } finally {
                setIsLoadingLocations(false);
            }
        };

        loadWards();
    }, [selectedDistrictCode]);

    const handleChange = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleSelectAddress = (addressId) => {
        const selected = savedAddresses.find((item) => item.id === addressId);
        if (!selected) return;

        const matchedProvince = provinces.find(
            (item) => normalizeText(item.name) === normalizeText(selected.province)
        );
        const nextProvinceCode = matchedProvince ? String(matchedProvince.code) : "";
        setSelectedProvinceCode(nextProvinceCode);
        setSelectedDistrictCode("");

        setSelectedAddressId(addressId);
        setForm({
            receiverName: selected.receiverName || "",
            phone: selected.phone || "",
            province: selected.province || "",
            district: selected.district || "",
            ward: selected.ward || "",
            detailAddress: selected.detailAddress || "",
        });
    };

    const buildOptions = (values, fallback) => {
        const next = [
            ...new Set(
                values
                    .map((value) => String(value || "").trim())
                    .filter(Boolean)
            ),
        ];
        if (next.length === 0) {
            return fallback;
        }
        return next;
    };

    const provinceOptions = useMemo(() => {
        const fromApi = provinces.map((item) => item.name);
        return buildOptions(fromApi, []);
    }, [provinces]);

    const districtOptions = useMemo(() => {
        const fromApi = districts.map((item) => item.name);
        return buildOptions(fromApi, []);
    }, [districts]);

    const wardOptions = useMemo(() => {
        const fromApi = wards.map((item) => item.name);
        return buildOptions(fromApi, []);
    }, [wards]);

    useEffect(() => {
        if (!form.province || provinces.length === 0) return;
        if (selectedProvinceCode) return;

        const matched = provinces.find(
            (item) => normalizeText(item.name) === normalizeText(form.province)
        );
        if (matched) {
            setSelectedProvinceCode(String(matched.code));
        }
    }, [form.province, provinces, selectedProvinceCode]);

    useEffect(() => {
        if (!form.district || districts.length === 0) return;
        if (selectedDistrictCode) return;

        const matched = districts.find(
            (item) => normalizeText(item.name) === normalizeText(form.district)
        );
        if (matched) {
            setSelectedDistrictCode(String(matched.code));
        }
    }, [form.district, districts, selectedDistrictCode]);

    useEffect(() => {
        if (!form.ward || wards.length === 0) return;
        const matched = wards.find(
            (item) => normalizeText(item.name) === normalizeText(form.ward)
        );
        if (!matched) return;
        const wardName = matched.name || "";
        if (wardName && wardName !== form.ward) {
            setForm((prev) => ({ ...prev, ward: wardName }));
        }
    }, [form.ward, wards]);

    const handleProvinceChange = (event) => {
        const nextCode = event.target.value;
        const selected = provinces.find((item) => String(item.code) === nextCode);
        setSelectedProvinceCode(nextCode);
        setSelectedDistrictCode("");
        setWards([]);
        setForm((prev) => ({
            ...prev,
            province: selected?.name || "",
            district: "",
            ward: "",
        }));
    };

    const handleDistrictChange = (event) => {
        const nextCode = event.target.value;
        const selected = districts.find((item) => String(item.code) === nextCode);
        setSelectedDistrictCode(nextCode);
        setForm((prev) => ({
            ...prev,
            district: selected?.name || "",
            ward: "",
        }));
    };

    const handleWardChange = (event) => {
        const nextCode = event.target.value;
        const selected = wards.find((item) => String(item.code) === nextCode);
        setForm((prev) => ({
            ...prev,
            ward: selected?.name || "",
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const nextErrors = validateShippingForm(form);
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }
        setSaving(true);

        try {
            const response = await updateShippingAddress(form);
            toast.success("Đã lưu thông tin giao hàng!");
            setErrors({});

            const nextList = mergeAddress(savedAddresses, form);
            const selected = nextList.find(
                (item) => getAddressSignature(item) === getAddressSignature(form)
            );
            setSavedAddresses(nextList);
            setSelectedAddressId(selected?.id || null);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));

            if (onAddressUpdated) {
                onAddressUpdated(response?.data);
            }
            // toast.success("Thông tin giao hàng đã được cập nhật.");
        } catch (err) {
            console.error("Failed to update shipping address:", err);
            const payloadErrors = err?.response?.data?.errors || {};
            setErrors(payloadErrors);
            toast.error(
                err?.response?.data?.message || "Không thể lưu địa chỉ giao hàng."
            );
            toast.error("Vui lòng kiểm tra lại thông tin và thử lại sau.")
        
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-slate-900">
                Thông tin giao hàng
            </h1>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-slate-600">
                            Người nhận
                        </label>
                        <input
                            type="text"
                            value={form.receiverName}
                            onChange={handleChange("receiverName")}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                            placeholder="Nguyen Van Nam"
                        />
                        {errors.receiverName && (
                            <p className="text-sm font-semibold text-rose-600 mt-1">
                                {errors.receiverName}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600">
                            Số điện thoại
                        </label>
                        <input
                            type="text"
                            value={form.phone}
                            onChange={handleChange("phone")}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                            placeholder="0912345678"
                        />
                        {errors.phone && (
                            <p className="text-sm font-semibold text-rose-600 mt-1">{errors.phone}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600">
                            Thành phố/Tỉnh
                        </label>
                        <select
                            value={selectedProvinceCode}
                            onChange={handleProvinceChange}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                            disabled={isLoadingLocations && provinces.length === 0}
                        >
                            <option value="">
                                {isLoadingLocations && provinces.length === 0
                                    ? "Dang tai tinh/thanh..."
                                    : "-- Chon tinh --"}
                            </option>
                            {provinceOptions.map((value) => {
                                const matched = provinces.find(
                                    (item) => normalizeText(item.name) === normalizeText(value)
                                );
                                return (
                                    <option key={value} value={matched?.code || value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                        {errors.province && (
                            <p className="text-sm font-semibold text-rose-600 mt-1">{errors.province}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600">
                            Quan/Huyen
                        </label>
                        <select
                            value={selectedDistrictCode}
                            onChange={handleDistrictChange}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                            disabled={!selectedProvinceCode || districts.length === 0}
                        >
                            <option value="">-- Chon quan/huyen --</option>
                            {districtOptions.map((value) => {
                                const matched = districts.find(
                                    (item) => normalizeText(item.name) === normalizeText(value)
                                );
                                return (
                                    <option key={value} value={matched?.code || value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                        {errors.district && (
                            <p className="text-sm font-semibold text-rose-600 mt-1">{errors.district}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600">
                            Phường/Xã
                        </label>
                        <select
                            value={
                                wards.find(
                                    (item) => normalizeText(item.name) === normalizeText(form.ward)
                                )?.code || ""
                            }
                            onChange={handleWardChange}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                            disabled={!selectedDistrictCode || wards.length === 0}
                        >
                            <option value="">-- Chọn phường/xã --</option>
                            {wardOptions.map((value) => {
                                const matched = wards.find(
                                    (item) => normalizeText(item.name) === normalizeText(value)
                                );
                                return (
                                    <option key={value} value={matched?.code || value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                        {errors.ward && (
                            <p className="text-sm font-semibold text-rose-600 mt-1">{errors.ward}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-600">
                            Địa chỉ chi tiết
                        </label>
                        <input
                            type="text"
                            value={form.detailAddress}
                            onChange={handleChange("detailAddress")}
                            className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-200"
                            placeholder="So nha, ten duong"
                        />
                        {errors.detailAddress && (
                            <p className="text-sm font-semibold text-rose-600 mt-1">
                                {errors.detailAddress}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 transition disabled:opacity-60"
                >
                    {saving ? "Đang lưu..." : "Lưu địa chỉ"}
                </button>
            </form>
        </div>
    );
};

export default ShippingInfo;
