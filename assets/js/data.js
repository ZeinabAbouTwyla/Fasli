/* فصلي — بيانات توضيحية: المراحل والصفوف والمواد والدروس */
window.FASLI = (function(){
  const stages = [
    {id:'primary', ar:'المرحلة الابتدائية', en:'Primary School'},
    {id:'prep',    ar:'المرحلة الإعدادية',  en:'Middle School'},
    {id:'sec',     ar:'المرحلة الثانوية',   en:'High School'}
  ];
  const grades = [
    {id:'p4', stage:'primary', ar:'الصف الرابع الابتدائي',  en:'Grade 4'},
    {id:'p5', stage:'primary', ar:'الصف الخامس الابتدائي',  en:'Grade 5'},
    {id:'p6', stage:'primary', ar:'الصف السادس الابتدائي',  en:'Grade 6'},
    {id:'m1', stage:'prep',    ar:'الصف الأول الإعدادي',   en:'Grade 7'},
    {id:'m2', stage:'prep',    ar:'الصف الثاني الإعدادي',  en:'Grade 8'},
    {id:'m3', stage:'prep',    ar:'الصف الثالث الإعدادي',  en:'Grade 9'},
    {id:'s1', stage:'sec',     ar:'الصف الأول الثانوي',    en:'Grade 10'},
    {id:'s2', stage:'sec',     ar:'الصف الثاني الثانوي',   en:'Grade 11'},
    {id:'s3', stage:'sec',     ar:'الصف الثالث الثانوي',   en:'Grade 12'}
  ];
  const covers = {
    math:'assets/img/lesson-algebra.jpg', geometry:'assets/img/lesson-geometry.jpg',
    stats:'assets/img/lesson-stats.jpg', fractions:'assets/img/lesson-fractions.jpg'
  };
  // مواد كل مرحلة (أسماء ثابتة، والدروس تُبنى حسب الصف)
  const subjectTemplates = {
    primary:[
      {id:'math', ar:'الرياضيات', en:'Mathematics', cover:covers.fractions, lessons:'mathPrimary'},
      {id:'arabic', ar:'اللغة العربية', en:'Arabic', cover:covers.stats, lessons:'arabic'},
      {id:'science', ar:'العلوم', en:'Science', cover:covers.geometry, lessons:'science'}
    ],
    prep:[
      {id:'math', ar:'الرياضيات', en:'Mathematics', cover:covers.math, lessons:'mathPrep'},
      {id:'science', ar:'العلوم', en:'Science', cover:covers.geometry, lessons:'science'},
      {id:'english', ar:'اللغة الإنجليزية', en:'English', cover:covers.stats, lessons:'english'},
      {id:'social', ar:'الدراسات الاجتماعية', en:'Social Studies', cover:covers.fractions, lessons:'social'}
    ],
    sec:[
      {id:'math', ar:'الرياضيات', en:'Mathematics', cover:covers.math, lessons:'mathSec'},
      {id:'physics', ar:'الفيزياء', en:'Physics', cover:covers.geometry, lessons:'physics'},
      {id:'chemistry', ar:'الكيمياء', en:'Chemistry', cover:covers.stats, lessons:'chemistry'},
      {id:'arabic', ar:'اللغة العربية', en:'Arabic', cover:covers.fractions, lessons:'arabic'}
    ]
  };
  // بنك دروس لكل مادة. الدروس التي لها فيديو حقيقي تحمل yt (معرّف يوتيوب) وvsrc (اسم المصدر)،
  // وتُعرض داخل مشغّل مضمّن مع نسب المصدر تحته. الدروس بلا فيديو تظهر بحالة «قريبًا»
  // ولا تدخل في حساب الإنجاز أو قفل التتابع حتى يُضاف محتواها.
  const lessonBank = {
    mathPrep:[
      {id:'m-l1', ar:'المعادلات من الدرجة الأولى', en:'First-degree equations', dur:'16:46', yt:'4YF5_6TvraE', vsrc:'رياضيات للجميع (Mathematics For All)', poster:'assets/img/video-poster.jpg',
       notesAr:['مفهوم المعادلة والمتغير','خطوات حل معادلة من الدرجة الأولى','التحقق من صحة الحل'],
       notesEn:['What an equation and a variable are','Steps to solve a first-degree equation','Checking your solution']},
      {id:'m-l2', ar:'الميزان الجبري وحل المعادلات', en:'The algebra balance', dur:'8:10', yt:'yXkx4jVYjkQ', vsrc:'إيهاب روماني (ehab romany)', poster:'assets/img/lesson-algebra.jpg'},
      {id:'m-l3', ar:'الهندسة: محيط الدائرة ومساحتها', en:'Geometry: circle perimeter and area', dur:'4:53', yt:'DPKHaW9HX-w', vsrc:'قناة nouha', poster:'assets/img/lesson-geometry.jpg'},
      {id:'m-l4', ar:'الإحصاء: الوسط والوسيط', en:'Statistics: mean and median', dur:'4:48', yt:'BK6zV3aeyx0', vsrc:'منصة مدرسة (Madrasa)', poster:'assets/img/lesson-stats.jpg'},
      {id:'m-l5', ar:'جمع الكسور وطرحها', en:'Adding and subtracting fractions', dur:'3:12', yt:'ObhiYCoODxM', vsrc:'Math Challenge Hub', poster:'assets/img/lesson-fractions.jpg'}
    ],
    mathPrimary:[
      {id:'m-l1', ar:'المعادلات من الدرجة الأولى', en:'First-degree equations', dur:'16:46', poster:'assets/img/video-poster.jpg',
       notesAr:['مفهوم المعادلة والمتغير','خطوات حل معادلة من الدرجة الأولى','التحقق من صحة الحل'],
       notesEn:['What an equation and a variable are','Steps to solve a first-degree equation','Checking your solution']},
      {id:'m-l2', ar:'الميزان الجبري وحل المعادلات', en:'The algebra balance', dur:'8:10', poster:'assets/img/lesson-algebra.jpg'},
      {id:'m-l3', ar:'الهندسة: محيط الدائرة ومساحتها', en:'Geometry: circle perimeter and area', dur:'4:53', poster:'assets/img/lesson-geometry.jpg'},
      {id:'m-l4', ar:'الإحصاء: الوسط والوسيط', en:'Statistics: mean and median', dur:'4:48', poster:'assets/img/lesson-stats.jpg'},
      {id:'m-l5', ar:'جمع الكسور وطرحها', en:'Adding and subtracting fractions', dur:'3:12', poster:'assets/img/lesson-fractions.jpg'}
    ],
    mathSec:[
      {id:'m-l1', ar:'المعادلات من الدرجة الأولى', en:'First-degree equations', dur:'16:46', poster:'assets/img/video-poster.jpg',
       notesAr:['مفهوم المعادلة والمتغير','خطوات حل معادلة من الدرجة الأولى','التحقق من صحة الحل'],
       notesEn:['What an equation and a variable are','Steps to solve a first-degree equation','Checking your solution']},
      {id:'m-l2', ar:'الميزان الجبري وحل المعادلات', en:'The algebra balance', dur:'8:10', poster:'assets/img/lesson-algebra.jpg'},
      {id:'m-l3', ar:'الهندسة: محيط الدائرة ومساحتها', en:'Geometry: circle perimeter and area', dur:'4:53', poster:'assets/img/lesson-geometry.jpg'},
      {id:'m-l4', ar:'الإحصاء: الوسط والوسيط', en:'Statistics: mean and median', dur:'4:48', poster:'assets/img/lesson-stats.jpg'},
      {id:'m-l5', ar:'جمع الكسور وطرحها', en:'Adding and subtracting fractions', dur:'3:12', poster:'assets/img/lesson-fractions.jpg'}
    ],
    arabic:[
      {id:'a-l1', ar:'الجملة الاسمية والجملة الفعلية', en:'Nominal and verbal sentences', dur:'9:30'},
      {id:'a-l2', ar:'علامات الترقيم', en:'Punctuation marks', dur:'7:45'},
      {id:'a-l3', ar:'النصوص: مهارات القراءة', en:'Reading skills', dur:'10:10'}
    ],
    science:[
      {id:'sc-l1', ar:'المادة وحالاتها', en:'Matter and its states', dur:'8:35'},
      {id:'sc-l2', ar:'الدورات في الطبيعة', en:'Cycles in nature', dur:'9:05'},
      {id:'sc-l3', ar:'الطاقة وصورها', en:'Forms of energy', dur:'10:40'}
    ],
    english:[
      {id:'e-l1', ar:'Present Simple tense', en:'Present Simple tense', dur:'8:20'},
      {id:'e-l2', ar:'Reading: short stories', en:'Reading: short stories', dur:'9:50'}
    ],
    social:[
      {id:'so-l1', ar:'الخريطة وعناصرها', en:'Elements of a map', dur:'8:10'},
      {id:'so-l2', ar:'الموارد الطبيعية', en:'Natural resources', dur:'9:25'}
    ],
    physics:[
      {id:'ph-l1', ar:'الحركة في خط مستقيم', en:'Motion in a straight line', dur:'11:15'},
      {id:'ph-l2', ar:'القوة والحركة', en:'Force and motion', dur:'10:30'}
    ],
    chemistry:[
      {id:'ch-l1', ar:'العناصر والمركبات', en:'Elements and compounds', dur:'9:40'},
      {id:'ch-l2', ar:'التفاعلات الكيميائية', en:'Chemical reactions', dur:'10:55'}
    ]
  };
  return {stages, grades, subjectTemplates, lessonBank};
})();
