(() => {
 function initialize(){
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('#main-nav');
  if(toggle&&nav&&!toggle.dataset.bound){
    toggle.dataset.bound='true';
    toggle.addEventListener('click',()=>{
      const open=toggle.getAttribute('aria-expanded')==='true';
      toggle.setAttribute('aria-expanded',String(!open));
      toggle.setAttribute('aria-label',open?'메뉴 열기':'메뉴 닫기');
      nav.classList.toggle('is-open',!open);
    });
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{toggle.setAttribute('aria-expanded','false');nav.classList.remove('is-open');}));
  }
  let toastTimer;
  const toast=message=>{const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000);};
  document.querySelectorAll('.copy-email').forEach(button=>{if(button.dataset.bound)return;button.dataset.bound='true';button.addEventListener('click',async()=>{
    try{if(!navigator.clipboard)throw new Error('clipboard unavailable');await navigator.clipboard.writeText(button.dataset.email||'');toast('이메일 주소를 복사했습니다.');}
    catch{toast('복사 권한이 없습니다. 표시된 이메일 주소를 선택해 복사해 주세요.');}
  });});
  document.querySelectorAll('.print-resume').forEach(button=>{if(button.dataset.bound)return;button.dataset.bound='true';button.addEventListener('click',()=>window.print());});
 }
 window.unenInitialize = initialize;
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initialize,{once:true});
 else initialize();
})();
