'use client';

import React from 'react';
import { BarChart3, PieChart, TrendingUp, MousePointer2, ToggleLeft, Calendar } from 'lucide-react';
import Card from '../ui/Card';

export default function AnalysisGuide() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3 border-l-4 border-blue-500 pl-4">
        <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
          03. 분석 기능 활용하기
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="주간/월간 전환" icon={<Calendar size={20} className="text-blue-500" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            분석 페이지 상단의 <strong className="text-gray-900 dark:text-white">주간/월간</strong>{' '}
            토글로 분석 기간을 선택하세요. 주간 분석은 빠른 흐름 파악에, 월간 분석은 장기 트렌드
            확인에 유용합니다. 좌우 화살표로 이전/다음 기간으로 이동할 수 있습니다.
          </p>
        </Card>

        <Card title="종합 손익 분석" icon={<BarChart3 size={20} className="text-emerald-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong className="text-gray-900 dark:text-white">종합</strong> 탭에서 핵심 지표를
              확인하세요:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>
                <strong className="text-blue-500">총 매출</strong>: 해당 기간의 모든 수입
              </li>
              <li>
                <strong className="text-rose-500">총 비용</strong>: 매입과 지출의 합계
              </li>
              <li>
                <strong className="text-emerald-500">순이익</strong>: 매출 - 비용 (가장 중요!)
              </li>
            </ul>
            <p className="text-xs text-gray-500 leading-relaxed">
              손익 비교 바 차트로 세 가지 지표를 한눈에 비교하고, 기간별 통계 추이 차트로 지난
              6주/개월의 흐름을 파악하세요.
            </p>
          </div>
        </Card>

        <Card title="매출 분석" icon={<PieChart size={20} className="text-indigo-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <strong className="text-gray-900 dark:text-white">매출</strong> 탭에서 수익원을
              파악하세요:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>
                <strong>카테고리별 매출 비중</strong>: 어떤 서비스가 돈을 버는지
              </li>
              <li>
                <strong>시간대별 매출 현황</strong>: 언제 손님이 가장 많은지
              </li>
              <li>
                <strong>매출 상세 리포트</strong>: 각 항목의 비중(%)과 전월 대비 증감
              </li>
            </ul>
          </div>
        </Card>

        <Card title="비용 분석" icon={<PieChart size={20} className="text-amber-500" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            <strong className="text-gray-900 dark:text-white">비용</strong> 탭에서 지출을
            관리하세요. 비용 비중(매입 vs 지출), 매입 카테고리 비중, 지출 카테고리 비중을 3개의 도넛
            그래프로 시각화합니다. 어디에 돈이 가장 많이 나가는지 명확하게 파악할 수 있습니다.
          </p>
        </Card>

        <Card title="대화형 추이 차트" icon={<ToggleLeft size={20} className="text-rose-500" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            종합 분석의 통계 추이 차트에서 <strong className="text-blue-500">[매출]</strong>,{' '}
            <strong className="text-rose-500">[비용]</strong>,{' '}
            <strong className="text-emerald-500">[순이익]</strong> 버튼을 클릭하여 보고 싶은 데이터
            라인만 선택적으로 표시할 수 있습니다. 복잡한 차트를 단순화하여 원하는 정보만 집중해서 볼
            수 있습니다.
          </p>
        </Card>

        <Card title="프리미엄 툴팁" icon={<MousePointer2 size={20} className="text-blue-500" />}>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            모든 그래프 위에 마우스를 올리면{' '}
            <strong className="text-gray-900 dark:text-white">고해상도 툴팁</strong>이 나타납니다.
            정확한 날짜, 금액, 항목명을 시각적으로 방해받지 않고 선명하게 확인할 수 있어 데이터
            분석이 훨씬 즐겁고 정확해집니다.
          </p>
        </Card>

        <Card title="분석 활용 팁" icon={<TrendingUp size={20} className="text-emerald-500" />}>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              분석 기능을 최대한 활용하는 방법:
            </p>
            <ul className="text-xs text-gray-500 space-y-1.5 ml-4 list-disc leading-relaxed">
              <li>매주 주간 분석으로 빠른 피드백</li>
              <li>매월 말 월간 분석으로 성과 점검</li>
              <li>비용 분석에서 불필요한 지출 찾기</li>
              <li>시간대별 매출로 운영 시간 최적화</li>
              <li>추이 차트로 성장세 확인</li>
            </ul>
          </div>
        </Card>
      </div>
    </section>
  );
}
