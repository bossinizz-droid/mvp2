
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Car, 
  Plane, 
  Heart, 
  ChevronRight, 
  Loader2, 
  ExternalLink,
  AlertCircle,
  Zap,
  LayoutGrid,
  Newspaper,
  Sparkles,
  ShoppingBag,
  Wallet,
  ThumbsUp,
  MessageSquareWarning,
  Star,
  Eye,
  Clock,
  Mail,
  X,
  Send,
  User,
  Phone,
  MessageSquare,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  Trophy,
  Medal,
  Award,
  BarChart3,
  TrendingDown,
  Lock,
  Plus,
  Search,
  CheckCircle,
  Trash2,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { UserData, InsuranceType, NewsArticle, TopProduct, InsuranceReview, AnalysisResult, Inquiry } from './types';
import { 
  ResponsiveContainer, 
  Treemap,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

const AGE_GROUPS = [20, 30, 40, 50, 60];
const GENDERS = ['남성', '여성'] as const;

const TREEMAP_COLORS = [
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', 
  '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4',
  '#2dd4bf', '#fb923c', '#fb7185', '#818cf8', '#c084fc'
];

const INQUIRY_TYPES = [
  "신규 가입 상담",
  "기존 보험 분석",
  "보험료 비교 견적",
  "보장 범위 문의",
  "전문가 심층 분석",
  "기타 문의"
];

const YEARLY_SALES_DATA = [
  { year: '2020', '실손의료비': 320000, '어린이보험': 210000, '자동차보험': 540000, '종신보험': 110000, '연금보험': 95000 },
  { year: '2021', '실손의료비': 380000, '어린이보험': 250000, '자동차보험': 560000, '종신보험': 130000, '연금보험': 120000 },
  { year: '2022', '실손의료비': 410000, '어린이보험': 290000, '자동차보험': 580000, '종신보험': 140000, '연금보험': 150000 },
  { year: '2023', '실손의료비': 450000, '어린이보험': 320000, '자동차보험': 600000, '종신보험': 150000, '연금보험': 140000 },
  { year: '2024(E)', '실손의료비': 480000, '어린이보험': 350000, '자동차보험': 620000, '종신보험': 165000, '연금보험': 180000 },
];

const ADMIN_PASSWORD = "gemini";

const App: React.FC = () => {
  const [marketLoading, setMarketLoading] = useState(true);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  
  const [inquiryView, setInquiryView] = useState<'list' | 'create' | 'login' | 'admin'>('list');
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [adminAuth, setAdminAuth] = useState(false);
  const [pwInput, setPwInput] = useState('');

  const [allProducts, setAllProducts] = useState<TopProduct[]>([]);
  const [userData, setUserData] = useState<UserData>({
    age: 30,
    gender: '남성',
    isSmoker: false,
    occupation: '사무직',
    annualIncome: 50000000,
    insuranceType: InsuranceType.HEALTH,
  });

  const [inquiryForm, setInquiryForm] = useState({
    title: '',
    type: INQUIRY_TYPES[0],
    userName: '',
    contact: '',
    content: ''
  });

  useEffect(() => {
    const saved = localStorage.getItem('ds_inquiries');
    if (saved) {
      setInquiries(JSON.parse(saved));
    } else {
      const initial: Inquiry[] = [
        { id: '1', title: '30대 남성 실손보험 견적 문의드립니다.', type: '보험료 비교 견적', userName: '김철수', contact: '010-12**-****', content: '현재 가입된 보험이 없는데 가장 합리적인 실손보험 추천 부탁드립니다.', createdAt: '2024-05-18', status: 'completed', answer: '안녕하세요, DS전문가입니다. 30대 남성분께는 현재 삼성화재 다이렉트 실손이 가장 가성비가 좋습니다.', age: 30, gender: '남성' },
        { id: '2', title: '기존 종신보험 해지 고민 중입니다.', type: '기존 보험 분석', userName: '이영희', contact: '010-98**-****', content: '10년째 납입 중인데 보장 범위가 좁은 것 같아 분석 부탁드려요.', createdAt: '2024-05-19', status: 'pending', age: 40, gender: '여성' }
      ];
      setInquiries(initial);
      localStorage.setItem('ds_inquiries', JSON.stringify(initial));
    }

    setTimeout(() => {
      const products: TopProduct[] = [
        { id: 1, name: "다이렉트 실손의료비", company: "삼성화재", count: 450000, avgPremium: 15400, category: InsuranceType.HEALTH, reason: "안정적인 보상 인프라 및 신속한 청구 프로세스" },
        { id: 2, name: "굿앤굿 어린이종합", company: "현대해상", count: 320000, avgPremium: 42000, category: InsuranceType.HEALTH, reason: "학부모 선호도 1위, 폭넓은 자녀 보장 특약" },
        { id: 3, name: "참좋은 건강보험", company: "DB손보", count: 280000, avgPremium: 55000, category: InsuranceType.HEALTH, reason: "가성비 높은 암/뇌/심장 3대 진단비 구성" },
        { id: 4, name: "무배당 종신플랜", company: "한화생명", count: 150000, avgPremium: 120000, category: InsuranceType.LIFE, reason: "사망 보장 및 상속세 재원 마련에 특화" },
        { id: 5, name: "다이렉트 자동차보험", company: "KB손보", count: 600000, avgPremium: 850000, category: InsuranceType.CAR, reason: "마일리지 할인 및 티맵 안전운전 특약 우수" },
        { id: 6, name: "원데이 자동차", company: "메리츠화재", count: 210000, avgPremium: 5000, category: InsuranceType.CAR, reason: "단기 가입이 필요한 젊은 층에 최적화된 상품" },
        { id: 7, name: "Global 여행보험", company: "AIG", count: 180000, avgPremium: 25000, category: InsuranceType.TRAVEL, reason: "전 세계 긴급 의료 지원 네트워크 보유" },
        { id: 8, name: "평생 연금보험", company: "교보생명", count: 140000, avgPremium: 300000, category: InsuranceType.PENSION, reason: "안정적인 공시이율 및 노후 설계 컨설팅" },
        { id: 9, name: "비갱신 암보험", company: "신한라이프", count: 240000, avgPremium: 35000, category: InsuranceType.HEALTH, reason: "보험료 인상 걱정 없는 합리적인 암 보장" },
        { id: 10, name: "해외여행 안심플랜", company: "카카오페이", count: 290000, avgPremium: 8000, category: InsuranceType.TRAVEL, reason: "카톡 간편 가입 및 미사고 시 환급 혜택" },
        { id: 11, name: "퍼마일 자동차", company: "캐롯손보", count: 310000, avgPremium: 45000, category: InsuranceType.CAR, reason: "주행한 만큼만 내는 혁신적인 과금 체계" },
        { id: 12, name: "인생종합 건강보험", company: "NH농협손보", count: 170000, avgPremium: 48000, category: InsuranceType.HEALTH, reason: "농협 네트워크를 활용한 접근성 및 실속형 보장" },
      ];
      setAllProducts(products);
      setMarketLoading(false);
    }, 600);
  }, []);

  useEffect(() => {
    localStorage.setItem('ds_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  const sortedMarketData = useMemo(() => {
    const filteredByCategory = allProducts.filter(p => p.category === userData.insuranceType);
    return filteredByCategory.map((p, index) => {
      let weight = 1.0;
      if (userData.age <= 20) { if (p.company === "카카오페이" || p.company === "캐롯" || p.name.includes("어린이")) weight *= 1.6; }
      else if (userData.age >= 50) { if (p.company === "삼성화재" || p.company === "교보생명" || p.company === "한화생명") weight *= 1.4; }
      if (userData.gender === '여성') { if (p.name.includes("건강") || p.name.includes("실손")) weight *= 1.2; }
      else { if (p.name.includes("자동차") || p.name.includes("종신")) weight *= 1.2; }
      return { ...p, weightedSize: Math.max(100, Math.round(p.count * weight)), size: p.count, color: TREEMAP_COLORS[index % TREEMAP_COLORS.length] };
    }).sort((a, b) => b.weightedSize - a.weightedSize);
  }, [allProducts, userData.insuranceType, userData.age, userData.gender]);

  const top3Products = useMemo(() => sortedMarketData.slice(0, 3), [sortedMarketData]);

  const dynamicNews = useMemo(() => {
    const { age, gender, insuranceType } = userData;
    const items: NewsArticle[] = [];
    if (insuranceType === InsuranceType.HEALTH) {
      items.push({ title: `[단독] ${age}대 ${gender} 가입자 급증하는 건강보험 특약은?`, source: "금융포커스", url: `https://www.google.com/search?q=${age}대+${gender}+건강보험+인기+특약` });
      items.push({ title: `${age}세 맞춤 건강관리 서비스, 보험 가입만 해도 '무료'`, source: "헬스데일리", url: "https://www.google.com/search?q=보험사+건강관리+서비스" });
      items.push({ title: "실손보험 청구 간소화 서비스, 2030 이용률 압도적 1위", source: "경제투데이", url: "https://www.google.com/search?q=실손보험+청구+간소화" });
    } else if (insuranceType === InsuranceType.CAR) {
      items.push({ title: `[속보] ${age}대 ${gender} 운전자, 보험료 아끼는 '퍼마일' 방식 인기`, source: "모빌리티뉴스", url: "https://www.google.com/search?q=캐롯+퍼마일+자동차보험+후기" });
      items.push({ title: "블랙박스·T맵 점수 할인... 내 차 보험료 얼마나 깎일까?", source: "카리포트", url: "https://www.google.com/search?q=자동차보험+T맵+할인" });
      items.push({ title: `최근 ${age}대 사고 데이터 분석: ${gender === '남성' ? '과속' : '접촉'} 사고 주의보`, source: "안전포럼", url: "https://www.google.com/search?q=연령별+사고+데이터" });
    } else {
      items.push({ title: `[기획] ${age}대 가정을 위한 '가성비' 종신보험 가이드`, source: "금융위클리", url: "https://www.google.com/search?q=가성비+종신보험" });
      items.push({ title: "사망 보장만? No! 상속세 재원 마련용 종신보험 인기", source: "세무저널", url: "https://www.google.com/search?q=종신보험+상속세+활용" });
      items.push({ title: `정기보험 vs 종신보험: ${age}대 ${gender}에게 유리한 선택은?`, source: "보험의정석", url: "https://www.google.com/search?q=정기보험+종신보험+비교" });
    }
    return items;
  }, [userData.age, userData.gender, userData.insuranceType]);

  const reviews = useMemo(() => {
    const positiveReviews: InsuranceReview[] = top3Products.map((p, i) => ({
      id: i,
      productName: p.name,
      userName: `리뷰어_${Math.floor(Math.random() * 9999)}`,
      rating: 5,
      content: `${p.name} 가입했는데 보상 처리가 진짜 빠르네요. 상담사분도 너무 친절하셔서 믿고 추천합니다.`,
      views: 12000 - (i * 2500),
      date: "2024-05-15",
      isPositive: true
    }));

    const negativeReviews: InsuranceReview[] = top3Products.map((p, i) => ({
      id: i + 10,
      productName: p.name,
      userName: `익명_${Math.floor(Math.random() * 9999)}`,
      rating: 2,
      content: `${p.name} 가입 시 고지 의무가 너무 까다롭네요. 나중에 문제 생길까 봐 걱정되긴 합니다. 가입 전 약관 꼭 확인하세요.`,
      views: 1200 - (i * 200),
      date: new Date().toISOString().split('T')[0],
      isPositive: false
    }));

    return { positive: positiveReviews, negative: negativeReviews };
  }, [top3Products]);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newInquiry: Inquiry = {
      id: Date.now().toString(),
      ...inquiryForm,
      createdAt: new Date().toISOString().split('T')[0],
      status: 'pending',
      age: userData.age,
      gender: userData.gender
    };
    setInquiries([newInquiry, ...inquiries]);
    setInquiryView('list');
    setInquiryForm({ title: '', type: INQUIRY_TYPES[0], userName: '', contact: '', content: '' });
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwInput === ADMIN_PASSWORD) {
      setAdminAuth(true);
      setInquiryView('admin');
    } else {
      alert("비밀번호가 틀렸습니다.");
    }
    setPwInput('');
  };

  const handleUpdateStatus = (id: string, answer: string) => {
    setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, status: 'completed', answer } : inq));
  };

  const handleDeleteInquiry = (id: string) => {
    if(confirm("정말 삭제하시겠습니까?")) {
      setInquiries(inquiries.filter(inq => inq.id !== id));
    }
  };

  const CustomizedContent = (props: any) => {
    const { x, y, width, height, name, company, color } = props;
    if (width < 30 || height < 20) return null;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} style={{ fill: color, stroke: '#fff', strokeWidth: 2, strokeOpacity: 0.8 }} />
        {width > 80 && height > 50 && (
          <foreignObject x={x + 4} y={y + 4} width={width - 8} height={height - 8}>
            <div className="flex flex-col items-center justify-center h-full w-full pointer-events-none overflow-hidden space-y-0.5">
              <span className="text-white text-[8px] sm:text-[9px] font-bold opacity-80 truncate w-full text-center uppercase">{company || ''}</span>
              <span className="text-white text-[10px] sm:text-[11px] font-black leading-tight text-center break-keep w-full">{name || ''}</span>
            </div>
          </foreignObject>
        )}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans selection:bg-blue-100 selection:text-blue-900">
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.location.reload()}>
              <ShieldCheck className="w-8 h-8 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">DS보험상담</span>
            </div>
            <div className="flex gap-3 sm:gap-4 items-center">
              <button onClick={() => setShowAnalysisModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-2xl hover:bg-slate-50 transition-all text-xs font-bold shadow-sm">
                <BarChart3 className="w-3.5 h-3.5 text-blue-600" /> 분석 데이터
              </button>
              <button onClick={() => { setShowInquiryModal(true); setInquiryView('list'); }} className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all text-xs font-bold shadow-lg shadow-slate-200">
                <MessageSquare className="w-3.5 h-3.5" /> 1:1 전문가 상담
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <section className="bg-white border border-slate-200 rounded-[2.5rem] p-4 sm:p-2 mb-10 shadow-xl shadow-slate-200/50 animate-fadeIn overflow-hidden">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2">
            <div className="flex flex-col px-4 py-1 min-w-[180px]">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">연령대</span>
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {AGE_GROUPS.map((age) => (
                  <button key={age} onClick={() => setUserData(prev => ({ ...prev, age }))}
                    className={`px-3 py-2 rounded-xl text-[11px] font-black transition-all border ${userData.age === age ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'}`}>
                    {age === 60 ? '60대+' : `${age}대`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col px-4 py-1 border-l border-slate-100 min-w-[140px]">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">성별</span>
              <div className="flex gap-1">
                {GENDERS.map((g) => (
                  <button key={g} onClick={() => setUserData(prev => ({ ...prev, gender: g }))}
                    className={`flex-1 px-4 py-2 rounded-xl text-[11px] font-black transition-all border ${userData.gender === g ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-wrap sm:flex-nowrap gap-1.5 p-1 overflow-x-auto no-scrollbar border-l border-slate-100">
              {[InsuranceType.HEALTH, InsuranceType.LIFE, InsuranceType.CAR, InsuranceType.TRAVEL, InsuranceType.PENSION].map((type) => (
                <button key={type} onClick={() => setUserData(prev => ({ ...prev, insuranceType: type }))}
                  className={`flex-1 min-w-[90px] group flex items-center justify-center gap-2 py-3 px-4 rounded-[1.5rem] transition-all duration-300 ${userData.insuranceType === type ? 'bg-slate-900 text-white shadow-lg scale-[1.02]' : 'bg-transparent text-slate-500 hover:bg-slate-100'}`}>
                  {type === InsuranceType.HEALTH && <Heart className="w-4 h-4" />}
                  {type === InsuranceType.LIFE && <Activity className="w-4 h-4" />}
                  {type === InsuranceType.CAR && <Car className="w-4 h-4" />}
                  {type === InsuranceType.TRAVEL && <Plane className="w-4 h-4" />}
                  {type === InsuranceType.PENSION && <Wallet className="w-4 h-4" />}
                  <span className="text-xs font-bold whitespace-nowrap">{type.replace('보험', '')}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="space-y-12 animate-fadeIn">
          <section className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm overflow-hidden relative">
            <div className="h-96 sm:h-[550px] w-full bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <Treemap data={sortedMarketData.slice(0, 10)} dataKey="weightedSize" content={<CustomizedContent />} animationDuration={1000} />
              </ResponsiveContainer>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {top3Products.map((p, idx) => (
              <div key={p.id} className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-blue-200/40 transition-all hover:-translate-y-2 flex flex-col h-full overflow-hidden">
                <div className={`absolute top-0 right-0 px-6 py-2.5 rounded-bl-[1.5rem] font-black text-xs uppercase tracking-widest ${idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-slate-700' : 'bg-orange-300 text-white'}`}>
                  RANK {idx + 1}
                </div>
                <div className="mt-4">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-500 rounded-lg mb-3 uppercase">{p.company}</span>
                  <h3 className="text-xl font-black text-slate-900 mb-4">{p.name}</h3>
                  <p className="text-[13px] font-medium text-slate-500 leading-relaxed mb-8">{p.reason}</p>
                </div>
                <div className="mt-auto flex flex-col gap-4">
                  <div className="flex justify-between border-t border-slate-50 pt-5">
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-black">월 납입액</span>
                      <span className="text-xl font-black text-blue-600">₩{(p.avgPremium || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <button onClick={() => { setShowInquiryModal(true); setInquiryView('create'); setInquiryForm({...inquiryForm, title: `[상담신청] ${p.name} 문의`})}} className="w-full py-4 bg-slate-50 text-slate-800 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all">상담 신청 <ChevronRight className="w-4 h-4 inline" /></button>
                </div>
              </div>
            ))}
          </section>

          <section className="bg-white border border-slate-200 rounded-[3rem] p-8 shadow-sm">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-8 flex items-center gap-2"><Newspaper className="w-5 h-5" /> 실시간 맞춤 금융 리서치</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {dynamicNews.map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="group p-6 bg-slate-50 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase mb-3 block tracking-wider">{item.source}</span>
                    <p className="text-base font-black text-slate-800 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</p>
                  </div>
                  <div className="flex items-center mt-6 text-[10px] font-black text-blue-500 uppercase tracking-widest">기사 원문 확인 <ChevronRight className="w-3.5 h-3.5 ml-1" /></div>
                </a>
              ))}
            </div>

            <div className="space-y-12">
              <div>
                <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <ThumbsUp className="w-5 h-5" /> 인기 상품 실시간 긍정 리서치
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {reviews.positive.map((review) => (
                    <div key={review.id} className="bg-blue-50/40 rounded-[2rem] p-6 border border-blue-100 flex flex-col hover:bg-white hover:shadow-xl transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black rounded-lg uppercase tracking-tighter">BEST REVIEW</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-blue-500 text-blue-500" />)}
                        </div>
                      </div>
                      <p className="text-sm font-black text-slate-800 mb-2 truncate">{review.productName}</p>
                      <p className="text-[12px] text-slate-600 leading-relaxed mb-6 line-clamp-3 italic">"{review.content}"</p>
                      <div className="mt-auto flex items-center justify-between border-t border-blue-100 pt-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                          <Eye className="w-3.5 h-3.5" /> {review.views.toLocaleString()} VIEW
                        </div>
                        <span className="text-[10px] font-black text-blue-600">{review.userName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-black text-red-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                  <MessageSquareWarning className="w-5 h-5" /> 최근 보험 분석 주의 사항
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {reviews.negative.map((review) => (
                    <div key={review.id} className="bg-red-50/40 rounded-[2rem] p-6 border border-red-100 flex flex-col hover:bg-white hover:shadow-xl transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 bg-red-600 text-white text-[9px] font-black rounded-lg uppercase tracking-tighter">ALERT ANALYSIS</span>
                        <span className="text-[10px] font-bold text-red-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {review.date}
                        </span>
                      </div>
                      <p className="text-sm font-black text-slate-800 mb-2 truncate">{review.productName}</p>
                      <p className="text-[12px] text-slate-600 leading-relaxed mb-6 line-clamp-3 italic">"{review.content}"</p>
                      <div className="mt-auto flex items-center justify-between border-t border-red-100 pt-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                           리스크 평가: <span className="text-red-600 font-black">HIGH</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-500">{review.userName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {showAnalysisModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => setShowAnalysisModal(false)} />
          <div className="relative w-full max-w-5xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden animate-fadeIn border border-white/20">
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">상품별 연도별 누적 판매 추이</h2>
              </div>
              <button onClick={() => setShowAnalysisModal(false)} className="p-3 hover:bg-slate-200 rounded-full transition-all"><X className="w-7 h-7 text-slate-400" /></button>
            </div>
            <div className="p-10">
              <div className="h-[500px] w-full bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-6 shadow-inner">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={YEARLY_SALES_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${(value / 10000).toLocaleString()}만`} />
                    <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} contentStyle={{ borderRadius: '24px', border: 'none' }} />
                    <Legend verticalAlign="top" align="right" iconType="circle" />
                    <Bar dataKey="실손의료비" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="어린이보험" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="자동차보험" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="종신보험" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="연금보험" fill="#ec4899" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInquiryModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl" onClick={() => setShowInquiryModal(false)} />
          <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-fadeIn border border-white/20 h-[80vh] flex flex-col">
            <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 rounded-2xl"><MessageSquare className="w-6 h-6 text-white" /></div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">전문가 상담 게시판</h2>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">실시간으로 전문가의 보장 분석 답변을 확인하세요.</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {inquiryView === 'list' && (
                  <button onClick={() => setInquiryView('login')} className="p-2.5 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"><Settings className="w-5 h-5 text-slate-600" /></button>
                )}
                <button onClick={() => setShowInquiryModal(false)} className="p-3 hover:bg-slate-200 rounded-full transition-all"><X className="w-7 h-7 text-slate-400" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-white no-scrollbar">
              {inquiryView === 'list' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="문의 제목 검색" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-100" />
                    </div>
                    <button onClick={() => setInquiryView('create')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                      <Plus className="w-4 h-4" /> 상담 신청하기
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {inquiries.map((inq) => (
                      <div key={inq.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all cursor-pointer group">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${inq.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{inq.status === 'completed' ? '답변완료' : '검토중'}</span>
                              <span className="text-[10px] font-bold text-slate-400">{inq.type}</span>
                            </div>
                            <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors">{inq.title}</h3>
                            {inq.answer && (
                              <div className="mt-4 p-4 bg-white border border-blue-50 rounded-2xl flex gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg h-fit"><ShieldCheck className="w-4 h-4 text-blue-600" /></div>
                                <div><span className="text-[10px] font-black text-blue-600 uppercase mb-1 block">전문가 답변</span><p className="text-xs text-slate-700 font-medium leading-relaxed">{inq.answer}</p></div>
                              </div>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-black text-slate-800">{inq.userName}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{inq.createdAt}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inquiryView === 'create' && (
                <div className="max-w-2xl mx-auto py-4">
                  <button onClick={() => setInquiryView('list')} className="flex items-center gap-2 text-xs font-black text-slate-400 mb-8 hover:text-slate-600 transition-all uppercase tracking-widest"><ArrowLeft className="w-4 h-4" /> 목록으로 돌아가기</button>
                  <form onSubmit={handleInquirySubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">작성자</label><input required type="text" value={inquiryForm.userName} onChange={(e) => setInquiryForm({...inquiryForm, userName: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="이름을 입력하세요" /></div>
                      <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">연락처</label><input required type="text" value={inquiryForm.contact} onChange={(e) => setInquiryForm({...inquiryForm, contact: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="전화번호 또는 이메일" /></div>
                    </div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">문의 제목</label><input required type="text" value={inquiryForm.title} onChange={(e) => setInquiryForm({...inquiryForm, title: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-100" placeholder="상담 받고 싶은 주제" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">상세 내용</label><textarea required rows={5} value={inquiryForm.content} onChange={(e) => setInquiryForm({...inquiryForm, content: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] outline-none focus:ring-2 focus:ring-blue-100 resize-none" placeholder="내용을 자세히 적어주세요"></textarea></div>
                    <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-100">상담 신청 등록하기</button>
                  </form>
                </div>
              )}

              {inquiryView === 'login' && (
                <div className="max-w-sm mx-auto py-20">
                  <div className="text-center mb-10"><div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-4"><Lock className="w-8 h-8 text-white" /></div><h2 className="text-xl font-black text-slate-900">관리자 인증</h2><p className="text-xs text-slate-400 mt-1 font-bold">상담 관리를 위해 패스워드를 입력하세요.</p></div>
                  <form onSubmit={handleAdminLogin} className="space-y-4"><input autoFocus type="password" value={pwInput} onChange={(e) => setPwInput(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-center font-black tracking-widest" placeholder="PASSWORD" /><button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm">인증하기</button><button type="button" onClick={() => setInquiryView('list')} className="w-full py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600">취소</button></form>
                </div>
              )}

              {inquiryView === 'admin' && adminAuth && (
                <div className="space-y-8">
                  <div className="flex items-center justify-between mb-8"><h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Settings className="w-5 h-5 text-blue-600" /> 관리 대시보드</h2><button onClick={() => { setAdminAuth(false); setInquiryView('list'); }} className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-red-500">로그아웃</button></div>
                  <div className="space-y-4">
                    {inquiries.map(inq => (
                      <div key={inq.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-10">
                            <div className="flex items-center gap-3 mb-2"><span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${inq.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{inq.status === 'completed' ? '답변완료' : '검토중'}</span><span className="text-[10px] font-bold text-slate-400">{inq.type} | {inq.userName}({inq.age}대/{inq.gender})</span></div>
                            <h3 className="text-base font-black text-slate-900 mb-2">{inq.title}</h3>
                            <p className="text-xs text-slate-600 mb-6 bg-white p-4 rounded-2xl border border-slate-50">{inq.content}</p>
                            {inq.status === 'pending' ? (
                              <div className="space-y-2"><textarea id={`ans-${inq.id}`} rows={3} className="w-full px-5 py-4 bg-white border border-slate-100 rounded-2xl outline-none text-xs focus:ring-2 focus:ring-blue-100" placeholder="내용을 입력하세요"></textarea><button onClick={() => { const area = document.getElementById(`ans-${inq.id}`) as HTMLTextAreaElement; if(area.value) handleUpdateStatus(inq.id, area.value); }} className="px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest">답변 등록</button></div>
                            ) : (
                              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100"><p className="text-xs text-slate-700">{inq.answer}</p></div>
                            )}
                          </div>
                          <button onClick={() => handleDeleteInquiry(inq.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <footer className="mt-20 py-20 border-t border-slate-200 bg-white text-center">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-center gap-2 mb-8 opacity-40"><ShieldCheck className="w-6 h-6 text-blue-600" /><span className="text-xl font-black text-slate-600 tracking-tighter">DS보험상담 Premium Analysis</span></div>
          <p className="text-[11px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest max-w-2xl mx-auto">본 서비스는 스마트 분석 엔진을 통해 제공되는 금융 시뮬레이션입니다. <br/> 실제 가입 의사 결정 전 반드시 각 보험사에서 제공하는 상품 상세 약관 및 공시 자료를 전문가와 함께 검토하시기 바랍니다.</p>
          <div className="mt-12 text-[10px] font-black text-slate-300 tracking-[0.4em] uppercase">© 2024 DS INSURANCE CONSULTING GROUP. ALL RIGHTS RESERVED.</div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        select { -webkit-appearance: none; -moz-appearance: none; appearance: none; }
      `}</style>
    </div>
  );
};

export default App;
