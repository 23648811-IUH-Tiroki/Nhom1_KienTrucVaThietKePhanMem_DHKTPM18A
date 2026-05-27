import { FaEye, FaTrash } from "react-icons/fa";

const formatCurrency = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(value || 0);

const OrderCard = ({
    order,
    statusMeta,
    onView,
    onCancel,
    canCancel,
    formatDate,
}) => {
    const statusInfo = statusMeta[order.statusNormalized];
    const paymentMethod =
        order.payment_method || order.paymentMethod || "Thanh toán khi nhận hàng";

    return (
        <div className="bg-white border border-slate-100 rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <p className="text-sm text-slate-500">Mã đơn hàng</p>
                    <p className="text-lg font-semibold text-slate-900">
                        #{order._id.substring(order._id.length - 6).toUpperCase()}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo?.badge || "border-slate-200 text-slate-600"
                            }`}
                    >
                        {statusInfo?.label || order.status}
                    </span>
                    <p className="text-lg font-semibold text-slate-900">
                        {formatCurrency(order.total_price)}
                    </p>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm text-slate-600">
                <div>
                    <p className="text-slate-500">Ngày đặt</p>
                    <p className="font-medium text-slate-800">
                        {formatDate(order.order_date)}
                    </p>
                </div>
                <div>
                    <p className="text-slate-500">Trạng thái</p>
                    <p className="font-medium text-slate-800">
                        {statusInfo?.label || order.status}
                    </p>
                </div>
                <div>
                    <p className="text-slate-500">Thanh toán</p>
                    <p className="font-medium text-slate-800">{paymentMethod}</p>
                </div>
                <div className="md:text-right">
                    <p className="text-slate-500">Tổng tiền</p>
                    <p className="font-semibold text-slate-900">
                        {formatCurrency(order.total_price)}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                    onClick={() => onView(order)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:border-amber-300 hover:text-amber-700 transition"
                >
                    <FaEye />
                    Xem chi tiết
                </button>
                {canCancel && (
                    <button
                        onClick={() => onCancel(order._id)}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-rose-200 text-rose-600 text-sm font-medium hover:bg-rose-50 transition"
                    >
                        <FaTrash />
                        Hủy đơn hàng
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderCard;
