
import { Question, QuestionType } from '../types';

export const SEED_QUESTIONS: Question[] = [
  // --- 2022 真题 (不定项选择) ---
  {
    id: '2022_choice_1',
    type: QuestionType.CHOICE,
    content: '【2022真题】科学与非科学的区别是？',
    options: [
      '前者使用人工语言，后者使用自然语言', 
      '前者使用试验方法，后者不使用试验方法', 
      '前者可检验，后者不可检验', 
      '前者满足可重复性，后者不满足'
    ],
    correctAnswer: ['C', 'D'],
    mnemonic: '科学核心=可检验+可重复',
    analysis: '语言和方法不是本质区别（非科学也可以用人工语言或试验），本质区别在于是否具有可检验性和可重复性。',
    tags: ['2022真题', '科学划界']
  },
  {
    id: '2022_choice_2',
    type: QuestionType.CHOICE,
    content: '【2022真题】数学物理方程中，许多不同形态的物理运动规律可以用同一个方程来描述，这表明？',
    options: [
      '数学规律与物理规律在质上的统一性', 
      '世界的物质统一性', 
      '物质形态的互相转化性', 
      '这些物质及其运动规律的一定同一性'
    ],
    correctAnswer: ['D'],
    mnemonic: '方程同=规律同',
    analysis: '不同物理现象满足同一方程，说明它们在深层运动规律上具有同一性（如振动方程适用于机械波和电磁波）。',
    tags: ['2022真题', '物理哲学']
  },
  {
    id: '2022_choice_3',
    type: QuestionType.CHOICE,
    content: '【2022真题】关于辩证法规律的说法，正确的是？',
    options: [
      '辩证法的规律产生于人的头脑', 
      '辩证法的规律根本不存在', 
      '辩证法的规律存在于自然界中', 
      '主观辩证法是对客观辩证法的反映'
    ],
    correctAnswer: ['C', 'D'],
    mnemonic: '客观存在，主观反映',
    analysis: '辩证法规律是客观存在的（自然界中），不是人脑主观产生的。主观辩证法是客观辩证法在思维中的反映。',
    tags: ['2022真题', '辩证法']
  },
  {
    id: '2022_choice_4',
    type: QuestionType.CHOICE,
    content: '【2022真题】关于量子力学的说法不正确的是？',
    options: [
      '量子力学否定了这个世界的确定性', 
      '量子力学否定了这个世界的客观性', 
      '量子力学证实了人的主观意志对客观事物的本质具有决定性作用', 
      '量子力学并没有否定客观世界因果律的可靠性'
    ],
    correctAnswer: ['A', 'B', 'C'], 
    mnemonic: '量子力学不唯心',
    analysis: '量子力学揭示了微观世界的统计性规律，并未否定客观性，也没有否定因果律（只是因果形式变了），更不支持唯心主义的主观决定论。',
    tags: ['2022真题', '物理哲学']
  },
  {
    id: '2022_choice_5',
    type: QuestionType.CHOICE,
    content: '【2022真题】结构性数学与数量型数学的联系是？',
    options: [
      '结构型数学已经不遵循传统数量型数学的基本法则', 
      '结构型数学依然遵循与传统数量型数学一致的基本法则（如交换律等）', 
      '研究的是数理逻辑及其关系', 
      '结构型数学不需要遵循什么数学法则'
    ],
    correctAnswer: ['B'],
    mnemonic: '继承发展，法则一致',
    analysis: '结构数学（如群环域）是对数量关系的抽象，依然遵循基本的运算律，是继承与发展的关系。',
    tags: ['2022真题', '数学哲学']
  },

  // --- 经典选择题 (Converted to Array format) ---
  {
    id: 'choice_1',
    type: QuestionType.CHOICE,
    content: '自然辩证法最早理论体系来源于？',
    options: [
      '马克思《资本论》', 
      '恩格斯《自然辩证法》', 
      '黑格尔《小逻辑》', 
      '达尔文《物种起源》'
    ],
    correctAnswer: ['B'],
    mnemonic: '恩自 (恩格斯-自然辩证法)',
    tags: ['绪论']
  },
  {
    id: 'choice_3',
    type: QuestionType.CHOICE,
    content: '微分作为无穷小量，其哲学意义是？',
    options: [
      '一种理想化的纯粹假设技巧', 
      '微分的零与非零的统一', 
      '微分是自然界物质层次划分中代表不同层次质的转化的关节点', 
      '不可知论的表现'
    ],
    correctAnswer: ['B', 'C'],
    mnemonic: '零与非零统一，质变关节点',
    analysis: '微分既趋近于零又不等于零，体现了辩证统一；同时标志着宏观量向微观量的质变过渡。',
    tags: ['数学哲学']
  },
  {
    id: 'choice_4',
    type: QuestionType.CHOICE,
    content: '相对论的创立表明？',
    options: [
      '时间空间与物质及其运动状态密不可分', 
      '时空是绝对的容器', 
      '物质运动不影响时空', 
      '牛顿力学是绝对真理'
    ],
    correctAnswer: ['A'],
    mnemonic: '相对论=时空物运一体',
    tags: ['物理哲学']
  },
  {
    id: 'choice_5',
    type: QuestionType.CHOICE,
    content: '量子力学的创立表明？',
    options: [
      '微观粒子遵循经典因果律', 
      '昭示了一种不同于牛顿力学性质的新的因果观和规律观', 
      '微观世界不可认识', 
      '否定了客观世界'
    ],
    correctAnswer: ['B'],
    mnemonic: '量子=新因果 (统计规律)',
    tags: ['物理哲学']
  },
  {
    id: 'choice_7',
    type: QuestionType.CHOICE,
    content: '非欧几何的创立表明？',
    options: [
      '欧式几何是错误的', 
      '欧式几何描述的空间形式只是自然界多种空间形式的一种', 
      '人类可以发展多种形式的几何学', 
      '空间形式取决于人的主观构造'
    ],
    correctAnswer: ['B', 'C'],
    mnemonic: '欧几只是之一，空间多样',
    analysis: '非欧几何证明了空间结构的多样性，欧氏几何只是其中一种特例（平直空间）。',
    tags: ['数学哲学']
  },
  {
    id: 'choice_9',
    type: QuestionType.CHOICE,
    content: '系统非加和性的实质是？',
    options: [
      '整体等于部分之和', 
      '整体各部分存在制约、作用和选择', 
      '整体的性质和功能不等于各部分性质和功能的简单叠加', 
      '整体小于部分之和'
    ],
    correctAnswer: ['B', 'C'],
    mnemonic: '制约作用，1+1≠2',
    analysis: '系统的整体涌现性来源于要素之间的非线性相互作用（制约、协同），导致整体功能溢出或内耗。',
    tags: ['系统论']
  },
  {
    id: 'choice_12',
    type: QuestionType.CHOICE,
    content: '自然辩证法的学科性质是？',
    options: [
      '实证科学', 
      '马克思主义哲学的一个组成部分', 
      '连接马克思主义哲学与科学技术的中介和桥梁', 
      '纯粹思辨哲学'
    ],
    correctAnswer: ['B', 'C'],
    mnemonic: '马哲组成，哲科桥梁',
    tags: ['绪论']
  },

  // --- 判断题 (带辨析) ---
  {
    id: 'judge_1',
    type: QuestionType.JUDGE,
    content: '任何物质系统的整体与部分的关系都是加和性与非加和性的统一。',
    correctAnswer: true,
    mnemonic: '既有加和(如质量)，也有非加和(如功能)',
    analysis: '系统既包含可加和的属性（如总质量等于部分质量之和），也包含不可加和的属性（如生命系统的功能），二者是统一的。',
    tags: ['系统论']
  },
  {
    id: 'judge_2',
    type: QuestionType.JUDGE,
    content: '作为系统的物质整体，其根本属性是加和性。',
    correctAnswer: false,
    mnemonic: '根本属性是“非加和性” (整体涌现)',
    analysis: '错。系统的根本属性是“非加和性”（整体性），即整体具有部分所不具备的新性质（涌现性）。',
    tags: ['系统论']
  },
  {
    id: 'judge_3',
    type: QuestionType.JUDGE,
    content: '光速c、普朗克常量h是标志不同层次物质运动转化的关节点。',
    correctAnswer: true,
    mnemonic: 'c分高速低速，h分宏观微观',
    analysis: '光速c是宏观低速运动与高速运动的分界线；普朗克常数h是宏观物体与微观粒子的分界线。',
    tags: ['物理哲学']
  },
  {
    id: 'judge_4',
    type: QuestionType.JUDGE,
    content: '自组织理论表明，偶然性在进化中起决定作用。',
    correctAnswer: false,
    mnemonic: '偶然性只在“远离平衡态”时才起决定作用',
    analysis: '错。偶然性（涨落）只有在系统处于“临界点”或“远离平衡态”时才起决定性触发作用，在常规状态下不起决定作用。',
    tags: ['自组织']
  },
  {
    id: 'judge_5',
    type: QuestionType.JUDGE,
    content: '科学和非科学的区别在于前者使用人工语言，后者使用自然语言。',
    correctAnswer: false,
    mnemonic: '区别在于“可检验、可重复”等，不是语言',
    analysis: '错。语言工具不是划界标准。科学的核心特征是可检验性、可重复性、可证伪性等。',
    tags: ['科学划界']
  },
  {
    id: 'judge_6',
    type: QuestionType.JUDGE,
    content: '“方法无用论”是经验主义，“方法万能论”是教条主义。',
    correctAnswer: true,
    mnemonic: '无用=经验，万能=教条',
    analysis: '对。经验主义轻视理论方法，教条主义过度迷信方法形式。',
    tags: ['方法论']
  },
  {
    id: 'judge_7',
    type: QuestionType.JUDGE,
    content: '数学方法是一种单纯的逻辑分析方法。',
    correctAnswer: false,
    mnemonic: '数学不仅需要逻辑，还需要内容',
    analysis: '错。数学方法不仅包含逻辑推演，还包含模型构建、数值计算等，且不能脱离具体的物理对象内容，逻辑不能推出所有内容。',
    tags: ['数学方法']
  },
  {
    id: 'judge_8',
    type: QuestionType.JUDGE,
    content: '科学理论的进步表现为一个不断的渐进过程。',
    correctAnswer: false,
    mnemonic: '进步=渐进(量变)+飞跃(质变)',
    analysis: '错。科学进步是渐进（量变/常规科学）与飞跃（质变/科学革命）的辩证统一，不只是渐进。',
    tags: ['科学发展']
  },
  {
    id: 'judge_9',
    type: QuestionType.JUDGE,
    content: '技术本身是中性的，被何主体所用则带有功利性。',
    correctAnswer: true,
    mnemonic: '技术中性，人用偏颇',
    analysis: '对。技术作为工具无阶级性，但技术的使用主体（人/社会）具有目的性和功利性。',
    tags: ['技术伦理']
  },
  {
    id: 'judge_14',
    type: QuestionType.JUDGE,
    content: '理想模型和理想实验对物质第一性原则提出了挑战。',
    correctAnswer: false,
    mnemonic: '不挑战，前提仍是物质第一性',
    analysis: '错。理想模型（如质点）是基于客观现实的科学抽象，其前提和基础依然是客观物质世界，并未否定物质第一性。',
    tags: ['方法论']
  },
  {
    id: 'judge_18',
    type: QuestionType.JUDGE,
    content: '按照辩证法，科学问题是个“具体问题具体分析”的过程，因此不存在通用的科学方法论。',
    correctAnswer: false,
    mnemonic: '存在共性，哲学就是通用方法',
    analysis: '错。个别中包含一般。虽然要具体分析，但科学研究存在普遍规律，自然辩证法就是研究这些通用方法论的学科。',
    tags: ['方法论']
  },
  {
    id: 'judge_20',
    type: QuestionType.JUDGE,
    content: '自然界的客观性是指物质不灭性。',
    correctAnswer: false,
    mnemonic: '客观性范围更大 (包括关系客观)',
    analysis: '错。物质不灭只是客观性的一种表现。自然界的客观性还包括规律的客观性、关系的客观性等，范围更广。',
    tags: ['自然观']
  },
  {
    id: 'judge_22',
    type: QuestionType.JUDGE,
    content: '机械自然观的根本缺陷是把运动的原因归结为外力的作用。',
    correctAnswer: true,
    mnemonic: '机械=外力推动',
    analysis: '对。机械唯物主义看不到事物内部的矛盾运动（内因），认为运动仅由外力推动（如牛顿的“第一推动力”）。',
    tags: ['自然观']
  },
  {
    id: 'judge_23',
    type: QuestionType.JUDGE,
    content: '演化的概念与发展的概念不同，前者既包含进化论，也包含退化论。',
    correctAnswer: true,
    mnemonic: '演化 = 进 + 退',
    analysis: '对。发展通常指上升的前进的运动，而演化是更中性的概念，包含进化（有序化）和退化（无序化）两个方向。',
    tags: ['演化论']
  },
  {
    id: 'judge_26',
    type: QuestionType.JUDGE,
    content: '《周易》是古代的预测学。',
    correctAnswer: false,
    mnemonic: '周易算卦≠科学预测',
    analysis: '错。《周易》虽然包含朴素辩证法，但其占卜预测缺乏科学的可检验性和逻辑因果，属于神秘主义，不是现代意义的科学预测学。',
    tags: ['伪科学']
  },
  {
    id: 'judge_31',
    type: QuestionType.JUDGE,
    content: '归纳方法由于个别事物的不可穷尽，因此它的一般结论是靠不住的。',
    correctAnswer: false,
    mnemonic: '不能说“靠不住”，只是具有或然性',
    analysis: '错。虽然归纳结论具有或然性（不完全归纳），但它是人类认识世界的基础方法，结论在一定范围内是可靠的，不能完全否定。',
    tags: ['逻辑方法']
  },
  {
    id: 'judge_32',
    type: QuestionType.JUDGE,
    content: '演绎方法的大前提隐含了要推出（个别）的结论，因此是无意义的。',
    correctAnswer: false,
    mnemonic: '有意义，可发现问题/纠错',
    analysis: '错。演绎法虽然前提包含结论，但它能帮助我们理清逻辑关系、发现前提中的错误、预见未知的个别现象，具有重要的认识论意义。',
    tags: ['逻辑方法']
  }
];
