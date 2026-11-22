/* فصلي — منطق الواجهة: الثيم، اللغة، الجلسة، وعرض الصفحات */
(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
  const store={
    get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},
    set(k,v){localStorage.setItem(k,JSON.stringify(v))}
  };
  let lang=store.get('fasli_lang','ar');
  let theme=store.get('fasli_theme', matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  const t=k=>(I18N[lang]&&I18N[lang][k])||I18N.ar[k]||k;
  const L=o=>lang==='ar'?o.ar:o.en;

  function apply(){
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    document.documentElement.dataset.theme=theme;
    $$('[data-i18n]').forEach(el=>{const v=t(el.dataset.i18n); el.innerHTML=v;});
    $$('[data-i18n-ph]').forEach(el=>el.placeholder=t(el.dataset.i18nPh));
    $$('.lang-btn').forEach(b=>b.textContent=lang==='ar'?'EN':'ع');
    document.title=$('title')?.dataset[lang==='ar'?'ar':'en']||document.title;
  }
  window.FasliApp={t,L,lang:()=>lang};

  // الجلسة التجريبية
  const session={
    get:()=>store.get('fasli_session',null),
    set:s=>store.set('fasli_session',s),
    clear:()=>localStorage.removeItem('fasli_session')
  };
  const progress={
    key:()=>{const s=session.get();return 'fasli_prog_'+(s?s.grade:'anon')},
    all(){return store.get(this.key(),{})},
    is(id){return !!this.all()[id]},
    toggle(id){const p=this.all();p[id]=!p[id];if(!p[id])delete p[id];store.set(this.key(),p)}
  };
  window.FasliSession=session; window.FasliProgress=progress;

  // الترويسة والتذييل المشتركان
  function chrome(active){
    const s=session.get();
    $('#site-header').innerHTML=`
      <div class="wrap header-in">
        <a class="brand" href="index.html"><span class="mark">✎</span><span>${t('site.name')}<small>${t('site.tag')}</small></span></a>
        <button class="icon-btn burger" aria-label="${t('menu')}" onclick="document.body.classList.toggle('nav-open')">☰</button>
        <nav class="main-nav">
          <a href="index.html" ${active==='home'?'aria-current="page"':''}>${t('nav.home')}</a>
          <a href="index.html#grades" ${active==='grades'?'aria-current="page"':''}>${t('nav.grades')}</a>
          ${s?`<a href="dashboard.html" ${active==='dash'?'aria-current="page"':''}>${t('nav.my')}</a>`:''}
          <a href="credits.html" ${active==='credits'?'aria-current="page"':''}>${t('nav.credits')}</a>
          ${s?`<a href="#" id="logout-link">${t('nav.logout')}</a>`:`<a href="login.html" ${active==='login'?'aria-current="page"':''}>${t('nav.login')}</a>`}
        </nav>
        <div class="header-tools">
          <button class="lang-btn" aria-label="language">EN</button>
          <button class="icon-btn" aria-label="${t('theme.toggle')}" id="theme-btn">${theme==='dark'?'☀':'☾'}</button>
        </div>
      </div>`;
    $('#site-footer').innerHTML=`
      <div class="wrap footer-grid">
        <div><h4>${t('site.name')}</h4><p>${t('footer.about')}</p></div>
        <div><h4>${t('nav.grades')}</h4><p><a href="index.html#grades">${t('grades.title')}</a><br><a href="login.html">${t('nav.login')}</a></p></div>
        <div><h4>${t('nav.about')}</h4><p><a href="credits.html">${t('nav.credits')}</a></p></div>
      </div>
      <div class="wrap made-by">${t('footer.made')}</div>`;
    $$('.lang-btn').forEach(b=>b.onclick=()=>{lang=lang==='ar'?'en':'ar';store.set('fasli_lang',lang);apply();chrome(active);init();});
    $('#theme-btn').onclick=()=>{theme=theme==='dark'?'light':'dark';store.set('fasli_theme',theme);apply();chrome(active);};
    const lo=$('#logout-link'); if(lo) lo.onclick=e=>{e.preventDefault();session.clear();location.href='index.html'};
  }

  const gradeById=id=>FASLI.grades.find(g=>g.id===id);
  const subjectsFor=gradeId=>{
    const g=gradeById(gradeId); if(!g) return [];
    return FASLI.subjectTemplates[g.stage].map(s=>({...s,lessons:FASLI.lessonBank[s.lessons]}));
  };
  window.FasliData={gradeById,subjectsFor};

  function gradeCard(g){
    const subs=subjectsFor(g.id);
    const count=subs.reduce((n,s)=>n+s.lessons.length,0);
    return `<a class="grade-card" href="class.html?grade=${g.id}">
      <span class="stage">${L(FASLI.stages.find(st=>st.id===g.stage))}</span>
      <h3>${L(g)}</h3>
      <p>${subs.length} ${t('grades.subjects')} · ${count} ${t('grades.lessons')}</p>
      <span class="go">${t('grades.enter')} ←</span></a>`;
  }

  // صفحات
  const pages={
    home(){
      const grid=$('#grade-grid');
      if(grid) grid.innerHTML=FASLI.grades.map(gradeCard).join('');
    },
    login(){
      const sel=$('#grade-select');
      sel.innerHTML=`<option value="">${t('login.pick')}</option>`+
        FASLI.stages.map(st=>`<optgroup label="${L(st)}">`+
          FASLI.grades.filter(g=>g.stage===st.id).map(g=>`<option value="${g.id}">${L(g)}</option>`).join('')+`</optgroup>`).join('');
      $('#login-form').onsubmit=e=>{
        e.preventDefault();
        const name=$('#student-name').value.trim(), grade=sel.value;
        if(!name||!grade){$('#login-alert').textContent=t('login.need');$('#login-alert').style.display='block';return}
        session.set({name,grade});
        location.href='dashboard.html';
      };
    },
    dash(){
      const s=session.get(); if(!s){location.replace('login.html');return}
      const g=gradeById(s.grade);
      $('#welcome').innerHTML=`<div><h2>${t('dash.hello').replace('{name}',s.name)}</h2>
        <p>${t('dash.sub').replace('{grade}',L(g))}</p></div>
        <div class="spacer"><button class="chip-btn" onclick="location.href='login.html'">${t('dash.switch')}</button></div>`;
      $('#subject-grid').innerHTML=subjectsFor(s.grade).map(sub=>{
        const p=progress.all(), done=sub.lessons.filter(l=>p[l.id]).length;
        const pct=Math.round(done/sub.lessons.length*100);
        return `<a class="subject-card" href="class.html?grade=${s.grade}&subject=${sub.id}">
          <img class="thumb" src="${sub.cover}" alt="">
          <div class="body"><h3>${L(sub)}</h3>
          <div class="meta"><span>${sub.lessons.length} ${t('grades.lessons')}</span><span>${t('dash.progress').replace('{done}',done).replace('{total}',sub.lessons.length)}</span></div>
          <div class="progress"><i style="width:${pct}%"></i></div></div></a>`;
      }).join('');
    },
    class(){
      const q=new URLSearchParams(location.search);
      const gradeId=q.get('grade'), subId=q.get('subject');
      const g=gradeById(gradeId); const sub=subjectsFor(gradeId).find(x=>x.id===subId);
      if(!g||!sub){location.replace('index.html#grades');return}
      $('#class-title').textContent=L(sub);
      $('#class-sub').textContent=L(g);
      $('#back-link').href=`dashboard.html`;
      $('#back-link').textContent='→ '+t('class.back');
      $('#lesson-list').innerHTML=sub.lessons.map((l,i)=>{
        const done=progress.is(l.id);
        return `<a class="lesson-row ${done?'done':''}" href="lesson.html?grade=${gradeId}&subject=${subId}&lesson=${l.id}">
          <span class="num">${i+1}</span>
          <span class="info"><h3>${L(l)}</h3><span>${l.dur} ${t('class.min')}</span></span>
          <span class="badge">${done?t('class.done'):t('class.watch')}</span></a>`;
      }).join('');
    },
    lesson(){
      const q=new URLSearchParams(location.search);
      const gradeId=q.get('grade'), subId=q.get('subject'), lesId=q.get('lesson');
      const sub=subjectsFor(gradeId).find(x=>x.id===subId);
      if(!sub){location.replace('index.html');return}
      const idx=sub.lessons.findIndex(l=>l.id===lesId);
      const l=sub.lessons[idx<0?0:idx];
      $('#back-link').href=`class.html?grade=${gradeId}&subject=${subId}`;
      $('#back-link').textContent='→ '+t('lesson.back');
      $('#lesson-title').textContent=L(l);
      $('#lesson-meta').textContent=`${L(sub)} · ${l.dur} ${t('class.min')}`;
      const vwrap=$('#video-wrap');
      if(l.video){
        vwrap.innerHTML=`<div class="video-shell"><video controls preload="metadata" poster="${l.poster}"><source src="${l.video}" type="video/mp4"></video></div>`;
      }else{
        vwrap.innerHTML=`<div class="video-shell"><img src="${l.poster||sub.cover}" alt="" style="width:100%;aspect-ratio:16/9;object-fit:cover"></div>
          <div class="alert">${t('lesson.noVideo')}</div>`;
      }
      const notes=(lang==='ar'?l.notesAr:l.notesEn)||[];
      $('#lesson-notes').innerHTML=notes.length?notes.map(n=>`<li>${n}</li>`).join(''):`<li>${t('lesson.demo')}</li>`;
      const btn=$('#mark-btn');
      const paint=()=>{btn.textContent=progress.is(l.id)?t('lesson.unmark'):t('lesson.mark')};
      btn.onclick=()=>{progress.toggle(l.id);paint()};
      paint();
      const next=sub.lessons[idx+1];
      if(next){const n=$('#next-link');n.style.display='inline-flex';n.href=`lesson.html?grade=${gradeId}&subject=${subId}&lesson=${next.id}`;n.textContent=t('lesson.next')+' ←'}
    },
    credits(){},
    about(){}
  };

  function init(){
    const page=document.body.dataset.page;
    if(page&&pages[page]) pages[page]();
  }
  document.addEventListener('DOMContentLoaded',()=>{
    document.documentElement.dataset.theme=theme;
    chrome(document.body.dataset.active||'');
    apply(); init();
  });
})();
