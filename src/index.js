import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
form.addEventListener('submit', onSearch);

const input = document.querySelector('.input');

const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);

let page = 1;
const perPage = 40;

async function onSearch(evt) {
  evt.preventDefault();

  if (input.value) {
    try {
      page = 1;
      clear();
      const response = await pixabayApi(input.value);
      console.log(response);
      if (response.hits < 1) {
        hideBtn();
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        createMarkup(response);
        showBtn();
      }
    } catch (e) {
      console.log(e);
    }
  } else {
    clear();
    hideBtn();
    return Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  }
}

async function pixabayApi(input) {
  const BASE_URL = 'https://pixabay.com/api/';

  const options = {
    params: {
      key: '34337613-2920b37a051b595b5e379f3dc',
      q: input,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: page,
      per_page: perPage,
    },
  };

  try {
    const response = await axios.get(BASE_URL, options);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

async function onLoadMoreBtnClick() {
  page += 1;
  try {
    const response = await pixabayApi(input.value);
    const totalPages = page * perPage;
    console.log(response);
    if (response.totalHits <= totalPages) {
      hideBtn();
      return Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      createMarkup(response);
      showBtn();
    }
  } catch (e) {
    console.log(e);
  }
}

function createMarkup({ hits }) {
  const markup = hits.map(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => `
<div class="photo-card"><a href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  </a>
  <div class="info">
    <p class="info-item">
      <b>Likes: ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views: ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments: ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads: ${downloads}</b>
    </p>
  </div>
</div>`
  );

  gallery.insertAdjacentHTML('beforeend', markup.join(''));
  simpleLightBox.refresh();
}

const simpleLightBox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

function clear() {
  gallery.innerHTML = '';
}

function hideBtn() {
  loadMoreBtn.classList.add('hideBtn');
}

function showBtn() {
  loadMoreBtn.classList.remove('hideBtn');
}
