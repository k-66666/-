import { Question, QuestionType } from '../types';

export const SEED_QUESTIONS: Question[] = [
  // --- 绪论 & 科学技术概论 ---
  {
    id: 'intro_1',
    type: QuestionType.CHOICE,
    content: '自然辩证法最早理论体系来源于？',
    options: ['马克思《资本论》', '恩格斯《自然辩证法》', '黑格尔《小逻辑》', '达尔文《进化论》'],
    correctAnswer: '恩格斯《自然辩证法》',
    mnemonic: '恩自 (恩格斯-自然辩证法)',
    tags: ['绪论', '重点']
  },
  {
    id: 'intro_2',
    type: QuestionType.CHOICE,
    content: '自然辩证法的学科性质是？',
    options: ['纯粹哲学学科', '纯粹自然科学', '马克思主义哲学的重要组成部分，连接哲学与科学的桥梁', '社会科学'],
    correctAnswer: '马克思主义哲学的重要组成部分，连接哲学与科学的桥梁',
    mnemonic: '马哲组成，哲科桥梁',
    tags: ['绪论']
  },
  {
    id: 'intro_3',
    type: QuestionType.CHOICE,
    content: '自然辩证法产生的部分学科基础包括？',
    options: ['相对论与量子力学', '达尔文进化论与能量守恒定律', '控制论与信息论', '几何学与代数'],
    correctAnswer: '达尔文进化论与能量守恒定律',
    mnemonic: '达进能守 (19世纪三大发现)',
    tags: ['绪论']
  },

  // --- 自然观 (系统、演化、人与自然) ---
  {
    id: 'nature_1',
    type: QuestionType.CHOICE,
    content: '系统非加和性的实质是？',
    options: ['整体等于部分之和', '整体性质和功能不等于部分性质和功能的简单叠加', '部分决定整体', '整体是可以分割的'],
    correctAnswer: '整体性质和功能不等于部分性质和功能的简单叠加',
    mnemonic: '1+1≠2 (整体涌现性)',
    tags: ['系统论', '重点']
  },
  {
    id: 'nature_2',
    type: QuestionType.JUDGE,
    content: '作为系统的物质整体，其根本属性是加和性。',
    correctAnswer: false,
    mnemonic: '根本属性是“非加和性” (整体大于部分之和)',
    tags: ['系统论']
  },
  {
    id: 'nature_3',
    type: QuestionType.CHOICE,
    content: '研究系统演化的“时间箭头”揭示了什么？',
    options: ['时间的循环性', '时间的可逆性', '自然演化过程的不可逆性', '时间的相对性'],
    correctAnswer: '自然演化过程的不可逆性',
    mnemonic: '光阴一去不复返 (不可逆)',
    tags: ['系统演化']
  },
  {
    id: 'nature_4',
    type: QuestionType.CHOICE,
    content: '按照自组织理论，一个系统进入有序状态的条件是？',
    options: ['封闭系统、平衡态', '开放系统、远离平衡态、非线性相互作用、涨落', '孤立系统、线性作用', '恒温恒压'],
    correctAnswer: '开放系统、远离平衡态、非线性相互作用、涨落',
    mnemonic: '开远非涨 (开放/远离平衡/非线性/涨落)',
    tags: ['自组织', '难点']
  },
  {
    id: 'nature_5',
    type: QuestionType.JUDGE,
    content: '机械自然观的根本缺陷是把运动的原因归结为外力的作用。',
    correctAnswer: true,
    mnemonic: '机械=外力推动 (上帝的第一推动力)',
    tags: ['自然观历史']
  },
  {
    id: 'nature_6',
    type: QuestionType.JUDGE,
    content: '演化的概念只包含进化，不包含退化。',
    correctAnswer: false,
    mnemonic: '演化 = 进化 + 退化 (二者并存)',
    tags: ['系统演化']
  },
  {
    id: 'nature_7',
    type: QuestionType.CHOICE,
    content: '人工自然和天然自然的关系是？',
    options: ['完全对立', '毫无关联', '对立统一，人工自然源于天然自然', '人工自然优于天然自然'],
    correctAnswer: '对立统一，人工自然源于天然自然',
    mnemonic: '源于天然，高于天然，对立统一',
    tags: ['人工自然']
  },
  {
    id: 'nature_8',
    type: QuestionType.JUDGE,
    content: '人工自然既具有自然属性，又具有社会属性。',
    correctAnswer: true,
    mnemonic: '人工=自然材质+社会用途',
    tags: ['人工自然']
  },
  {
    id: 'nature_9',
    type: QuestionType.CHOICE,
    content: '“牧场悖论” (公地悲剧) 的实质是？',
    options: ['环境污染', '技术落后', '个体利益与集体利益的矛盾', '人口过剩'],
    correctAnswer: '个体利益与集体利益的矛盾',
    mnemonic: '个人多养羊，集体草吃光',
    tags: ['可持续发展']
  },

  // --- 科学观 (科学划界、发展模式、认识论) ---
  {
    id: 'sci_1',
    type: QuestionType.CHOICE,
    content: '科学划界的标准主要包括？',
    options: ['主观性、模糊性', '可观察性、可控制性、可检验性、可重复性', '权威性、历史性', '不可证伪性'],
    correctAnswer: '可观察性、可控制性、可检验性、可重复性',
    mnemonic: '观控检重 (四性)',
    tags: ['科学划界', '重点']
  },
  {
    id: 'sci_2',
    type: QuestionType.JUDGE,
    content: '伪科学的共同点是把假说当真理，把非科学伪装成科学。',
    correctAnswer: true,
    mnemonic: '伪科学 = 披着科学外衣的迷信',
    tags: ['科学划界']
  },
  {
    id: 'sci_3',
    type: QuestionType.CHOICE,
    content: '波普尔提出的科学发展模式是？',
    options: ['范式-危机-革命', 'P1-TT-EE-P2 (猜想与反驳)', '硬核-保护带', '归纳-演绎'],
    correctAnswer: 'P1-TT-EE-P2 (猜想与反驳)',
    mnemonic: '波普尔 = 猜想反驳 (P-TT-EE-P)',
    tags: ['科学发展模式']
  },
  {
    id: 'sci_4',
    type: QuestionType.CHOICE,
    content: '库恩提出的科学发展模式的核心概念是？',
    options: ['证伪', '范式 (Paradigm)', '科学纲领', '无政府主义'],
    correctAnswer: '范式 (Paradigm)',
    mnemonic: '库恩范式 (常规科学-危机-革命)',
    tags: ['科学发展模式']
  },
  {
    id: 'sci_5',
    type: QuestionType.CHOICE,
    content: '拉卡托斯的科学研究纲领包括哪两个部分？',
    options: ['内核与外壳', '硬核与保护带', '理论与实践', '公理与定理'],
    correctAnswer: '硬核与保护带',
    mnemonic: '拉卡托斯 = 硬核不可动 + 保护带可变',
    tags: ['科学发展模式']
  },
  {
    id: 'sci_6',
    type: QuestionType.JUDGE,
    content: '“科学渗透理论”是指纯客观的观察是不存在的，观察中总渗透着理论。',
    correctAnswer: true,
    mnemonic: '观察依赖理论 (戴着有色眼镜看世界)',
    tags: ['科学认识论']
  },
  {
    id: 'sci_7',
    type: QuestionType.JUDGE,
    content: '相对论的创立表明时间空间与物质及其运动状态是可以分离的。',
    correctAnswer: false,
    mnemonic: '相对论 = 时空物运密不可分',
    tags: ['物理哲学']
  },
  {
    id: 'sci_8',
    type: QuestionType.JUDGE,
    content: '微分为无穷小量，其哲学意义是微分的零与非零的统一。',
    correctAnswer: true,
    mnemonic: '零与非零的关节点',
    tags: ['数学哲学']
  },
  {
    id: 'sci_9',
    type: QuestionType.JUDGE,
    content: '科学理论的进步表现为一个不断的渐进过程 (只量变)。',
    correctAnswer: false,
    mnemonic: '进步 = 渐进(量变) + 飞跃(质变) 的统一',
    tags: ['科学发展']
  },

  // --- 技术观 (科技关系、生产力) ---
  {
    id: 'tech_1',
    type: QuestionType.CHOICE,
    content: '关于科学与技术的关系，下列说法正确的是？',
    options: ['科学是直接生产力', '技术是潜在生产力', '科学回答“是什么/为什么”，技术回答“做什么/怎么做”', '二者没有区别'],
    correctAnswer: '科学回答“是什么/为什么”，技术回答“做什么/怎么做”',
    mnemonic: '科懂原理(Why)，技重操作(How)',
    tags: ['科技关系']
  },
  {
    id: 'tech_2',
    type: QuestionType.CHOICE,
    content: '科学技术是第一生产力，其中科学通常表现为？',
    options: ['直接生产力', '潜在生产力 (知识形态)', '现实生产力', '物质生产力'],
    correctAnswer: '潜在生产力 (知识形态)',
    mnemonic: '科潜技直 (科学潜在，技术直接)',
    tags: ['生产力', '重点']
  },
  {
    id: 'tech_3',
    type: QuestionType.JUDGE,
    content: '技术本身是中性的，但被何种主体所用则带有功利性和目的性。',
    correctAnswer: true,
    mnemonic: '技术中性，人用则偏',
    tags: ['技术伦理']
  },
  {
    id: 'tech_4',
    type: QuestionType.CHOICE,
    content: '星野芳郎提出的三次技术更迭中，第三次技术体系的主导技术是？',
    options: ['蒸汽机', '电力与内燃机', '原子能、计算机、空间技术 (微电子)', '生物技术'],
    correctAnswer: '原子能、计算机、空间技术 (微电子)',
    mnemonic: '一汽二电三核电 (蒸汽-电力-核/电)',
    tags: ['技术史']
  },

  // --- 方法论 (归纳演绎、模型、创新) ---
  {
    id: 'method_1',
    type: QuestionType.JUDGE,
    content: '“方法无用论”是经验主义，“方法万能论”是教条主义。',
    correctAnswer: true,
    mnemonic: '无用靠经验(瞎猫死耗子)，万能是教条(死板)',
    tags: ['方法论']
  },
  {
    id: 'method_2',
    type: QuestionType.CHOICE,
    content: '从个别到一般的推理方法是？',
    options: ['演绎法', '归纳法', '类比法', '直觉法'],
    correctAnswer: '归纳法',
    mnemonic: '归纳 = 个别 -> 一般 (收集个性)',
    tags: ['逻辑方法']
  },
  {
    id: 'method_3',
    type: QuestionType.CHOICE,
    content: '从一般到个别的推理方法是？',
    options: ['演绎法', '归纳法', '类比法', '移植法'],
    correctAnswer: '演绎法',
    mnemonic: '演绎 = 一般 -> 个别 (大前提推小结论)',
    tags: ['逻辑方法']
  },
  {
    id: 'method_4',
    type: QuestionType.JUDGE,
    content: '归纳方法的局限性在于结论往往超出前提范围，具有或然性。',
    correctAnswer: true,
    mnemonic: '归纳不保真 (黑天鹅事件)',
    tags: ['逻辑方法']
  },
  {
    id: 'method_5',
    type: QuestionType.CHOICE,
    content: '穆勒五法 (求同、求异等) 属于哪种逻辑方法？',
    options: ['演绎推理', '归纳推理', '类比推理', '直觉思维'],
    correctAnswer: '归纳推理',
    mnemonic: '穆勒五法探因果，属于归纳',
    tags: ['逻辑方法']
  },
  {
    id: 'method_6',
    type: QuestionType.CHOICE,
    content: '把适用于一个对象的概念、原理或方法用于另一个对象，从而获得突破的方法是？',
    options: ['归纳法', '类比移植法', '数学建模', '黑箱方法'],
    correctAnswer: '类比移植法',
    mnemonic: '他山之石，可以攻玉 (移植)',
    tags: ['创新方法']
  },
  {
    id: 'method_7',
    type: QuestionType.CHOICE,
    content: '公理体系需要满足的三个条件是？',
    options: ['复杂性、多样性、模糊性', '无矛盾性(一致性)、独立性、完备性', '主观性、客观性、能动性', '真理性、价值性、实践性'],
    correctAnswer: '无矛盾性(一致性)、独立性、完备性',
    mnemonic: '独完无 (独顽舞 - 独立/完备/无矛盾)',
    tags: ['数学方法']
  },
  {
    id: 'method_8',
    type: QuestionType.JUDGE,
    content: '数学模型方法本质上是一种逻辑分析方法。',
    correctAnswer: false,
    mnemonic: '数学模型是“形式化”和“定量化”的抽象，不仅是逻辑',
    tags: ['数学方法']
  },
  {
    id: 'method_9',
    type: QuestionType.JUDGE,
    content: '逆向思维的哲学依据是辩证法的对立统一规律。',
    correctAnswer: true,
    mnemonic: '逆向 = 看到对立面',
    tags: ['创新思维']
  },
  
  // --- 其他高频考点 ---
  {
    id: 'misc_1',
    type: QuestionType.JUDGE,
    content: '量子力学中的“月亮问题”讨论的是微观客体是否具有不依赖于主体的客观实在性。',
    correctAnswer: true,
    mnemonic: '月亮在看它时才存在吗？(客观性问题)',
    tags: ['量子力学']
  },
  {
    id: 'misc_2',
    type: QuestionType.CHOICE,
    content: '科学共同体必须遵守的范式不包括？',
    options: ['共同的世界观', '共同的仪器设备', '共同的薪资标准', '共同的方法论'],
    correctAnswer: '共同的薪资标准',
    mnemonic: '范式是学术的，不是发工资的',
    tags: ['科学社会学']
  },
  {
    id: 'misc_3',
    type: QuestionType.JUDGE,
    content: '可持续发展不仅要满足当代人的需求，还要不损害后代人满足其需求的能力。',
    correctAnswer: true,
    mnemonic: '代际公平 (管现在也要管未来)',
    tags: ['可持续发展']
  }
];