

//ga

const app = {
  t: Date.now()
};

const user = window.location.search.split('?')[1];
app.user = user ? user : 'anon';

const load = () => {
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
  //ga
  try {
    ga('create', 'UA-125183906-1', 'auto');
    ga('send', 'pageview');
  } catch (e) {}
  //resize listener
  window.onresize = listen;
};

const listen = () => {
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
    } else {
      if (y > tops[curPage + 1]) {
        try {
          ga('send', 'event', app.user, 'forward', curPage + viewablePages, Date.now() - app.t);
        } catch (e) {}
        curPage++;
      } else {
        try {
          ga('send', 'event', app.user, 'back', curPage + viewablePages, Date.now() - app.t);
        } catch (e) {}
        curPage--;
      }
      app.t = Date.now();
    }
  };
};

window.onload = setTimeout(load, 100);