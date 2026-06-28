
(function(){
  const KEY='storiaProgress_v1';
  const $=(s,root=document)=>root.querySelector(s);
  const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function write(p){localStorage.setItem(KEY,JSON.stringify(p))}
  function mark(id){const p=read();p[id]=true;write(p)}
  function isDone(id){return !!read()[id]}
  function updateProgress(){
    if(!window.ALL_TOPICS)return;
    const p=read();
    const done=window.ALL_TOPICS.filter(t=>p[t.id]).length;
    $$('.js-progress-text').forEach(el=>el.textContent=`${done}/${window.ALL_TOPICS.length} argomenti superati`);
    $$('.js-progress-bar').forEach(el=>el.style.width=(done/window.ALL_TOPICS.length*100)+'%');
    $$('.js-topic-link').forEach(el=>{
      const id=el.dataset.topicId;
      if(p[id]) el.classList.add('done');
      const idx=window.ALL_TOPICS.findIndex(t=>t.id===id);
      if(idx>0 && !p[window.ALL_TOPICS[idx-1].id]) el.classList.add('locked');
    });
  }
  function resetAll(){localStorage.removeItem(KEY);location.reload()}
  window.resetStoriaProgress=resetAll;
  document.addEventListener('DOMContentLoaded',()=>{
    updateProgress();
    const resetBtn=$('#resetProgress'); if(resetBtn) resetBtn.addEventListener('click', resetAll);
    if(!window.QUIZ_DATA || !window.TOPIC_ID)return;
    const form=$('#quizForm'); const result=$('#quizResult'); const next=$('#nextPanel');
    if(isDone(window.TOPIC_ID)){ next?.classList.add('show'); result.className='result good'; result.style.display='block'; result.textContent='Quiz già superato in questa sessione. Puoi ripassare o andare avanti.'; }
    form?.addEventListener('submit',(e)=>{
      e.preventDefault();
      let all=true;
      for(let i=0;i<window.QUIZ_DATA.length;i++){
        const picked=form.querySelector(`input[name="q${i}"]:checked`);
        if(!picked || picked.value!==window.QUIZ_DATA[i].answer){ all=false; break; }
      }
      if(!all){
        form.reset();
        result.className='result bad';
        result.style.display='block';
        result.textContent='Errore: almeno una risposta è sbagliata o mancante. Il quiz ricomincia da capo: devi rifare tutte le domande.';
        next?.classList.remove('show');
        const first=$('.question'); if(first) first.scrollIntoView({behavior:'smooth',block:'start'});
        return;
      }
      mark(window.TOPIC_ID); updateProgress();
      result.className='result good';
      result.style.display='block';
      result.textContent='Quiz superato: tutte le risposte sono corrette. Ora puoi passare al prossimo argomento.';
      next?.classList.add('show');
      next?.scrollIntoView({behavior:'smooth',block:'center'});
    });
  });
})();
