

//ga

const app = {
  user: 'anon',
  t: Date.now()
};

const load = () => {
  ga('create', 'UA-125183906-1', 'auto');
  ga('send', 'pageview');

  //render
  pdfjsLib.getDocument('./teaser.pdf').then((pdf) => {
    const scale = 4, goal = pdf.numPages;
    let processed = 1;
    for (let i = 0; i < pdf.numPages; i++) {
      const pageNum = i + 1;
      pdf.getPage(pageNum).then((page) => {
        const canvas = document.createElement('canvas');
        canvas.id = 'page-' + pageNum;
        const viewport = page.getViewport(scale);
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        document.getElementById('pdf').appendChild(canvas);
        page.render({
          viewport,
          canvasContext: canvas.getContext('2d'),
        });
        processed++;
        app.pdf = pdf;
        if (processed === goal) setTimeout(() => listen(), 250);
      });
    }
  });
  
  app.user = window.location.search.split('?')[1];
};

const listen = () => {
  console.log('setting listeners');
  const tops = [];
  for (let i = 0; i < app.pdf.numPages; i++) {
    tops.push(document.getElementById('page-' + (i + 1)).getBoundingClientRect().top);
  }
  const pageHeight = tops[1] - tops[0];
  const viewablePages = Math.max(1, Math.floor(window.innerHeight / pageHeight));
  tops.push(tops[tops.length-1] + pageHeight);
  let curPage = 0;
  window.onscroll = () => {
    const y = window.scrollY + window.innerHeight / 4;
    if (y > tops[curPage] && y < tops[curPage + 1]) {
      //do nothing
    } else {
      //record time on page
      if (y > tops[curPage + 1]) {
        //console.log('forward', curPage + viewablePages, Date.now() - app.t);
        ga('send', 'event', app.user, 'forward', curPage + viewablePages, Date.now() - app.t);
        curPage++;
      } else {
        //console.log('back', curPage + viewablePages, Date.now() - app.t);
        ga('send', 'event', app.user, 'back', curPage + viewablePages, Date.now() - app.t);
        curPage--;
      }
      app.t = Date.now();
    }
  };
};

window.onload = load;
window.onresize = listen;