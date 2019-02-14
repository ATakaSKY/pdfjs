const url = 'pdf/Color.pdf';

let pdfDoc = null,
  pageNum = 1,
  pageRendering = false,
  pageNumPending = null,
  scale = 2,
  canvas = document.getElementById('the-canvas'),
  ctx = canvas.getContext('2d');

const renderPage = num => {
  pageRendering = true;

  // Using promise to fetch the page

  pdfDoc.getPage(num).then(page => {
    const viewport = page.getViewport({ scale: scale });

    canvas.height = viewport.height;

    canvas.width = viewport.width;

    // Render PDF page into canvas context

    const renderContext = {
      canvasContext: ctx,

      viewport: viewport
    };

    const renderTask = page.render(renderContext);

    // Wait for rendering to finish

    renderTask.promise.then(() => {
      pageRendering = false;

      if (pageNumPending !== null) {
        // New page rendering is pending

        renderPage(pageNumPending);

        pageNumPending = null;
      }
    });
  });

  // Update page counters

  document.getElementById('page_num').textContent = num;
};

const queueRenderPage = num => {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
};

const onPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }

  pageNum--;

  queueRenderPage(pageNum);
};

const onNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }

  pageNum++;

  queueRenderPage(pageNum);
};

document.getElementById('prev').addEventListener('click', onPrevPage);
document.getElementById('next').addEventListener('click', onNextPage);

const loadingTask = pdfjsLib.getDocument(url);

loadingTask.promise
  .then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;

    document.getElementById('page_count').textContent = pdfDoc.numPages;

    // Initial/first page rendering

    renderPage(pageNum);
  })
  .catch(err => {
    console.log(err);
    const errorDiv = document.createElement('div');
    const textNode = document.createTextNode(err.message);
    errorDiv.className = 'error-message';
    errorDiv.appendChild(textNode);
    document
      .querySelector('body')
      .insertBefore(errorDiv, document.querySelector('.canvas'));
    document.querySelector('.navigate').style.display = 'none';
    document.querySelector('.canvas').style.display = 'none';
  });
