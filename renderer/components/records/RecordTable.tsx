import { DateTime } from 'luxon';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import { Record, Category, PaymentMethod } from '../../types';

interface RecordTableProps {
  records: Record[];
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onRecordClick: (record: Record) => void;
  period?: 'day' | 'week' | 'month' | 'year' | 'all'; // Added 'all' prop
  showDetail?: boolean;
  netProfit?: number;
  totalIncome?: number;
  totalExpense?: number;
  showFooter?: boolean;
}

export default function RecordTable({
  records,
  categories,
  paymentMethods,
  onRecordClick,
  period = 'day',
  showDetail = false,
  netProfit = 0,
  totalIncome,
  totalExpense,
  showFooter = true
}: RecordTableProps) {
  // If totals aren't provided explicitly, calculate from the records prop (fallback)
  const displayIncome =
    totalIncome !== undefined
      ? totalIncome
      : records.filter(r => r.type === 'income').reduce((s, r) => s + r.amount, 0);

  const displayExpense =
    totalExpense !== undefined
      ? totalExpense
      : records
          .filter(r => r.type === 'purchase' || r.type === 'spending')
          .reduce((s, r) => s + r.amount, 0);

  const displayNetProfit =
    totalIncome !== undefined && totalExpense !== undefined
      ? totalIncome - totalExpense
      : netProfit;

  // Helper function to render rows with grouping headers
  const renderRows = () => {
    if (records.length === 0) {
      return (
        <tr>
          <td colSpan={5}>
            <EmptyState />
          </td>
        </tr>
      );
    }

    if (period === 'day') {
      return records.map(record => (
        <RecordRow
          key={record.id}
          record={record}
          categories={categories}
          paymentMethods={paymentMethods}
          onClick={onRecordClick}
        />
      ));
    }

    // Month or other views: Insert date headers
    const rows: React.ReactNode[] = [];
    let lastDate = '';

    // Sort records by date descending
    const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));

    sortedRecords.forEach(record => {
      const currentDate = record.date.split(' ')[0];
      if (currentDate !== lastDate) {
        // Calculate daily totals for this header
        const dayRecords = sortedRecords.filter(r => r.date.startsWith(currentDate));
        const dayIncome = dayRecords
          .filter(r => r.type === 'income')
          .reduce((s, r) => s + r.amount, 0);
        const dayExpense = dayRecords
          .filter(r => r.type === 'purchase' || r.type === 'spending')
          .reduce((s, r) => s + r.amount, 0);

        rows.push(
          <tr
            key={`header-${currentDate}`}
            className={`transition-all duration-300 ${
              showDetail
                ? 'bg-gray-100/80 dark:bg-gray-800/40'
                : 'bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border-b border-gray-100 dark:border-gray-800'
            }`}>
            <td colSpan={5} className={`px-6 ${showDetail ? 'py-2.5' : 'py-5'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`flex flex-col ${showDetail ? '' : 'gap-0.5'}`}>
                    <span
                      className={`font-black text-gray-900 dark:text-gray-100 flex items-center gap-2 ${
                        showDetail ? 'text-[11px]' : 'text-sm'
                      }`}>
                      {showDetail && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/50"></div>
                      )}
                      {DateTime.fromISO(currentDate)
                        .setLocale('ko')
                        .toFormat(showDetail ? 'M월 d일 (ccc)' : 'yyyy년 M월 d일')}
                    </span>
                    {!showDetail && (
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">
                        {DateTime.fromISO(currentDate).setLocale('ko').toFormat('cccc')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-8 lg:gap-16">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-tight mb-0.5">
                      매출 / 비용
                    </span>
                    <div className="flex gap-4 text-[11px] font-bold">
                      <span className="text-emerald-500">+{dayIncome.toLocaleString()}</span>
                      <span className="text-rose-500">-{dayExpense.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end min-w-[100px]">
                    <span className="text-[9px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-tight mb-0.5">
                      일일 정산 순익
                    </span>
                    <span
                      className={`font-black ${showDetail ? 'text-xs' : 'text-base'} ${
                        dayIncome - dayExpense >= 0 ? 'text-blue-500' : 'text-rose-500'
                      }`}>
                      {dayIncome - dayExpense >= 0 ? '+' : ''}
                      {(dayIncome - dayExpense).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        );
        lastDate = currentDate;
      }

      if (showDetail) {
        rows.push(
          <RecordRow
            key={record.id}
            record={record}
            categories={categories}
            paymentMethods={paymentMethods}
            onClick={onRecordClick}
          />
        );
      }
    });

    return rows;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden shadow-xl animate-in fade-in duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800/30 text-gray-500 dark:text-gray-400 text-[10px] uppercase font-black tracking-[0.1em]">
              <th className="px-6 py-5">날짜 / 시간</th>
              <th className="px-6 py-5">유형</th>
              <th className="px-6 py-5">카테고리</th>
              <th className="px-6 py-5">결제방식</th>
              <th className="px-6 py-5 text-right">금액</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">{renderRows()}</tbody>
          {showFooter && records.length > 0 && (
            <tfoot className="bg-gray-200 dark:bg-gray-800/50 border-t border-gray-300 dark:border-gray-700">
              <tr>
                <td colSpan={3} className="px-6 py-4">
                  <div className="flex gap-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        필터 내 매출
                      </span>
                      <span className="text-sm font-black text-emerald-400">
                        +{displayIncome.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        필터 내 비용
                      </span>
                      <span className="text-sm font-black text-rose-400">
                        -{displayExpense.toLocaleString()}원
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right" colSpan={2}>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                      현재 필터 결과 (순익)
                    </span>
                    <span
                      className={`text-xl font-black ${
                        displayNetProfit >= 0 ? 'text-blue-400' : 'text-rose-400'
                      }`}>
                      {displayNetProfit >= 0 ? '+' : ''}
                      {displayNetProfit.toLocaleString()}원
                    </span>
                  </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

// Sub-component for a single record row
function RecordRow({
  record,
  categories,
  paymentMethods,
  onClick
}: {
  record: Record;
  categories: Category[];
  paymentMethods: PaymentMethod[];
  onClick: (r: Record) => void;
}) {
  return (
    <tr
      onClick={() => onClick(record)}
      className="hover:bg-gray-100 dark:hover:bg-gray-800/20 group transition-all cursor-pointer">
      <td className="px-6 py-4">
        <div className="text-sm font-bold text-gray-700 dark:text-gray-200">
          {record.date.split(' ')[0]}
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5">{record.date.split(' ')[1]}</div>
      </td>
      <td className="px-6 py-4">
        <Badge type={record.type} />
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
        {categories.find(c => c.id === record.category_id)?.name || '미지정'}
      </td>
      <td className="px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-300">
        {(paymentMethods || []).find(pm => pm.id === record.payment_method_id)?.name || '미지정'}
      </td>
      <td
        className={`px-6 py-4 text-right font-black text-sm ${
          record.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
        }`}>
        {record.type === 'income' ? '+' : '-'}
        {record.amount.toLocaleString()}원
      </td>
    </tr>
  );
}
