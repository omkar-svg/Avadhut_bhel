import { useState, useEffect } from 'react';
import { getDailyReport, getSummaryReport, type DailyReportResponse, type SummaryReportResponse } from '../services/api';
import { Calendar, TrendingUp, ShoppingBag, IndianRupee, Tag, Clock, Users, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export function ReportsPage() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [dailyReport, setDailyReport] = useState<DailyReportResponse | null>(null);
  const [summaryReport, setSummaryReport] = useState<SummaryReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDailyReport = async (date: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDailyReport(date);
      setDailyReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await getSummaryReport();
      setSummaryReport(data);
    } catch {
      // non-critical
    }
  };

  useEffect(() => {
    loadDailyReport(selectedDate);
    loadSummary();
  }, [selectedDate]);

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h} ${ampm}`;
  };

  const maxHourlyRevenue = dailyReport
    ? Math.max(...dailyReport.hourlyBreakdown.map((h) => h.revenue), 1)
    : 1;

  return (
    <div className="min-h-full bg-gray-50/60 p-3 sm:p-6 pb-24 overflow-y-auto w-full max-w-full overflow-x-hidden">
      <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6 w-full min-w-0">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-brand-500" />
              Sales &amp; Daily Analytics
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Track revenue, peak hours, and bill history
            </p>
          </div>

          {/* Date Picker & Quick Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setSelectedDate(today)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedDate === today ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setSelectedDate(yesterday)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedDate === yesterday ? 'bg-white text-brand-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yesterday
              </button>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm">
              <Calendar className="w-4 h-4 text-brand-500 flex-shrink-0" />
              <input
                type="date"
                value={selectedDate}
                max={today}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs sm:text-sm font-bold text-gray-700 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => loadDailyReport(selectedDate)}
              className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-4 text-xs sm:text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Unable to load report</p>
              <p className="text-rose-600">{error} (Backend server on port 3001)</p>
            </div>
            <button
              onClick={() => loadDailyReport(selectedDate)}
              className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
            <p className="text-xs text-gray-400 font-bold">Calculating sales data…</p>
          </div>
        )}

        {dailyReport && !loading && (
          <>
            {/* Stat Cards (2 cols mobile, 4 cols desktop) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <StatCard
                icon={<IndianRupee className="w-5 h-5 text-emerald-600" />}
                iconBg="bg-emerald-100"
                label="Total Revenue"
                value={`₹${dailyReport.summary.totalRevenue.toLocaleString()}`}
                highlight
              />
              <StatCard
                icon={<ShoppingBag className="w-5 h-5 text-blue-600" />}
                iconBg="bg-blue-100"
                label="Total Orders"
                value={dailyReport.summary.totalOrders.toString()}
              />
              <StatCard
                icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
                iconBg="bg-purple-100"
                label="Avg Order Value"
                value={`₹${dailyReport.summary.averageOrderValue.toFixed(0)}`}
              />
              <StatCard
                icon={<Tag className="w-5 h-5 text-orange-600" />}
                iconBg="bg-orange-100"
                label="Total Discount"
                value={`₹${dailyReport.summary.totalDiscount.toLocaleString()}`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Top Selling Items */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col">
                <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <h2 className="font-bold text-gray-900 text-sm sm:text-base">Top Selling Items</h2>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">
                    {dailyReport.topItems.length} items sold
                  </span>
                </div>
                {dailyReport.topItems.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs sm:text-sm">No items sold on this date</div>
                ) : (
                  <div className="divide-y divide-gray-100 flex-1">
                    {dailyReport.topItems.map((item, i) => (
                      <div key={item.name} className="px-4 sm:px-5 py-3 flex items-center gap-3 sm:gap-4">
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
                            i === 0
                              ? 'bg-amber-100 text-amber-800'
                              : i === 1
                              ? 'bg-slate-100 text-slate-700'
                              : i === 2
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          #{i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-500">{item.quantity} sold</p>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-brand-600 flex-shrink-0">
                          ₹{item.revenue}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hourly Breakdown */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col">
                <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-500" />
                    <h2 className="font-bold text-gray-900 text-sm sm:text-base">Hourly Sales Distribution</h2>
                  </div>
                </div>
                {dailyReport.hourlyBreakdown.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs sm:text-sm">No hourly sales activity</div>
                ) : (
                  <div className="p-4 sm:p-5 space-y-2.5 overflow-y-auto max-h-[360px]">
                    {dailyReport.hourlyBreakdown.map((h) => (
                      <div key={h.hour} className="flex items-center gap-2.5">
                        <span className="text-xs font-bold text-gray-500 w-14 flex-shrink-0">
                          {formatHour(h.hour)}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(4, (h.revenue / maxHourlyRevenue) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-gray-800 w-16 text-right flex-shrink-0">
                          ₹{h.revenue}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Bills Section — Responsive cards on mobile & table on desktop */}
            {dailyReport.bills.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-brand-500" />
                    <h2 className="font-bold text-gray-900 text-sm sm:text-base">Bills History</h2>
                  </div>
                  <span className="text-xs bg-brand-100 text-brand-800 font-bold px-2.5 py-0.5 rounded-full">
                    {dailyReport.bills.length} bills
                  </span>
                </div>

                {/* Mobile Cards (sm:hidden) */}
                <div className="divide-y divide-gray-100 sm:hidden">
                  {dailyReport.bills.map((bill) => (
                    <div key={bill.id} className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                          {bill.billNumber}
                        </span>
                        <span className="text-base font-black text-gray-900">₹{bill.total}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span className="font-semibold text-gray-800">{bill.customerName}</span>
                        <span className="text-gray-400">
                          {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {bill.customerPhone && bill.customerPhone !== '-' && (
                        <p className="text-[11px] text-gray-400">📞 {bill.customerPhone}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop Table (hidden sm:block) */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50/80 text-left border-b border-gray-100">
                        <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Bill #</th>
                        <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Customer</th>
                        <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Phone</th>
                        <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase">Time</th>
                        <th className="px-5 py-3 text-xs font-bold text-gray-500 uppercase text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dailyReport.bills.map((bill) => (
                        <tr key={bill.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs font-bold text-brand-600">{bill.billNumber}</td>
                          <td className="px-5 py-3 font-semibold text-gray-900">{bill.customerName}</td>
                          <td className="px-5 py-3 text-gray-500">{bill.customerPhone}</td>
                          <td className="px-5 py-3 text-gray-500">
                            {new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="px-5 py-3 text-right font-black text-gray-900">₹{bill.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {dailyReport.bills.length === 0 && !loading && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 py-12 text-center">
                <p className="text-4xl mb-2">🧾</p>
                <p className="font-bold text-gray-700 text-sm sm:text-base">No bills found for {selectedDate}</p>
                <p className="text-xs text-gray-400 mt-1">Select another date or create a new order.</p>
              </div>
            )}
          </>
        )}

        {/* 30-day Performance Overview */}
        {summaryReport && (
          <div className="bg-gradient-to-br from-brand-500 to-orange-600 rounded-2xl sm:rounded-3xl p-5 text-white shadow-lg shadow-brand-500/20">
            <h2 className="text-base sm:text-lg font-black tracking-wide">Last 30 Days Summary</h2>
            <p className="text-white/80 text-xs mt-0.5 mb-4">Store performance across the month</p>
            <div className="grid grid-cols-2 gap-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/75 font-bold">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-black mt-0.5">₹{summaryReport.totalRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-white/75 font-bold">Total Orders</p>
                <p className="text-xl sm:text-2xl font-black mt-0.5">{summaryReport.totalOrders}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl border p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 shadow-sm transition-all ${
        highlight ? 'border-brand-200 ring-2 ring-brand-100' : 'border-gray-200/80'
      }`}
    >
      <div className={`${iconBg} p-2.5 sm:p-3 rounded-2xl flex-shrink-0`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-semibold truncate">{label}</p>
        <p className="text-base sm:text-xl font-black text-gray-900 truncate mt-0.5">{value}</p>
      </div>
    </div>
  );
}
