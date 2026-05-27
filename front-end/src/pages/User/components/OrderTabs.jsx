const OrderTabs = ({ tabs, activeTab, onChange }) => {
    return (
        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                    <button
                        key={tab.key}
                        onClick={() => onChange(tab.key)}
                        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition ${isActive
                                ? "bg-amber-600 border-amber-600 text-white shadow-sm"
                                : "bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-700"
                            }`}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

export default OrderTabs;
