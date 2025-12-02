import { Question, QuestionType } from '../types';

export const SEED_QUESTIONS: Question[] = [
  // --- 选择题 (1-18) ---
  {
    id: 'choice_1',
    type: QuestionType.CHOICE,
    content: '自然辩证法最早理论体系来源于？',
    options: ['马克思《资本论》', '恩格斯《自然辩证法》', '黑格尔《小逻辑》', '达尔文《进化论》'],
    correctAnswer: '恩格斯《自然辩证法》',
    mnemonic: '恩自 (恩格斯-自然辩证法)',
    tags: ['绪论']
  },
  {
    id: 'choice_2',
    type: QuestionType.CHOICE,
    content: '数理方程中许多不同形态的物理运动规律可以用同一个方程来描述，这表明？',
    options: ['物理规律的偶然性', '物质及其运动规律的一定同一性', '数学的巧合', '运动形式的单一性'],
    correctAnswer: '物质及其运动规律的一定同一性',
    mnemonic: '方程同，规律同 (同一性)',
    tags: ['物理哲学']
  },
  {
    id: 'choice_3',
    type: QuestionType.CHOICE,
    content: '微分作为无穷小量，其哲学意义是？',
    options: ['纯粹的数学技巧', '微分的零与非零的统一，代表质变的关节点', '绝对的零', '不可知的量'],
    correctAnswer: '微分的零与非零的统一，代表质变的关节点',
    mnemonic: '零与非零，关节点',
    tags: ['数学哲学']
  },
  {
    id: 'choice_4',
    type: QuestionType.CHOICE,
    content: '相对论的创立表明？',
    options: ['时间空间与物质及其运动状态密不可分', '时间是绝对的', '空间是静止的', '物质与运动无关'],
    correctAnswer: '时间空间与物质及其运动状态密不可分',
    mnemonic: '相对论=时空物运不分家',
    tags: ['物理哲学']
  },
  {
    id: 'choice_5',
    type: QuestionType.CHOICE,
    content: '量子力学的创立表明？',
    options: ['经典因果律的胜利', '昭示了一种不同于牛顿力学性质的新的因果观和规律观', '微观世界无规律', '上帝掷骰子'],
    correctAnswer: '昭示了一种不同于牛顿力学性质的新的因果观和规律观',
    mnemonic: '量子=新因果 (非牛顿)',
    tags: ['物理哲学']
  },
  {
    id: 'choice_6',
    type: QuestionType.CHOICE,
    content: '科学划界的标准主要包括？',
    options: ['主观性、模糊性', '可观察性、可控制性、可检验性、可重复性', '权威性、历史性', '不可证伪性'],
    correctAnswer: '可观察性、可控制性、可检验性、可重复性',
    mnemonic: '观控检重 (四性)',
    tags: ['科学观']
  },
  {
    id: 'choice_7',
    type: QuestionType.CHOICE,
    content: '非欧几何的创立表明？',
    options: ['欧式几何是错误的', '欧式几何所描述的空间形式只是自然界多种空间形式的一种', '空间只有一种形式', '几何学没有意义'],
    correctAnswer: '欧式几何所描述的空间形式只是自然界多种空间形式的一种',
    mnemonic: '欧几只是之一 (多种空间)',
    tags: ['数学哲学']
  },
  {
    id: 'choice_8',
    type: QuestionType.CHOICE,
    content: '量子力学讨论中的“月亮问题”实质是？',
    options: ['月亮是否存在', '微观客体的本来面目是否可知、对离开主体的客观事物的认识是否可能', '月亮的引力作用', '观测仪器的精度'],
    correctAnswer: '微观客体的本来面目是否可知、对离开主体的客观事物的认识是否可能',
    mnemonic: '月亮在看它时才存在吗？(客观性)',
    tags: ['物理哲学']
  },
  {
    id: 'choice_9',
    type: QuestionType.CHOICE,
    content: '系统非加和性的实质是？',
    options: ['整体等于部分之和', '整体性质和功能不等于部分性质和功能的简单叠加', '部分决定整体', '整体是可以分割的'],
    correctAnswer: '整体性质和功能不等于部分性质和功能的简单叠加',
    mnemonic: '1+1≠2 (整体涌现性)',
    tags: ['系统论']
  },
  {
    id: 'choice_10',
    type: QuestionType.CHOICE,
    content: '研究系统演化的“时间箭头”实质是？',
    options: ['它代表真实的自然演化过程具有不可逆性', '时间的循环', '物理错觉', '可逆过程'],
    correctAnswer: '它代表真实的自然演化过程具有不可逆性',
    mnemonic: '箭头=不可逆',
    tags: ['系统演化']
  },
  // 11 is duplicate of 4 (Relativity) in original text, skipped or treated as reinforcement.
  {
    id: 'choice_12',
    type: QuestionType.CHOICE,
    content: '自然辩证法的学科性质是？',
    options: ['纯粹哲学', '纯粹科学', '马克思主义哲学的一个组成部分、连接马哲与科技的中介和桥梁', '社会学'],
    correctAnswer: '马克思主义哲学的一个组成部分、连接马哲与科技的中介和桥梁',
    mnemonic: '马哲组成，哲科桥梁',
    tags: ['绪论']
  },
  {
    id: 'choice_13',
    type: QuestionType.CHOICE,
    content: '自然辩证法产生的部分学科基础是？',
    options: ['相对论', '达尔文进化论、能量守恒定律', '控制论', '大爆炸理论'],
    correctAnswer: '达尔文进化论、能量守恒定律',
    mnemonic: '达进能守 (19世纪)',
    tags: ['绪论']
  },
  {
    id: 'choice_14',
    type: QuestionType.CHOICE,
    content: '科学技术的一般性质是？',
    options: ['有阶级性', '无阶级性、一般意义上的生产力', '政治性', '局限性'],
    correctAnswer: '无阶级性、一般意义上的生产力',
    mnemonic: '科技无阶级，是生产力',
    tags: ['科技观']
  },
  {
    id: 'choice_15',
    type: QuestionType.CHOICE,
    content: '可持续发展观是为了？',
    options: ['解决人与自然的对立和矛盾', '限制经济发展', '回归原始社会', '单纯保护环境'],
    correctAnswer: '解决人与自然的对立和矛盾',
    mnemonic: '和解人与自然',
    tags: ['可持续发展']
  },
  {
    id: 'choice_16',
    type: QuestionType.CHOICE,
    content: '结构型数学是？',
    options: ['研究数值计算', '研究数学结构及其关系的科学', '代数学', '几何学'],
    correctAnswer: '研究数学结构及其关系的科学',
    mnemonic: '结构型研究结构',
    tags: ['数学哲学']
  },
  {
    id: 'choice_17',
    type: QuestionType.CHOICE,
    content: '科学与非科学的区别是？',
    options: ['前者不可检验', '前者可检验、前者满足可重复性', '后者更正确', '没有区别'],
    correctAnswer: '前者可检验、前者满足可重复性',
    mnemonic: '科学=可检验+可重复',
    tags: ['科学划界']
  },
  {
    id: 'choice_18',
    type: QuestionType.CHOICE,
    content: '系统的整体性原理是指？',
    options: ['整体等于部分和', '整体的性质和功能不等于部分和', '整体包含部分', '部分优于整体'],
    correctAnswer: '整体的性质和功能不等于部分和',
    mnemonic: '整体≠部分和',
    tags: ['系统论']
  },

  // --- 判断题 (1-32) ---
  {
    id: 'judge_1',
    type: QuestionType.JUDGE,
    content: '任何物质系统的整体与部分的关系都是加和性与非加和性的统一。',
    correctAnswer: true,
    mnemonic: '既有加和(如质量)，也有非加和(如功能)',
    tags: ['系统论']
  },
  {
    id: 'judge_2',
    type: QuestionType.JUDGE,
    content: '作为系统的物质整体，其根本属性是加和性。',
    correctAnswer: false,
    mnemonic: '根本属性是“非加和性” (整体涌现)',
    tags: ['系统论']
  },
  {
    id: 'judge_3',
    type: QuestionType.JUDGE,
    content: '光速c、普朗克常量h是标志不同层次物质运动转化的关节点。',
    correctAnswer: true,
    mnemonic: 'c分高速低速，h分宏观微观',
    tags: ['物理哲学']
  },
  {
    id: 'judge_4',
    type: QuestionType.JUDGE,
    content: '自组织理论表明，偶然性在进化中起决定作用。',
    correctAnswer: false,
    mnemonic: '偶然性只在“远离平衡态”时才起决定作用',
    tags: ['自组织']
  },
  {
    id: 'judge_5',
    type: QuestionType.JUDGE,
    content: '科学和非科学的区别在于前者使用人工语言，后者使用自然语言。',
    correctAnswer: false,
    mnemonic: '区别在于“可检验、可重复”等，不是语言',
    tags: ['科学划界']
  },
  {
    id: 'judge_6',
    type: QuestionType.JUDGE,
    content: '“方法无用论”是经验主义，“方法万能论”是教条主义。',
    correctAnswer: true,
    mnemonic: '无用=经验，万能=教条',
    tags: ['方法论']
  },
  {
    id: 'judge_7',
    type: QuestionType.JUDGE,
    content: '数学方法是一种单纯的逻辑分析方法。',
    correctAnswer: false,
    mnemonic: '数学不仅需要逻辑，还需要内容',
    tags: ['数学方法']
  },
  {
    id: 'judge_8',
    type: QuestionType.JUDGE,
    content: '科学理论的进步表现为一个不断的渐进过程。',
    correctAnswer: false,
    mnemonic: '进步=渐进(量变)+飞跃(质变)',
    tags: ['科学发展']
  },
  {
    id: 'judge_9',
    type: QuestionType.JUDGE,
    content: '技术本身是中性的，被何主体所用则带有功利性。',
    correctAnswer: true,
    mnemonic: '技术中性，人用偏颇',
    tags: ['技术伦理']
  },
  {
    id: 'judge_10',
    type: QuestionType.JUDGE,
    content: '在一个时代的技术中，往往存在一个主导技术。',
    correctAnswer: true,
    mnemonic: '如蒸汽时代、电气时代',
    tags: ['技术史']
  },
  {
    id: 'judge_11',
    type: QuestionType.JUDGE,
    content: '宇宙的无限性既无法证实也无法证伪，因此是无意义的。',
    correctAnswer: false,
    mnemonic: '有意义，推动了探索',
    tags: ['宇宙观']
  },
  {
    id: 'judge_12',
    type: QuestionType.JUDGE,
    content: '“大爆炸宇宙学”证实了宇宙的有限性。',
    correctAnswer: false,
    mnemonic: '只是假说，尚未完全证实',
    tags: ['宇宙观']
  },
  {
    id: 'judge_13',
    type: QuestionType.JUDGE,
    content: '公理化的方法局限性在于它不是科学发现的方法。',
    correctAnswer: false,
    mnemonic: '公理化置换公式可催生新理论，也是发现方法',
    tags: ['方法论']
  },
  {
    id: 'judge_14',
    type: QuestionType.JUDGE,
    content: '理想模型和理想实验对物质第一性原则提出了挑战。',
    correctAnswer: false,
    mnemonic: '不挑战，前提仍是物质第一性',
    tags: ['方法论']
  },
  {
    id: 'judge_15',
    type: QuestionType.JUDGE,
    content: '任何科学技术的成果，既有正价值，又有负价值。',
    correctAnswer: true,
    mnemonic: '双刃剑 (利弊共存)',
    tags: ['科技价值']
  },
  {
    id: 'judge_16',
    type: QuestionType.JUDGE,
    content: '逆向思维的哲学依据是辩证法的对立统一规律。',
    correctAnswer: true,
    mnemonic: '逆向=对立面',
    tags: ['创新思维']
  },
  {
    id: 'judge_17',
    type: QuestionType.JUDGE,
    content: '托勒密的“地心说”和哥白尼的“日心说”各有自己的理论依据。',
    correctAnswer: true,
    mnemonic: '参考系不同，各有依据',
    tags: ['科学史']
  },
  {
    id: 'judge_18',
    type: QuestionType.JUDGE,
    content: '按照辩证法，科学问题是个“具体问题具体分析”的过程，因此不存在通用的科学方法论。',
    correctAnswer: false,
    mnemonic: '存在共性，哲学就是通用方法',
    tags: ['方法论']
  },
  {
    id: 'judge_19',
    type: QuestionType.JUDGE,
    content: '许多科学家不懂哲学也能做贡献，因此提倡科学家学习哲学没有意义。',
    correctAnswer: false,
    mnemonic: '哲学能少走弯路 (理性战胜感性)',
    tags: ['科技与哲学']
  },
  {
    id: 'judge_20',
    type: QuestionType.JUDGE,
    content: '自然界的客观性是指物质不灭性。',
    correctAnswer: false,
    mnemonic: '客观性范围更大 (包括关系客观)',
    tags: ['自然观']
  },
  {
    id: 'judge_21',
    type: QuestionType.JUDGE,
    content: '宇宙的无限性是指人类对宇宙的认识是无限的。',
    correctAnswer: false,
    mnemonic: '无限性包括本体论(存在)和认识论(认知)两层',
    tags: ['宇宙观']
  },
  {
    id: 'judge_22',
    type: QuestionType.JUDGE,
    content: '机械自然观的根本缺陷是把运动的原因归结为外力的作用。',
    correctAnswer: true,
    mnemonic: '机械=外力推动',
    tags: ['自然观']
  },
  {
    id: 'judge_23',
    type: QuestionType.JUDGE,
    content: '演化的概念与发展的概念不同，前者既包含进化论，也包含退化论。',
    correctAnswer: true,
    mnemonic: '演化 = 进 + 退',
    tags: ['演化论']
  },
  {
    id: 'judge_24',
    type: QuestionType.JUDGE,
    content: '“牧场悖论”的实质是个体利益与集体利益的矛盾。',
    correctAnswer: true,
    mnemonic: '个人养羊vs集体草场',
    tags: ['可持续发展']
  },
  {
    id: 'judge_25',
    type: QuestionType.JUDGE,
    content: '解决人类和自然界的对立要靠实施科学发展观。',
    correctAnswer: true,
    mnemonic: '科学发展观解矛盾',
    tags: ['可持续发展']
  },
  {
    id: 'judge_26',
    type: QuestionType.JUDGE,
    content: '《周易》是古代的预测学。',
    correctAnswer: false,
    mnemonic: '周易算卦≠科学预测',
    tags: ['伪科学']
  },
  {
    id: 'judge_27',
    type: QuestionType.JUDGE,
    content: '中国古典哲学的阴阳分析是古代的辩证法。',
    correctAnswer: true,
    mnemonic: '阴阳=对立统一',
    tags: ['哲学史']
  },
  {
    id: 'judge_28',
    type: QuestionType.JUDGE,
    content: '中医学靠的是经验看病，因此不是科学。',
    correctAnswer: false,
    mnemonic: '经验不是判定标准',
    tags: ['科学划界']
  },
  {
    id: 'judge_29',
    type: QuestionType.JUDGE,
    content: '波普尔认为，哲学是不能检验真伪的，因此不是科学。',
    correctAnswer: false,
    mnemonic: '哲学可间接检验',
    tags: ['科学划界']
  },
  {
    id: 'judge_30',
    type: QuestionType.JUDGE,
    content: '教学中知识和方法的关系就是“干粮”和“猎枪”的关系。',
    correctAnswer: false,
    mnemonic: '知识是干粮，方法是猎枪 (题干说反了或者语境是肯定的？ OCR显示X。原话通常是肯定的，但这里OCR判错，可能强调关系不仅仅是这样，或者是“关系”表述有问题。按OCR答案为错)',
    tags: ['教育方法']
  },
  {
    id: 'judge_31',
    type: QuestionType.JUDGE,
    content: '归纳方法由于个别事物的不可穷尽，因此它的一般结论是靠不住的。',
    correctAnswer: false,
    mnemonic: '不能说“靠不住”，只是具有或然性',
    tags: ['逻辑方法']
  },
  {
    id: 'judge_32',
    type: QuestionType.JUDGE,
    content: '演绎方法的大前提隐含了要推出（个别）的结论，因此是无意义的。',
    correctAnswer: false,
    mnemonic: '有意义，可发现问题/纠错',
    tags: ['逻辑方法']
  }
];