/* فصلي — منطق الواجهة: الثيم، اللغة، الجلسة، تتبع المشاهدة، وعرض الصفحات */
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

  // تتبع المشاهدة الفعلي: لكل درس {watched ثوانٍ، pct، done، pos}
  const progress={
    all(){return store.get('fasli_prog2',{})},
    save(p){store.set('fasli_prog2',p)},
    key:(g,s,l)=>g+'/'+s+'/'+l,
    get(g,s,l){return this.all()[this.key(g,s,l)]||{watched:0,pct:0,done:false,pos:0}},
    set(g,s,l,rec){const p=this.all();p[this.key(g,s,l)]=rec;this.save(p)},
    stats(gradeId,sub){
      const vids=sub.lessons.filter(hasVid);
      const total=vids.length;
      const done=vids.filter(l=>this.get(gradeId,sub.id,l.id).done).length;
      return {done,total,pct:total?Math.round(done/total*100):0};
    },
    isUnlocked(gradeId,sub,idx){
      if(!hasVid(sub.lessons[idx]))return true;
      for(let j=0;j<idx;j++){
        const l=sub.lessons[j];
        if(hasVid(l)&&!this.get(gradeId,sub.id,l.id).done)return false;
      }
      return true;
    },
    nextUp(gradeId){
      const subs=subjectsFor(gradeId);
      for(const sub of subs)for(let i=0;i<sub.lessons.length;i++){
        const l=sub.lessons[i];
        if(hasVid(l)&&this.isUnlocked(gradeId,sub,i)&&!this.get(gradeId,sub.id,l.id).done)
          return {sub,lesson:l,idx:i};
      }
      return null;
    }
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
  const hasVid=l=>!!(l&&(l.yt||l.video));
  window.FasliData={gradeById,subjectsFor,hasVid};

  function gradeCard(g){
    const subs=subjectsFor(g.id);
    const count=subs.reduce((n,s)=>n+s.lessons.length,0);
    return `<a class="grade-card" href="class.html?grade=${g.id}">
      <span class="stage">${L(FASLI.stages.find(st=>st.id===g.stage))}</span>
      <h3>${L(g)}</h3>
      <p>${subs.length} ${t('grades.subjects')} · ${count} ${t('grades.lessons')}</p>
      <span class="go">${t('grades.enter')} ←</span></a>`;
  }

  function subjectCard(gradeId,sub){
    const st=progress.stats(gradeId,sub);
    return `<a class="subject-card" href="class.html?grade=${gradeId}&subject=${sub.id}">
      <img class="thumb" src="${sub.cover}" alt="">
      <div class="body"><h3>${L(sub)}</h3>
      <div class="meta"><span>${sub.lessons.length} ${t('grades.lessons')}</span><span>${st.total?t('dash.progress').replace('{done}',st.done).replace('{total}',st.total):t('class.soon')}</span></div>
      <div class="progress"><i style="width:${st.pct}%"></i></div></div></a>`;
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
      const nx=progress.nextUp(s.grade);
      $('#continue-wrap').innerHTML=nx?
        `<a class="continue-card" href="lesson.html?grade=${s.grade}&subject=${nx.sub.id}&lesson=${nx.lesson.id}">
           <h3>${t('dash.continue')} ←</h3>
           <p>${t('dash.continue.sub').replace('{lesson}',L(nx.lesson)).replace('{subject}',L(nx.sub))}</p></a>`:
        `<div class="continue-card done"><h3>${t('dash.allDone')}</h3></div>`;
      $('#subject-grid').innerHTML=subjectsFor(s.grade).map(sub=>subjectCard(s.grade,sub)).join('');
    },
    class(){
      const q=new URLSearchParams(location.search);
      const gradeId=q.get('grade'), subId=q.get('subject');
      const g=gradeById(gradeId);
      if(!g){location.replace('index.html#grades');return}
      const grid=$('#subject-grid'), list=$('#lesson-list');
      if(!subId){
        // الصف يفتح مواده
        $('#back-link').href='index.html#grades';
        $('#back-link').textContent='→ '+t('class.backGrades');
        $('#class-title').textContent=L(g);
        $('#class-sub').textContent=L(FASLI.stages.find(st=>st.id===g.stage))+' · '+t('class.pickSubject');
        list.style.display='none'; grid.style.display='';
        grid.innerHTML=subjectsFor(gradeId).map(sub=>subjectCard(gradeId,sub)).join('');
        return;
      }
      const sub=subjectsFor(gradeId).find(x=>x.id===subId);
      if(!sub){location.replace('class.html?grade='+gradeId);return}
      $('#class-title').textContent=L(sub);
      $('#class-sub').textContent=L(g);
      const s=session.get();
      $('#back-link').href=s?'dashboard.html':`class.html?grade=${gradeId}`;
      $('#back-link').textContent='→ '+t('class.back');
      grid.style.display='none'; list.style.display='';
      list.innerHTML=sub.lessons.map((l,i)=>{
        const rec=progress.get(gradeId,sub.id,l.id);
        const unlocked=progress.isUnlocked(gradeId,sub,i);
        const badge=!hasVid(l)?t('class.soon'):(rec.done?t('class.done'):(rec.pct>0?Math.round(rec.pct)+'%':t('class.watch')));
        if(!unlocked)
          return `<div class="lesson-row locked" title="${t('class.locked')}">
            <span class="num">🔒</span>
            <span class="info"><h3>${L(l)}</h3><span>${l.dur} ${t('class.min')} · ${t('class.locked')}</span></span>
            <span class="badge">🔒</span></div>`;
        return `<a class="lesson-row ${rec.done?'done':''}" href="lesson.html?grade=${gradeId}&subject=${subId}&lesson=${l.id}">
          <span class="num">${i+1}</span>
          <span class="info"><h3>${L(l)}</h3><span>${l.dur} ${t('class.min')}</span></span>
          <span class="badge">${badge}</span></a>`;
      }).join('');
    },
    lesson(){
      const q=new URLSearchParams(location.search);
      const gradeId=q.get('grade'), subId=q.get('subject'), lesId=q.get('lesson');
      const sub=subjectsFor(gradeId).find(x=>x.id===subId);
      if(!sub){location.replace('index.html#grades');return}
      const idx=sub.lessons.findIndex(l=>l.id===lesId);
      if(idx<0||!progress.isUnlocked(gradeId,sub,idx)){location.replace(`class.html?grade=${gradeId}&subject=${subId}`);return}
      const l=sub.lessons[idx];
      $('#back-link').href=`class.html?grade=${gradeId}&subject=${subId}`;
      $('#back-link').textContent='→ '+t('lesson.back');
      $('#lesson-title').textContent=L(l);
      $('#lesson-meta').textContent=`${L(sub)} · ${l.dur} ${t('class.min')}`;
      if(l.yt)
        $('#video-wrap').innerHTML=`<div class="video-shell"><div id="yt-mount" class="yt-mount"></div></div><div class="src-note">${t('lesson.source')}: <a href="https://www.youtube.com/watch?v=${l.yt}" target="_blank" rel="noopener">${l.vsrc||'YouTube'}</a></div>`;
      else if(l.video)
        $('#video-wrap').innerHTML=`<div class="video-shell"><span class="demo-tag">${t('lesson.demoClip')}</span><video id="lesson-video" controls preload="metadata" poster="${l.poster||sub.cover}"><source src="${l.video}" type="video/mp4"></video></div>`;
      else
        $('#video-wrap').innerHTML=`<div class="video-shell soon-shell"><div class="soon-note">🎬 ${t('lesson.soon')}</div></div>`;
      const notes=(lang==='ar'?l.notesAr:l.notesEn)||[];
      $('#lesson-notes').innerHTML=notes.length?notes.map(n=>`<li>${n}</li>`).join(''):`<li>${t('lesson.demo')}</li>`;

      const next=sub.lessons[idx+1];
      const nextBtn=$('#next-link'), hint=$('#lock-hint');
      if(next){
        nextBtn.style.display='inline-flex';
        nextBtn.href=`lesson.html?grade=${gradeId}&subject=${subId}&lesson=${next.id}`;
      }
      const paint=()=>{
        const pct=Math.min(100,Math.round(rec.pct));
        $('#watch-fill').style.width=pct+'%';
        $('#watch-pct').textContent=t('lesson.watch').replace('{pct}',pct);
        const st=$('#watch-state');
        if(rec.done){st.textContent=t('lesson.complete');st.classList.add('ok');}
        else{st.textContent='';st.classList.remove('ok');}
        if(next){
          if(rec.done){nextBtn.classList.remove('locked');nextBtn.removeAttribute('aria-disabled');hint.style.display='none';}
          else{nextBtn.classList.add('locked');nextBtn.setAttribute('aria-disabled','true');}
        }
      };
      if(next) nextBtn.onclick=e=>{
        if(nextBtn.classList.contains('locked')){e.preventDefault();hint.textContent=t('lesson.nextLocked');hint.style.display='inline';}
      };

      // قياس المشاهدة الفعلية من وقت التشغيل، وليس بزر
      let rec=progress.get(gradeId,subId,l.id);
      let lastT=0, saveTimer=null;
      const commit=()=>{progress.set(gradeId,subId,l.id,rec)};
      const throttled=()=>{if(saveTimer)return;saveTimer=setTimeout(()=>{saveTimer=null;commit()},1000)};
      const markDone=()=>{rec.pct=100;rec.done=true;rec.pos=0;};
      if(!hasVid(l)){
        // درس بلا فيديو بعد: لا يُقفل ولا يحتسب في الإنجاز
        $('#watch-fill').style.width='0%';
        $('#watch-pct').textContent=t('lesson.soon');
        if(next){nextBtn.classList.remove('locked');nextBtn.removeAttribute('aria-disabled');hint.style.display='none';}
      }else if(l.yt){
        // مشغّل يوتيوب مضمّن + قياس وقت التشغيل الفعلي كل ثانية
        const start=()=>{
          const player=new YT.Player('yt-mount',{videoId:l.yt,playerVars:{rel:0,modestbranding:1,enablejsapi:1},events:{
            onReady:e=>{
              const dur=e.target.getDuration()||0;
              if(rec.pos>2&&!rec.done&&dur&&rec.pos<dur-2)e.target.seekTo(rec.pos,true);
            },
            onStateChange:e=>{
              if(e.data===YT.PlayerState.ENDED){
                const dur=e.target.getDuration()||0;
                if(!rec.done&&dur&&(rec.watched||0)>=dur*0.9){markDone();}
                commit();paint();
              }
              if(e.data===YT.PlayerState.PLAYING)lastT=e.target.getCurrentTime();
            }
          }});
          window.FasliPlayer=player;
          setInterval(()=>{
            if(!player||!player.getPlayerState)return;
            if(player.getPlayerState()===YT.PlayerState.PLAYING){
              const ct=player.getCurrentTime(), d=ct-lastT; lastT=ct;
              const dur=player.getDuration()||0;
              if(!rec.done&&dur&&d>0&&d<=2.1){
                rec.watched=Math.min(dur,(rec.watched||0)+d);
                rec.pct=rec.watched/dur*100;
                if(rec.pct>=90)markDone();
              }
              if(!rec.done)rec.pos=ct;
              paint();throttled();
            }else if(player.getCurrentTime){lastT=player.getCurrentTime();}
          },1000);
        };
        if(window.YT&&window.YT.Player){start();}
        else{
          const prev=window.onYouTubeIframeAPIReady;
          window.onYouTubeIframeAPIReady=()=>{if(prev)prev();start();};
          if(!document.getElementById('yt-api')){const sc=document.createElement('script');sc.id='yt-api';sc.src='https://www.youtube.com/iframe_api';document.head.appendChild(sc);}
        }
        paint();
      }else{
        const video=$('#lesson-video');
        video.addEventListener('loadedmetadata',()=>{
          if(rec.pos>0&&!rec.done&&video.duration&&rec.pos<video.duration-2)video.currentTime=rec.pos;
          lastT=video.currentTime;
        });
        video.addEventListener('timeupdate',()=>{
          const ct=video.currentTime, d=ct-lastT; lastT=ct;
          if(!rec.done&&video.duration&&d>0&&d<=2.1){
            rec.watched=Math.min(video.duration,(rec.watched||0)+d);
            rec.pct=rec.watched/video.duration*100;
            if(rec.pct>=90)markDone();
          }
          if(!rec.done)rec.pos=ct;
          paint();throttled();
        });
        video.addEventListener('pause',()=>{commit();paint()});
        video.addEventListener('ended',()=>{rec.pos=0;if(!rec.done&&video.duration&&(rec.watched||0)>=video.duration*0.9)markDone();commit();paint()});
        paint();
      }
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
